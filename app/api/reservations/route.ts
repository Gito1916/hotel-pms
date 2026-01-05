import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reservations = await db.query.reservations.findMany({
      where: eq(schema.reservations.organizationId, session.user.organizationId),
      orderBy: [schema.reservations.checkInDate],
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Failed to fetch reservations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      guestName,
      guestPhone,
      guestEmail,
      roomId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      specialRequests,
    } = body

    if (!guestName || !guestPhone || !roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      )
    }

    const room = await db.query.rooms.findFirst({
      where: eq(schema.rooms.id, roomId),
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const totalAmount = room.basePrice * nights

    const reservation = await db
      .insert(schema.reservations)
      .values({
        id: uuidv4(),
        organizationId: session.user.organizationId,
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        roomId,
        checkInDate: checkIn.getTime(),
        checkOutDate: checkOut.getTime(),
        nights,
        adults: adults || 1,
        children: children || 0,
        totalAmount,
        amountPaid: 0,
        outstandingBalance: totalAmount,
        status: "pending",
        source: "walk_in",
        specialRequests: specialRequests || null,
      })
      .returning()

    return NextResponse.json(reservation[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create reservation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
