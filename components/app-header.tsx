"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Calendar, ClipboardList, Users, Home, FileText, DollarSign, UserPlus, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Tasks", href: "/tasks", icon: ClipboardList },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Guests", href: "/guests", icon: UserPlus },
  { name: "Vendors", href: "/vendors", icon: Store },
]

export function AppHeader() {
  const pathname = usePathname()
  const isMobile = useMobile()

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg" data-cy="dashboard-header">
              Event Planner
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100",
              )}
              data-cy={`nav-${item.name.toLowerCase()}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {isMobile && (
        <nav className="flex overflow-x-auto py-2 px-4 space-x-1 border-t">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1 text-xs font-medium rounded-md min-w-[4rem]",
                  isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100",
                )}
                data-cy={`mobile-nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}

