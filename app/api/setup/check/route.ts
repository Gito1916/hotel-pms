import { NextResponse } from "next/server"
import { db, schema } from "@/lib/db"

export async function GET() {
  try {
    const org = await db.query.organizations.findFirst()
    
    return NextResponse.json({
      setup: !!org,
    })
  } catch (error) {
    return NextResponse.json({ setup: false })
  }
}
