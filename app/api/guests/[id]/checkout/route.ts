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
    const { paymentMethod, additionalPayment } = body

    const guest = await db.query.guests.findFirst({
      where: and(
        eq(schema.guests.id, params.id),
        eq(schema.guests.organizationId, session.user.organizationId)
      ),
      with: {
        room: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    if (!guest.isCheckedIn || guest.isCheckedOut) {
      return NextResponse.json(
        { error: "Guest is not checked in or already checked out" },
        { status: 400 }
      )
    }

    const guestTabItems = await db.query.guestTab.findMany({
      where: and(
        eq(schema.guestTab.guestId, params.id),
        eq(schema.guestTab.isPaid, false)
      ),
    })

    const outstandingBalance = guestTabItems.reduce(
      (sum, item) => sum + item.amount,
      0
    )

    if (outstandingBalance > 0 && !additionalPayment) {
      return NextResponse.json(
        {
          error: "Outstanding balance exists",
          outstandingBalance,
        },
        { status: 400 }
      )
    }

    await db.transaction(async (tx) => {
      await tx
        .update(schema.guests)
        .set({
          isCheckedOut: true,
          checkOutDate: Date.now(),
        })
        .where(eq(schema.guests.id, params.id))

      await tx
        .update(schema.rooms)
        .set({ status: "dirty" })
        .where(eq(schema.rooms.id, guest.roomId))

      if (additionalPayment && additionalPayment > 0) {
        await tx.insert(schema.transactions).values({
          id: uuidv4(),
          organizationId: session.user.organizationId,
          type: "payment",
          method: paymentMethod,
          amount: additionalPayment,
          guestId: params.id,
          description: "Check-out payment",
        })
      }

      if (guestTabItems.length > 0) {
        for (const item of guestTabItems) {
          await tx
            .update(schema.guestTab)
            .set({ isPaid: true, paidAt: Date.now() })
            .where(eq(schema.guestTab.id, item.id))
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to check out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
