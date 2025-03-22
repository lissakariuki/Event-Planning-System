"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Users } from "lucide-react"
import { TeamCard } from "@/components/team-card"

// Mock data for teams
const mockTeams = [
  {
    id: 1,
    name: "Wedding Planning Team",
    description: "Team responsible for planning and executing wedding events",
    members: 5,
    events: 3,
    role: "Admin",
  },
  {
    id: 2,
    name: "Corporate Events",
    description: "Team handling all corporate events and conferences",
    members: 8,
    events: 12,
    role: "Member",
  },
  {
    id: 3,
    name: "Music Festival Crew",
    description: "Team organizing music festivals and concerts",
    members: 15,
    events: 6,
    role: "Member",
  },
]

export default function TeamsPage() {
  const [teams, setTeams] = useState(mockTeams)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "" })

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      const team = {
        id: Date.now(),
        name: newTeam.name,
        description: newTeam.description,
        members: 1,
        events: 0,
        role: "Admin",
      }
      setTeams([...teams, team])
      setNewTeam({ name: "", description: "" })
      setIsCreateTeamOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teams</h1>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team-name" className="text-right">
                    Team Name
                  </Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Link key={team.id} href={`/team-members/${team.id}`}>
            <TeamCard team={team} />
          </Link>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card className="p-6 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No teams found</h3>
          <p className="mt-2 text-sm text-gray-500">Create a new team to get started with collaboration.</p>
          <Button className="mt-4" onClick={() => setIsCreateTeamOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </Card>
      )}
    </div>
  )
}

