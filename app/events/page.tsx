"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EventDetail } from "@/components/event-detail"
import { useTeam } from "@/contexts/team-context"
import type { TeamEvent } from "@/lib/types"

export default function EventsPage() {
  const { teams } = useTeam()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    budget: "",
    attendees: "",
  })
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null)

  // Collect all events from all teams
  const allEvents: (TeamEvent & { teamName: string; teamId: string })[] = []
  teams.forEach((team) => {
    if (team.events && team.events.length > 0) {
      team.events.forEach((event) => {
        allEvents.push({
          ...event,
          teamName: team.name,
          teamId: team.id,
        })
      })
    }
  })

  const filteredEvents = allEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.teamName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateEvent = () => {
    // In a real app, this would create a new event
    setIsCreateEventOpen(false)
    setNewEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      budget: "",
      attendees: "",
    })
  }

  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-2">
          <div className="relative w-72">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Enter event location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe your event"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-budget">Budget ($)</Label>
                    <Input
                      id="event-budget"
                      type="number"
                      value={newEvent.budget}
                      onChange={(e) => setNewEvent({ ...newEvent, budget: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-attendees">Expected Attendees</Label>
                    <Input
                      id="event-attendees"
                      type="number"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="relative aspect-video">
              <Image
                src={event.image || "/placeholder.svg?height=200&width=300"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Team: {event.teamName}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold">${event.budget.toLocaleString()}</span>
                <Button>View Details</Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-center">
              {searchTerm
                ? `No events match your search for "${searchTerm}". Try a different search term or create a new event.`
                : "You don't have any events yet. Create your first event to get started."}
            </p>
            <Button onClick={() => setIsCreateEventOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create New Event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

