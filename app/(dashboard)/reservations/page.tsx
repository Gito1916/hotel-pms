import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  checked_in: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
}

export default async function ReservationsPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const reservations = await db.query.reservations.findMany({
    where: eq(schema.reservations.organizationId, session.user.organizationId),
    orderBy: [desc(schema.reservations.checkInDate)],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          <p className="text-muted-foreground">Manage bookings and reservations</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reservations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reservations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first reservation to get started</p>
              <Button asChild>
                <Link href="/dashboard/reservations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Reservation
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{reservation.guestName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[reservation.status]}`}>
                        {reservation.status.replace("_", " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reservation.nights} night{reservation.nights !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>{" "}
                    {formatDate(reservation.checkInDate)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>{" "}
                    {formatDate(reservation.checkOutDate)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Guests:</span>{" "}
                    {reservation.adults} adult{reservation.adults !== 1 ? "s" : ""}{" "}
                    {reservation.children > 0 && `+ ${reservation.children} child${reservation.children !== 1 ? "ren" : ""}`}
                  </div>
                  {reservation.specialRequests && (
                    <div>
                      <span className="text-muted-foreground">Special requests:</span>{" "}
                      <span className="ml-1">{reservation.specialRequests}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
