"use client"

import { useState, useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TasksPage() {
  const { teams, currentTeam, setCurrentTeam } = useTeam()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  // Set initial team only once when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      const initialTeamId = teams[0].id
      setSelectedTeamId(initialTeamId)

      // Only set current team if it's different from the current one
      if (!currentTeam || currentTeam.id !== initialTeamId) {
        const team = teams.find((t) => t.id === initialTeamId)
        if (team) {
          setCurrentTeam(team)
        }
      }
    }
  }, [teams, selectedTeamId, currentTeam, setCurrentTeam])

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
    }
  }

  const handleCreateTask = () => {
    setShowTaskForm(true)
  }

  const handleTaskCreated = () => {
    setShowTaskForm(false)
  }

  const handleCancelCreate = () => {
    setShowTaskForm(false)
  }

  return (
    <div className="space-y-6 pb-20 relative mt-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="hidden sm:block">
          {selectedTeamId && !showTaskForm && (
            <Button onClick={handleCreateTask}
              size="default"
              className="transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="w-full md:w-64">
            <label className="text-sm font-medium mb-1 block">Select Team</label>
            <Select value={selectedTeamId || ""} onValueChange={handleTeamChange} disabled={teams.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showTaskForm && selectedTeamId && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <TaskForm teamId={selectedTeamId} onTaskCreated={handleTaskCreated} onCancel={handleCancelCreate} />
          </CardContent>
        </Card>
      )}

      {selectedTeamId && <TaskList teamId={selectedTeamId} />}
    </div>
  )
}

