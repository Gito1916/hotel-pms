import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and, sql, desc } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Phone, UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"

export default async function GuestsPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const [checkedInGuests, activeReservations] = await Promise.all([
    db.query.guests.findMany({
      where: and(
        eq(schema.guests.organizationId, session.user.organizationId),
        eq(schema.guests.isCheckedIn, true),
        eq(schema.guests.isCheckedOut, false)
      ),
      with: {
        room: true,
      },
      orderBy: [desc(schema.guests.checkInDate)],
    }),

    db.query.reservations.findMany({
      where: and(
        eq(schema.reservations.organizationId, session.user.organizationId),
        sql`${schema.reservations.status} in ('pending', 'confirmed')`
      ),
      orderBy: [desc(schema.reservations.checkInDate)],
    }),
  ])

  const totalCheckedIn = checkedInGuests.length
  const totalActiveReservations = activeReservations.length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Guest Management</h2>
          <p className="text-muted-foreground">Manage guests, check-ins, and check-outs</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked-in Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">Currently staying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveReservations}</div>
            <p className="text-xs text-muted-foreground">Pending check-ins</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search guests by name, phone, or room..." className="pl-8" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Checked-in Guests</h3>
        {checkedInGuests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No checked-in guests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checkedInGuests.map((guest) => (
              <Card key={guest.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{guest.name}</span>
                    <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Room {guest.room?.roomNumber}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    {guest.phone}
                  </div>
                  {guest.email && (
                    <div className="text-sm text-muted-foreground">{guest.email}</div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Checked in: {formatDate(guest.checkInDate)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Guests:</span> {guest.numGuests}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
