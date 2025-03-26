"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search, Plus, Loader2 } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useSupabase, useRealtimeSubscription } from "@/hooks/use-supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@clerk/nextjs"
import { AlertDisplay } from "@/components/ui/alert-display"

interface Event {
  id: string
  title: string
  date: string
  time: string | null
  location: string | null
  image_url: string | null
  price: number
  description: string | null
}

export default function EventsPage() {
  const { currentTeam, isLoading: isTeamLoading } = useTeam()
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [searchTerm, setSearchTerm] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "0",
  })

  // Fetch events data
  const fetchEvents = async () => {
    if (!currentTeam) return []

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("team_id", currentTeam.id)
        .order("date", { ascending: true })

      if (error) {
        console.error("Error loading events:", error)
        setError("Failed to load events")
        return []
      }

      if (data) {
        setEvents(data)
      }

      return data || []
    } catch (err) {
      console.error("Error in fetchEvents:", err)
      setError("An unexpected error occurred")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Set up real-time subscription
  useRealtimeSubscription(
    "events",
    currentTeam?.id,
    () => {
      fetchEvents()
    },
    fetchEvents,
  )

  // Initial data load
  useEffect(() => {
    if (currentTeam) {
      fetchEvents()
    }
  }, [currentTeam])

  const handleCreateEvent = async () => {
    if (!currentTeam || !user) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          team_id: currentTeam.id,
          title: newEvent.title,
          description: newEvent.description || null,
          date: new Date(newEvent.date).toISOString(),
          time: newEvent.time || null,
          location: newEvent.location || null,
          price: Number.parseFloat(newEvent.price) || 0,
          image_url: "/placeholder.svg?height=400&width=600",
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Update team stats
      const { error: updateError } = await supabase
        .from("teams")
        .update({
          upcoming_events: (currentTeam.stats?.upcomingEvents || 0) + 1,
        })
        .eq("id", currentTeam.id)

      if (updateError) console.error("Error updating team stats:", updateError)

      // Reset form and close dialog
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        price: "0",
      })
      setIsCreateEventOpen(false)
    } catch (err: any) {
      console.error("Error creating event:", err)
      setError(`Failed to create event: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Show loading state when team is loading
  if (isTeamLoading || !currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-4">
          <div className="relative w-72">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button onClick={() => setIsCreateEventOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      </div>

      <AlertDisplay message={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="flex justify-between pt-2">
                  <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <Image
                    src={event.image_url || "/placeholder.svg?height=400&width=600"}
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
                      {new Date(event.date).toLocaleDateString()} {event.time && `· ${event.time}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold">${event.price}</span>
                    <Button>View Details</Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-gray-500 mb-6">Create your first event to get started</p>
          <Button onClick={() => setIsCreateEventOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>

          <AlertDisplay message={error} />

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title*
              </Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date*
              </Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Time
              </Label>
              <Input
                id="event-time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-location" className="text-right">
                Location
              </Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="event-price"
                type="number"
                value={newEvent.price}
                onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isSubmitting || !newEvent.title || !newEvent.date}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

