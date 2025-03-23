"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Users } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { TeamCard } from "@/components/team-card"
import { TeamCreationForm } from "@/components/team-creation-form"

export default function TeamsPage() {
  const { teams } = useTeam()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Teams</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button onClick={() => setIsCreateTeamOpen(true)} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>
      </div>

      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No teams found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? `No teams match your search for "${searchTerm}". Try a different search term or create a new team.`
                : "You don't have any teams yet. Create your first team to start collaborating."}
            </p>
            <Button onClick={() => setIsCreateTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create New Team
            </Button>
          </div>
        </Card>
      )}

      {/* Team Creation Form */}
      <TeamCreationForm isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </div>
  )
}

