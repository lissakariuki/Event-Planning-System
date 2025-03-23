"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  Home,
  DollarSign,
  Users,
  Calendar,
  MessageCircle,
  CheckSquare,
  Music,
  PlusCircle,
  Settings,
  Store,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/contexts/team-context"
import { TeamCreationForm } from "@/components/team-creation-form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const currentTeamId = params.id as string

  const { teams } = useTeam()
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isTeamsOpen, setIsTeamsOpen] = useState(true)

  return (
    <div className="w-64 bg-sidebar-bg text-sidebar-fg h-full shadow-md flex flex-col border-r border-border">
      <div className="p-4 flex items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          EPS
        </Link>
        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Beta</span>
      </div>

      <div className="px-3 py-2">
        <Collapsible open={isTeamsOpen} onOpenChange={setIsTeamsOpen} className="space-y-1">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-sm font-semibold rounded-md hover:bg-sidebar-hover">
            <span>TEAMS</span>
            {isTeamsOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={cn(
                  "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
                  pathname.startsWith("/teams/") && currentTeamId === team.id
                    ? "bg-sidebar-active text-sidebar-active-fg font-medium"
                    : "text-sidebar-fg",
                )}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage
                    src={team.budget?.logo || `/placeholder.svg?text=${team.name.charAt(0)}`}
                    alt={team.name}
                  />
                  <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{team.name}</span>
              </Link>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto hover:bg-sidebar-hover"
              onClick={() => setIsCreateTeamOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Team
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <nav className="mt-4 flex-1 px-3 space-y-1">
        <Link
          href="/"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Home className="mr-2" size={18} />
          Dashboard
        </Link>
        <Link
          href="/events"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/events" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Music className="mr-2" size={18} />
          Events
        </Link>
        <Link
          href="/budget"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/budget" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <DollarSign className="mr-2" size={18} />
          Budget
        </Link>
        <Link
          href="/vendors"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/vendors" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Store className="mr-2" size={18} />
          Vendors
        </Link>
        <Link
          href="/guests"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/guests" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Users className="mr-2" size={18} />
          Guests
        </Link>
        <Link
          href="/calendar"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/calendar" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Calendar className="mr-2" size={18} />
          Calendar
        </Link>
        <Link
          href="/tasks"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/tasks" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <CheckSquare className="mr-2" size={18} />
          Tasks
        </Link>
        <Link
          href="/teams"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/teams" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Users className="mr-2" size={18} />
          Team Members
        </Link>
        <Link
          href="/documents"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/documents" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <FileText className="mr-2" size={18} />
          Documents
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-hover",
            pathname === "/settings" ? "bg-sidebar-active text-sidebar-active-fg font-medium" : "text-sidebar-fg",
          )}
        >
          <Settings className="mr-2" size={18} />
          Settings
        </Link>
      </nav>

      <div className="p-3 mt-auto">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <MessageCircle className="mr-2" size={18} />
          Chat Assistant
        </Button>
      </div>

      {/* Team Creation Form */}
      <TeamCreationForm isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </div>
  )
}

