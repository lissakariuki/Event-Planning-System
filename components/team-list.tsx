"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Team } from "@/types"
import { CalendarDays, Users, ListTodo } from "lucide-react"

interface TeamsListProps {
  teams: Team[]
}

export function TeamsList({ teams }: TeamsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-cy="teams-list">
      {teams.map((team) => (
        <Card key={team.id} className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{team.name}</h3>
            </div>
            <p className="text-muted-foreground mb-4 line-clamp-2">{team.description || "No description provided"}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{team.active_members || 0} members</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>{team.upcoming_events || 0} upcoming events</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ListTodo className="mr-2 h-4 w-4" />
                <span>
                  Budget: ${team.budget_current?.toLocaleString()} / ${team.budget_total?.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Link href={`/teams/${team.id}`} className="w-full">
              <Button variant="default" className="w-full">
                View Team
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

