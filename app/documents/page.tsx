"use client"

import { useState, useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import { DocumentList } from "@/components/document-list"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentsPage() {
  const { teams, currentTeam, setCurrentTeam } = useTeam()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

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

  // Get events for the selected team
  const teamEvents = currentTeam?.events || []

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    setSelectedEventId(null)
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documents</h1>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
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
        </div>
      </Card>

      {selectedTeamId ? (
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team">Team Documents</TabsTrigger>
            <TabsTrigger value="events" disabled={teamEvents.length === 0}>
              Event Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <DocumentList teamId={selectedTeamId} />
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="w-full md:w-64">
                <label className="text-sm font-medium mb-1 block">Select Event</label>
                <Select
                  value={selectedEventId || ""}
                  onValueChange={setSelectedEventId}
                  disabled={teamEvents.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEventId && <DocumentList teamId={selectedTeamId} eventId={selectedEventId} />}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No team selected</p>
          <p className="text-sm text-gray-400 mt-2">Select a team to view and manage documents</p>
        </Card>
      )}
    </div>
  )
}

