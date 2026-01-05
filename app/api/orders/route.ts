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

    const orders = await db.query.orders.findMany({
      where: eq(schema.orders.organizationId, session.user.organizationId),
      with: {
        service: true,
        room: true,
      },
      orderBy: [schema.orders.orderDate],
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
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
    const { serviceId, roomId, guestId, paymentMethod, notes } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const service = await db.query.services.findFirst({
      where: eq(schema.services.id, serviceId),
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const order = await db
      .insert(schema.orders)
      .values({
        id: uuidv4(),
        organizationId: session.user.organizationId,
        serviceId,
        roomId: roomId || null,
        guestId: guestId || null,
        status: "pending",
        amount: service.basePrice,
        paymentMethod: paymentMethod || "immediate",
        notes: notes || null,
      })
      .returning()

    if (paymentMethod === "room_tab" && guestId) {
      await db.insert(schema.guestTab).values({
        id: uuidv4(),
        organizationId: session.user.organizationId,
        guestId,
        serviceId,
        orderId: order[0].id,
        amount: service.basePrice,
        isPaid: false,
      })
    }

    return NextResponse.json(order[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
