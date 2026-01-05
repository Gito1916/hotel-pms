import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelName, adminEmail, adminPassword, adminName } = body

    if (!hotelName || !adminEmail || !adminPassword || !adminName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingOrg = await db.query.organizations.findFirst()
    if (existingOrg) {
      return NextResponse.json(
        { error: "System already initialized" },
        { status: 400 }
      )
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, adminEmail),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10)

    const orgId = uuidv4()
    const userId = uuidv4()

    await db.transaction(async (tx) => {
      const org = await tx
        .insert(schema.organizations)
        .values({
          id: orgId,
          name: hotelName,
          currencyCode: "NGN",
          currencySymbol: "₦",
        })
        .returning()

      await tx.insert(schema.users).values({
        id: userId,
        email: adminEmail,
        passwordHash,
        role: "admin",
        organizationId: orgId,
        isActive: true,
        mustChangePassword: false,
      })
    })

    return NextResponse.json(
      { success: true, message: "Setup completed successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Setup failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
