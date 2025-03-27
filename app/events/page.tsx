"use client"

import { useState, useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Plus } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { EventForm } from "@/components/event-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function EventsPage() {
  const { teams, currentTeam, setCurrentTeam } = useTeam()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  // Track scroll position to adjust button styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
    }
  }

  const handleCreateEvent = () => {
    setShowEventForm(true)
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleEventCreated = () => {
    setShowEventForm(false)
  }

  const handleCancelCreate = () => {
    setShowEventForm(false)
  }

  return (
    <div className="space-y-6 pb-20 relative mt-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-3xl font-bold">Events</h1>
      <div className="hidden sm:block">
        {selectedTeamId && !showEventForm && (
        <Button
          onClick={handleCreateEvent}
          size="default"
          className="transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Event
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

      {showEventForm && selectedTeamId && (
        <Card className="border-2 border-primary/20 shadow-lg animate-in fade-in duration-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <EventForm teamId={selectedTeamId} onEventCreated={handleEventCreated} onCancel={handleCancelCreate} />
          </CardContent>
        </Card>
      )}

      {selectedTeamId && currentTeam && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTeam.events && currentTeam.events.length > 0 ? (
            currentTeam.events.map((event) => <EventCard key={event.id} event={event} teamId={selectedTeamId} />)
          ) : (
            <Card className="col-span-full p-8 text-center">
              <p className="text-gray-500">No events found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first event using the button above</p>
              <Button onClick={handleCreateEvent} className="mt-4" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Floating Action Button for mobile */}
      {selectedTeamId && !showEventForm && (
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleCreateEvent}
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
              scrolled ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90",
            )}
            aria-label="Create Event"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Desktop sticky button that appears when scrolling */}
      {selectedTeamId && !showEventForm && (
        <div
          className={cn(
            "hidden sm:block fixed bottom-6 right-6 z-50 transition-all duration-300",
            scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
          )}
        >
          <Button onClick={handleCreateEvent} size="lg" className="shadow-lg hover:shadow-xl">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </div>
      )}
    </div>
  )
}

