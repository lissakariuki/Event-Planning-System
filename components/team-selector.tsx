"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeam } from "@/contexts/team-context"
import { ChevronDown, PlusCircle, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function TeamSelector() {
  const { teams, currentTeam, setCurrentTeam, createTeam } = useTeam()
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "" })

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      createTeam(newTeam.name, newTeam.description)
      setNewTeam({ name: "", description: "" })
      setIsCreateTeamOpen(false)
    }
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {currentTeam ? currentTeam.name : "Select Team"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Your Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={currentTeam?.id === team.id ? "bg-accent" : ""}
            >
              {team.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Team
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-description">Description (Optional)</Label>
                  <Input
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="Enter team description"
                  />
                </div>
              </div>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

