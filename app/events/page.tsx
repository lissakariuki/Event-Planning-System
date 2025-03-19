"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search, Plus, Filter, Clock, Users, DollarSign, Trash2, Edit } from "lucide-react"
import { useEventContext } from "@/contexts/event-contexts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

export default function EventsPage() {
  const { events, setEvents, addActivity } = useEventContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    image:
      "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    price: "",
    category: "Music",
    organizer: "",
  })

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ["all", ...new Set(events.map((event) => event.category))]

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(0, ...events.map((e) => e.id)) + 1

    if (isEditMode && selectedEvent) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === selectedEvent.id ? { ...newEvent, id: selectedEvent.id } : event,
      )
      setEvents(updatedEvents)

      addActivity(`Event updated: ${newEvent.title}`)

      toast({
        title: "Event Updated",
        description: `${newEvent.title} has been updated successfully.`,
      })
    } else {
      // Add new event
      const eventToAdd = {
        ...newEvent,
        id: newId,
        attendees: 0,
      }

      setEvents([...events, eventToAdd])

      addActivity(`New event created: ${newEvent.title}`)

      toast({
        title: "Event Created",
        description: `${newEvent.title} has been created successfully.`,
      })
    }

    // Reset form and close dialog
    setIsAddEventOpen(false)
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      image:
        "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      price: "",
      category: "Music",
      organizer: "",
    })
    setIsEditMode(false)
    setSelectedEvent(null)
  }

  // Handle deleting an event
  const handleDeleteEvent = () => {
    if (!selectedEvent) return

    const updatedEvents = events.filter((event) => event.id !== selectedEvent.id)
    setEvents(updatedEvents)

    addActivity(`Event deleted: ${selectedEvent.title}`)

    toast({
      title: "Event Deleted",
      description: `${selectedEvent.title} has been deleted.`,
      variant: "destructive",
    })

    setIsDeleteEventOpen(false)
    setSelectedEvent(null)
  }

  // Open edit dialog
  const handleEditEvent = (event: (typeof events)[0]) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description || "",
      image: event.image,
      price: event.price,
      category: event.category,
      organizer: event.organizer,
    })
    setIsEditMode(true)
    setIsAddEventOpen(true)
  }

  // Open delete dialog
  const handleOpenDeleteDialog = (event: (typeof events)[0]) => {
    setSelectedEvent(event)
    setIsDeleteEventOpen(true)
  }

  // Format date for display
  const formatEventDate = (dateString: string) => {
    try {
      // Parse the date string (assuming format like "December 24, 2023")
      const date = new Date(dateString)
      return format(date, "MMMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex gap-2">
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Event" : "Create New Event"}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? "Update the details of your event." : "Fill in the details to create a new event."}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">
                      Event Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-date">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => {
                          // Convert date to format like "December 24, 2023"
                          const date = new Date(e.target.value)
                          const formattedDate = format(date, "MMMM d, yyyy")
                          setNewEvent({ ...newEvent, date: formattedDate })
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-time">
                        Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={newEvent.time.split(" - ")[0]}
                        onChange={(e) => {
                          // Format time as "18:00 - 23:00"
                          const startTime = e.target.value
                          // For simplicity, we'll set end time to 4 hours after start
                          const [hours, minutes] = startTime.split(":")
                          const endHours = (Number.parseInt(hours) + 4) % 24
                          const endTime = `${endHours.toString().padStart(2, "0")}:${minutes}`
                          setNewEvent({ ...newEvent, time: `${startTime} - ${endTime}` })
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="event-location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-price">
                        Price <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="event-price"
                        value={newEvent.price.replace("$", "")}
                        onChange={(e) => setNewEvent({ ...newEvent, price: `$${e.target.value}` })}
                        placeholder="50"
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
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Food">Food & Drink</SelectItem>
                          <SelectItem value="Arts">Arts & Culture</SelectItem>
                          <SelectItem value="Sports">Sports & Fitness</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-organizer">Organizer</Label>
                    <Input
                      id="event-organizer"
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      rows={5}
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-image">Image URL</Label>
                    <Input
                      id="event-image"
                      value={newEvent.image}
                      onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                    />
                  </div>

                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    {newEvent.image ? (
                      <img
                        src={newEvent.image || "/placeholder.svg"}
                        alt="Event preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image preview
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddEventOpen(false)
                    setIsEditMode(false)
                    setSelectedEvent(null)
                    setNewEvent({
                      title: "",
                      date: "",
                      time: "",
                      location: "",
                      description: "",
                      image:
                        "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                      price: "",
                      category: "Music",
                      organizer: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>{isEditMode ? "Update Event" : "Create Event"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>
      </div>

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

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-video">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditEvent(event)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleOpenDeleteDialog(event)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className="absolute top-2 left-2 bg-black/60 text-white">{event.category}</Badge>
              </div>
              <div className="p-4">
                <Link href={`/events/${event.id}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{event.title}</h3>
                </Link>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatEventDate(event.date)} · {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">{event.price}</span>
                  <Link href={`/events/${event.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-64 aspect-video md:aspect-square">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <Badge className="absolute top-2 left-2 bg-black/60 text-white">{event.category}</Badge>
                </div>
                <div className="p-4 flex-1">
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

      {/* Delete Event Dialog */}
      <Dialog open={isDeleteEventOpen} onOpenChange={setIsDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={selectedEvent.image || "/placeholder.svg"}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">
                    {formatEventDate(selectedEvent.date)} · {selectedEvent.location}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteEventOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

