"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search, Plus, Filter, Users, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTeam } from "@/contexts/team-context"
import { TeamContextDisplay } from "@/components/team-context-display"
import { useEventContext } from "@/contexts/event-contexts"
import type { Event } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ImageUrlInput } from "@/components/image-url-input"

// Add a local formatEventDate function
const formatEventDate = (dateString: string) => {
  try {
    // Parse the date string
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  } catch (error) {
    return dateString
  }
}

export default function EventsPage() {
  const { currentTeam } = useTeam()
  const { events, setEvents, addActivity } = useEventContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    image: "",
    price: "",
    category: "Music",
    organizer: "",
    teamId: "",
    attendees: 0,
  })
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "Music", "Sports", "Technology", "Food", "Other"]

  useEffect(() => {
    if (currentTeam) {
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            event.teamId === currentTeam.id &&
            (selectedCategory === "all" || event.category === selectedCategory),
        ),
      )
    } else {
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "all" || event.category === selectedCategory),
        ),
      )
    }
  }, [events, currentTeam, searchTerm, selectedCategory])

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      // Find the maximum ID and convert to number, then add 1
      const newId = (Math.max(0, ...events.map((e) => Number.parseInt(e.id.toString()))) + 1).toString()

      const eventToAdd: Event = {
        id: newId,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || "12:00 - 14:00",
        location: newEvent.location || "TBD",
        description: newEvent.description || "",
        price: newEvent.price || "$0",
        category: newEvent.category || "Music",
        organizer: newEvent.organizer || "Event Planning System",
        teamId: currentTeam?.id || "",
        image: newEvent.image || "/placeholder.svg?height=400&width=600",
        attendees: 0,
      }

      setEvents([...events, eventToAdd as EventItem])
      addActivity(`New event created: ${newEvent.title}`)

      setIsCreateEventOpen(false)
      setNewEvent({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        image: "",
        price: "",
        category: "Music",
        organizer: "",
        teamId: "",
        attendees: 0,
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event)
    setIsEditEventOpen(true)
  }

  const handleUpdateEvent = () => {
    if (eventToEdit) {
      const updatedEvents = events.map((event) => 
        Number(event.id) === Number(eventToEdit.id) ? { ...eventToEdit, id: Number(eventToEdit.id) } : event
      )

      setEvents(updatedEvents)
      addActivity(`Event updated: ${eventToEdit.title}`)
      setIsEditEventOpen(false)
      setEventToEdit(null)
    }
  }

  const handleDeleteEvent = () => {
    if (eventToDelete) {
      const updatedEvents = events.filter((event) => event.id.toString() !== eventToDelete.id.toString())
      setEvents(updatedEvents)
      addActivity(`Event deleted: ${eventToDelete.title}`)
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const handleOpenDeleteDialog = (event: Event) => {
    setEventToDelete(event)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media & Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="event-time">Time</Label>
                      <Input
                        id="event-time"
                        placeholder="e.g. 18:00 - 22:00"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-price">Price</Label>
                      <Input
                        id="event-price"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                        placeholder="e.g. $50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-category">Category</Label>
                      <Select
                        value={newEvent.category}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                      >
                        <SelectTrigger id="event-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((c) => c !== "all")
                            .map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-organizer">Organizer</Label>
                    <Input
                      id="event-organizer"
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      placeholder="Enter organizer name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      rows={5}
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Enter event description"
                    />
                  </div>
                  {currentTeam && (
                    <div className="grid gap-2">
                      <Label>Team</Label>
                      <div className="p-2 border rounded-md bg-gray-50">{currentTeam.name}</div>
                      <p className="text-xs text-gray-500">This event will be associated with your current team.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="media" className="space-y-4 mt-4">
                  <ImageUrlInput
                    label="Event Image URL"
                    id="event-image"
                    value={newEvent.image}
                    onChange={(value) => setNewEvent({ ...newEvent, image: value })}
                    previewHeight={200}
                    previewWidth={400}
                    previewClassName="rounded-md"
                  />
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TeamContextDisplay />

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {eventToEdit && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media & Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-title">Title</Label>
                  <Input
                    id="edit-event-title"
                    value={eventToEdit.title}
                    onChange={(e) => setEventToEdit({ ...eventToEdit, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-event-date">Date</Label>
                    <Input
                      id="edit-event-date"
                      type="date"
                      value={eventToEdit.date}
                      onChange={(e) => setEventToEdit({ ...eventToEdit, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-event-time">Time</Label>
                    <Input
                      id="edit-event-time"
                      value={eventToEdit.time}
                      onChange={(e) => setEventToEdit({ ...eventToEdit, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-location">Location</Label>
                  <Input
                    id="edit-event-location"
                    value={eventToEdit.location}
                    onChange={(e) => setEventToEdit({ ...eventToEdit, location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-event-price">Price</Label>
                    <Input
                      id="edit-event-price"
                      value={eventToEdit.price}
                      onChange={(e) => setEventToEdit({ ...eventToEdit, price: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-event-category">Category</Label>
                    <Select
                      value={eventToEdit.category}
                      onValueChange={(value) => setEventToEdit({ ...eventToEdit, category: value })}
                    >
                      <SelectTrigger id="edit-event-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c !== "all")
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-organizer">Organizer</Label>
                  <Input
                    id="edit-event-organizer"
                    value={eventToEdit.organizer}
                    onChange={(e) => setEventToEdit({ ...eventToEdit, organizer: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-description">Description</Label>
                  <Textarea
                    id="edit-event-description"
                    rows={5}
                    value={eventToEdit.description}
                    onChange={(e) => setEventToEdit({ ...eventToEdit, description: e.target.value })}
                  />
                </div>
              </TabsContent>
              <TabsContent value="media" className="space-y-4 mt-4">
                <ImageUrlInput
                  label="Event Image URL"
                  id="edit-event-image"
                  value={eventToEdit.image}
                  onChange={(value) => setEventToEdit({ ...eventToEdit, image: value })}
                  previewHeight={200}
                  previewWidth={400}
                  previewClassName="rounded-md"
                />
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent}>Update Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this event?</p>
            <p className="font-semibold mt-2">{eventToDelete?.title}</p>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm ? "Try adjusting your search or filters" : "Create your first event to get started"}
          </p>
          <Button className="mt-4" onClick={() => setIsCreateEventOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow" key={event.id}>
              <div className="relative aspect-video">
                <Image
                  src={event.image || "/placeholder.svg?height=400&width=600"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link href={`/events/${event.id}`}>
                      <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                    </Link>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleOpenDeleteDialog(event)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{event.price}</span>
                    </div>
                    {event.teamId && currentTeam && event.teamId === currentTeam.id && (
                      <div className="flex items-center col-span-2">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Team Event</span>
                      </div>
                    )}
                  </div>

                  {event.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{event.attendees || 0} attendees</span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

