import { auth } from "@/lib/auth"
import { db, schema } from "@/lib/db"
import { eq, and, gte, sql } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session?.user?.organizationId) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    todayRevenue,
    monthRevenue,
    todayExpenses,
    monthExpenses,
  ] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.organizationId, session.user.organizationId),
          eq(schema.transactions.type, "payment"),
          gte(schema.transactions.createdAt, today.getTime())
        )
      ),

    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.organizationId, session.user.organizationId),
          eq(schema.transactions.type, "payment"),
          gte(schema.transactions.createdAt, startOfMonth.getTime())
        )
      ),

    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.organizationId, session.user.organizationId),
          gte(schema.expenses.recordedAt, today.getTime())
        )
      ),

    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.organizationId, session.user.organizationId),
          gte(schema.expenses.recordedAt, startOfMonth.getTime())
        )
      ),
  ])

  const todayRevenueAmount = todayRevenue[0]?.total || 0
  const monthRevenueAmount = monthRevenue[0]?.total || 0
  const todayExpensesAmount = todayExpenses[0]?.total || 0
  const monthExpensesAmount = monthExpenses[0]?.total || 0

  const todayProfit = todayRevenueAmount - todayExpensesAmount
  const monthProfit = monthRevenueAmount - monthExpensesAmount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Financial overview and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayRevenueAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthRevenueAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayExpensesAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month's Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthExpensesAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(todayProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month's Profit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(monthProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Daily Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export today's financial data
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Monthly Report</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export this month's financial data
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Custom Range</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export data for a specific date range
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
