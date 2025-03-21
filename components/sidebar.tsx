"use client"

import Link from "next/link"
import {
  Home,
  DollarSign,
  Users,
  Calendar,
  MessageCircle,
  CheckSquare,
  Music,
  UserPlus,
  PlusCircle,
} from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function Sidebar() {
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
    <div className="w-64 bg-white dark:bg-gray-900 h-full shadow-md flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">EPS</h1>
      </div>

      {/* Teams Section */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">TEAMS</h2>
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <PlusCircle className="h-4 w-4" />
              </Button>
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
        </div>
        <div className="space-y-1 mb-4">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={`w-full text-left px-2 py-1 rounded-md text-sm ${
                currentTeam?.id === team.id
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <Link
          href="/"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Home className="mr-2" size={20} />
          Dashboard
        </Link>
        <Link
          href="/events"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Music className="mr-2" size={20} />
          Events
        </Link>
        <Link
          href="/budget"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <DollarSign className="mr-2" size={20} />
          Budget
        </Link>
        <Link
          href="/vendors"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Users className="mr-2" size={20} />
          Vendors
        </Link>
        <Link
          href="/guests"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Users className="mr-2" size={20} />
          Guests
        </Link>
        <Link
          href="/calendar"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Calendar className="mr-2" size={20} />
          Calendar
        </Link>
        <Link
          href="/tasks"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <CheckSquare className="mr-2" size={20} />
          Tasks
        </Link>
        <Link
          href="/team-members"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <UserPlus className="mr-2" size={20} />
          Team Members
        </Link>
      </nav>
      <div className="p-4">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md flex items-center justify-center">
          <MessageCircle className="mr-2" size={20} />
          Chat Assistant
        </button>
      </div>
    </div>
  )
}

