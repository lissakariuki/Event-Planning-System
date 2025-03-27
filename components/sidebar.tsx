"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, DollarSign, Users, Calendar, MessageCircle, CheckSquare, Music, PlusCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/contexts/team-context"
import { TeamCreationForm } from "@/components/team-creation-form"

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const currentTeamId = params.id as string

  const { teams } = useTeam()
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-full shadow-md flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">EPS</h1>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">TEAMS</h2>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsCreateTeamOpen(true)}>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>

        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className={cn(
              "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md",
              pathname.startsWith("/teams/") && currentTeamId === team.id && "bg-gray-200 dark:bg-gray-800",
            )}
          >
            {team.name}
          </Link>
        ))}

        <Link
          href="/teams"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md",
            pathname === "/teams" && !currentTeamId && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          All Teams
        </Link>
      </div>

      <nav className="mt-4 flex-1">
        <Link
          href="/"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <Home className="mr-2" size={20} />
          Dashboard
        </Link>
        <Link
          href="/events"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/events" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <Music className="mr-2" size={20} />
          Events
        </Link>
        <Link
          href="/budget"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/budget" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <DollarSign className="mr-2" size={20} />
          Budget
        </Link>
        <Link
          href="/vendors"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/vendors" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <Users className="mr-2" size={20} />
          Vendors
        </Link>
        <Link
          href="/guests"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/guests" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <Users className="mr-2" size={20} />
          Guests
        </Link>
        <Link
          href="/calendar"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/calendar" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <Calendar className="mr-2" size={20} />
          Calendar
        </Link>
        <Link
          href="/tasks"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/tasks" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <CheckSquare className="mr-2" size={20} />
          Tasks
        </Link>
        <Link
          href="/documents"
          className={cn(
            "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
            pathname === "/documents" && "bg-gray-200 dark:bg-gray-800",
          )}
        >
          <FileText className="mr-2" size={20} />
          Documents
        </Link>
      </nav>

      <div className="p-4">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md flex items-center justify-center">
          <MessageCircle className="mr-2" size={20} />
          Chat Assistant
        </button>
      </div>

      {/* Team Creation Form */}
      <TeamCreationForm isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </div>
  )
}

