"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/contexts/team-context"
import { TeamCreationForm } from "@/components/team-creation-form"
import { Users, Plus, Loader2 } from "lucide-react"
import { AlertDisplay } from "@/components/ui/alert-display"

export default function TeamsPage() {
  const router = useRouter()
  const { teams, isLoading, error } = useTeam()
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)

  const navigateToTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading teams...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={() => setIsCreateTeamOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Team
        </Button>
      </div>

      <AlertDisplay message={error} />

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToTeam(team.id)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.members.length} members</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{team.description || "No description provided."}</p>
              <div className="mt-4 text-xs text-gray-500">Created {team.createdAt.toLocaleDateString()}</div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-6">Create your first team to get started</p>
          <Button onClick={() => setIsCreateTeamOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create New Team
          </Button>
        </div>
      )}

      {/* Team Creation Form */}
      <TeamCreationForm isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </div>
  )
}

