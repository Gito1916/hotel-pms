import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and, count, sql, gte } from "drizzle-orm"
import { 
  DoorOpen, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const orgId = session.user.organizationId
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    totalRooms,
    occupiedRooms,
    todayCheckIns,
    todayCheckOuts,
    todayRevenue,
    activeReservations,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.rooms)
      .where(eq(schema.rooms.organizationId, orgId)),
    
    db
      .select({ count: count() })
      .from(schema.rooms)
      .where(
        and(
          eq(schema.rooms.organizationId, orgId),
          eq(schema.rooms.status, "occupied")
        )
      ),
    
    db
      .select({ count: count() })
      .from(schema.reservations)
      .where(
        and(
          eq(schema.reservations.organizationId, orgId),
          eq(schema.reservations.status, "checked_in"),
          gte(schema.reservations.checkInDate, today.getTime())
        )
      ),
    
    db
      .select({ count: count() })
      .from(schema.guests)
      .where(
        and(
          eq(schema.guests.organizationId, orgId),
          eq(schema.guests.isCheckedOut, false),
          sql`${schema.guests.checkOutDate} >= ${today.getTime()}`
        )
      ),
    
    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.organizationId, orgId),
          gte(schema.transactions.createdAt, today.getTime())
        )
      ),
    
    db
      .select({ count: count() })
      .from(schema.reservations)
      .where(
        and(
          eq(schema.reservations.organizationId, orgId),
          eq(schema.reservations.status, "confirmed"),
          gte(schema.reservations.checkInDate, today.getTime())
        )
      ),
  ])

  const totalRoomsCount = totalRooms[0]?.count || 0
  const occupiedRoomsCount = occupiedRooms[0]?.count || 0
  const occupancyRate = totalRoomsCount > 0 
    ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) 
    : 0

  const stats = [
    {
      title: "Total Rooms",
      value: totalRoomsCount,
      icon: DoorOpen,
      trend: null,
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: Users,
      trend: occupancyRate > 70 ? "up" : occupancyRate < 50 ? "down" : null,
    },
    {
      title: "Revenue Today",
      value: formatCurrency(todayRevenue[0]?.total || 0),
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Active Reservations",
      value: activeReservations[0]?.count || 0,
      icon: Calendar,
      trend: null,
    },
  ]

  const quickActions = [
    {
      title: "Pending Check-ins",
      count: todayCheckIns[0]?.count || 0,
      icon: ArrowUpRight,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      href: "/dashboard/reservations",
    },
    {
      title: "Pending Check-outs",
      count: todayCheckOuts[0]?.count || 0,
      icon: ArrowDownRight,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      href: "/dashboard/guests",
    },
    {
      title: "Active Guests",
      count: occupiedRoomsCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      href: "/dashboard/guests",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your hotel performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.trend === "up" && (
                      <span className="text-green-600">+2.5%</span>
                    )}
                    {stat.trend === "down" && (
                      <span className="text-red-600">-1.2%</span>
                    )}
                    {" "}from yesterday
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-4 w-4 ${action.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{action.count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {todayCheckIns[0]?.count || 0} guests checked in today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Check-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {todayCheckOuts[0]?.count || 0} guests scheduled to check out
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
