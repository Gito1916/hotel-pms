import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const room = await db.query.rooms.findFirst({
      where: and(
        eq(schema.rooms.id, params.id),
        eq(schema.rooms.organizationId, session.user.organizationId)
      ),
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("Failed to fetch room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const room = await db.query.rooms.findFirst({
      where: and(
        eq(schema.rooms.id, params.id),
        eq(schema.rooms.organizationId, session.user.organizationId)
      ),
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const updatedRoom = await db
      .update(schema.rooms)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(schema.rooms.id, params.id))
      .returning()

    return NextResponse.json(updatedRoom[0])
  } catch (error) {
    console.error("Failed to update room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const room = await db.query.rooms.findFirst({
      where: and(
        eq(schema.rooms.id, params.id),
        eq(schema.rooms.organizationId, session.user.organizationId)
      ),
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room.status === "occupied") {
      return NextResponse.json(
        { error: "Cannot delete occupied room" },
        { status: 400 }
      )
    }

    await db.delete(schema.rooms).where(eq(schema.rooms.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
