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

    const services = await db.query.services.findMany({
      where: eq(schema.services.organizationId, session.user.organizationId),
      orderBy: [schema.services.name],
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Failed to fetch services:", error)
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
    const { name, type, basePrice, taxRate, description } = body

    if (!name || !type || !basePrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const service = await db
      .insert(schema.services)
      .values({
        id: uuidv4(),
        organizationId: session.user.organizationId,
        name,
        type,
        basePrice,
        taxRate: taxRate || 7.5,
        description: description || null,
        isActive: true,
      })
      .returning()

    return NextResponse.json(service[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
