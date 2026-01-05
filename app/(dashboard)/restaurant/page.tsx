import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and, desc, gte } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Clock, CheckCircle, DollarSign, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"

const orderStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

export default async function RestaurantPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [services, orders, stats] = await Promise.all([
    db.query.services.findMany({
      where: and(
        eq(schema.services.organizationId, session.user.organizationId),
        eq(schema.services.isActive, true)
      ),
    }),

    db.query.orders.findMany({
      where: eq(schema.orders.organizationId, session.user.organizationId),
      with: {
        service: true,
        room: true,
      },
      orderBy: [desc(schema.orders.orderDate)],
      limit: 50,
    }),

    Promise.all([
      db
        .select({ total: sql<number>`coalesce(sum(amount), 0)` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.organizationId, session.user.organizationId),
            gte(schema.orders.orderDate, today.getTime())
          )
        ),

      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.organizationId, session.user.organizationId),
            eq(schema.orders.status, "pending")
          )
        ),

      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(
          and(
            eq(schema.orders.organizationId, session.user.organizationId),
            eq(schema.orders.status, "delivered"),
            gte(schema.orders.orderDate, today.getTime())
          )
        ),
    ]),
  ])

  const revenueToday = stats[0][0]?.total || 0
  const pendingOrders = stats[1][0]?.count || 0
  const deliveredToday = stats[2][0]?.count || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Restaurant & Services</h2>
          <p className="text-muted-foreground">Manage food orders and services</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/restaurant/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueToday)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Services</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{order.service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.room ? `Room ${order.room.roomNumber}` : "Restaurant"} •{" "}
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{formatCurrency(order.amount)}</div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${orderStatusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services available</p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {service.type}
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(service.basePrice)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
