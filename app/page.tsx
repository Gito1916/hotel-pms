import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"

export default async function Home() {
  const session = await auth()
  
  const org = await db.query.organizations.findFirst()
  
  if (!org) {
    redirect("/setup")
  }
  
  if (session) {
    redirect("/dashboard")
  }
  
  redirect("/login")
}
