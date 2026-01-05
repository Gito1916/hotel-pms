"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  Calendar,
  Utensils,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface SidebarProps {
  user: {
    email: string
    role: string
  }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "frontdesk", "restaurant"] },
  { name: "Guests", href: "/dashboard/guests", icon: Users, roles: ["admin", "frontdesk"] },
  { name: "Rooms", href: "/dashboard/rooms", icon: DoorOpen, roles: ["admin", "frontdesk"] },
  { name: "Reservations", href: "/dashboard/reservations", icon: Calendar, roles: ["admin", "frontdesk"] },
  { name: "Restaurant", href: "/dashboard/restaurant", icon: Utensils, roles: ["admin", "restaurant", "frontdesk"] },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["owner", "admin"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <DoorOpen className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">Hotel PMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-red-600 hover:text-red-700", collapsed && "justify-center px-2")}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
