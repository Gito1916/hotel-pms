import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, asc } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Bed, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

const statusColors = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  occupied: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  dirty: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  out_of_service: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const roomTypeLabels = {
  single: "Single",
  double: "Double",
  suite: "Suite",
  deluxe: "Deluxe",
}

export default async function RoomsPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const rooms = await db.query.rooms.findMany({
    where: eq(schema.rooms.organizationId, session.user.organizationId),
    orderBy: [asc(schema.rooms.floor), asc(schema.rooms.roomNumber)],
  })

  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor
    if (!acc[floor]) {
      acc[floor] = []
    }
    acc[floor].push(room)
    return acc
  }, {} as Record<number, typeof rooms>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground">Manage room status and availability</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Link>
        </Button>
      </div>

      {Object.entries(roomsByFloor)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([floor, floorRooms]) => (
          <Card key={floor}>
            <CardHeader>
              <CardTitle>Floor {floor}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floorRooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/dashboard/rooms/${room.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[room.status]}`}>
                            {room.status.replace("_", " ")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Bed className="mr-2 h-4 w-4" />
                          {roomTypeLabels[room.roomType]}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          Max {room.maxGuests} guests
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <MapPin className="mr-2 h-4 w-4" />
                          {formatCurrency(room.basePrice)}/night
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

      {rooms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bed className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No rooms yet</h3>
            <p className="text-muted-foreground mb-4">Add your first room to get started</p>
            <Button asChild>
              <Link href="/dashboard/rooms/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
