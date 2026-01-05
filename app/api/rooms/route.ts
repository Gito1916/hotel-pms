import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await db.query.rooms.findMany({
      where: eq(schema.rooms.organizationId, session.user.organizationId),
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Failed to fetch rooms:", error)
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
    const { roomNumber, floor, roomType, basePrice, taxRate, maxGuests } = body

    if (!roomNumber || !floor || !roomType || !basePrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingRoom = await db.query.rooms.findFirst({
      where: eq(schema.rooms.roomNumber, roomNumber),
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: "Room number already exists" },
        { status: 400 }
      )
    }

    const newRoom = await db
      .insert(schema.rooms)
      .values({
        id: uuidv4(),
        organizationId: session.user.organizationId,
        roomNumber,
        floor: floor || 1,
        roomType,
        basePrice,
        taxRate: taxRate || 7.5,
        maxGuests: maxGuests || 2,
        status: "available",
      })
      .returning()

    return NextResponse.json(newRoom[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
