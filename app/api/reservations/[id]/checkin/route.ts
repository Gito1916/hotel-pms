import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { guestName, guestPhone, guestEmail, numGuests, paymentMethod, amountPaid } = body

    if (!guestName || !guestPhone || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const reservation = await db.query.reservations.findFirst({
      where: and(
        eq(schema.reservations.id, params.id),
        eq(schema.reservations.organizationId, session.user.organizationId)
      ),
      with: {
        room: true,
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    if (reservation.room.status !== "available") {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      )
    }

    const guestId = uuidv4()
    const paidAmount = amountPaid || 0
    const outstandingBalance = reservation.totalAmount - paidAmount

    await db.transaction(async (tx) => {
      const guest = await tx
        .insert(schema.guests)
        .values({
          id: guestId,
          organizationId: session.user.organizationId,
          name: guestName,
          phone: guestPhone,
          email: guestEmail || null,
          roomId: reservation.roomId,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          numGuests: numGuests || 1,
          isCheckedIn: true,
          isCheckedOut: false,
        })
        .returning()

      await tx
        .update(schema.rooms)
        .set({ status: "occupied" })
        .where(eq(schema.rooms.id, reservation.roomId))

      await tx
        .update(schema.reservations)
        .set({ status: "checked_in" })
        .where(eq(schema.reservations.id, params.id))

      if (paidAmount > 0) {
        await tx.insert(schema.transactions).values({
          id: uuidv4(),
          organizationId: session.user.organizationId,
          type: "payment",
          method: paymentMethod,
          amount: paidAmount,
          reservationId: params.id,
          guestId,
          description: "Check-in payment",
        })
      }

      if (outstandingBalance > 0) {
        await tx
          .update(schema.reservations)
          .set({
            amountPaid: paidAmount,
            outstandingBalance,
          })
          .where(eq(schema.reservations.id, params.id))
      }
    })

    return NextResponse.json({ success: true, guestId })
  } catch (error) {
    console.error("Failed to check in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
