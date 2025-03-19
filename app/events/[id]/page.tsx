"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  MapPin,
  Users,
  PhoneIcon as WhatsApp,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  DollarSign,
} from "lucide-react"
import { useEventContext } from "@/contexts/event-contexts"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { events, setEvents, addActivity } = useEventContext()

  // Find the event by ID
  const event = events.find((e) => e.id === Number.parseInt(params.id))

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isDeleteEventOpen, setIsDeleteEventOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)

  // Form states
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    seats: 1,
    notes: "",
  })

  const [editEventForm, setEditEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    image: "",
    price: "",
    category: "",
    organizer: "",
  })

  // If event not found
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-500 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    )
  }

  // Initialize edit form with event data
  const initializeEditForm = () => {
    setEditEventForm({
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
    setIsEditEventOpen(true)
  }

  // Handle booking
  const handleBooking = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    } else {
      setIsBookingOpen(false)
      setBookingStep(1)

      // Update attendees count
      const updatedEvents = events.map((e) =>
        e.id === event.id ? { ...e, attendees: (e.attendees || 0) + bookingForm.seats } : e,
      )
      setEvents(updatedEvents)

      addActivity(`Booked ${bookingForm.seats} seats for ${event.title}`)

      toast({
        title: "Booking Confirmed",
        description: `Your booking for ${event.title} has been confirmed.`,
      })

      // Reset form
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        seats: 1,
        notes: "",
      })
    }
  }

  // Handle event update
  const handleUpdateEvent = () => {
    if (!editEventForm.title || !editEventForm.date || !editEventForm.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedEvents = events.map((e) => (e.id === event.id ? { ...e, ...editEventForm } : e))

    setEvents(updatedEvents)
    setIsEditEventOpen(false)

    addActivity(`Event updated: ${editEventForm.title}`)

    toast({
      title: "Event Updated",
      description: `${editEventForm.title} has been updated successfully.`,
    })
  }

  // Handle event deletion
  const handleDeleteEvent = () => {
    const updatedEvents = events.filter((e) => e.id !== event.id)
    setEvents(updatedEvents)

    addActivity(`Event deleted: ${event.title}`)

    toast({
      title: "Event Deleted",
      description: `${event.title} has been deleted.`,
      variant: "destructive",
    })

    router.push("/events")
  }

  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)

    toast({
      title: "Link Copied",
      description: "Event link has been copied to clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/events")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <Badge className="ml-2">{event.category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={initializeEditForm}>
            <Edit className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsDeleteEventOpen(true)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {event.date}
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {event.time}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h2 className="text-2xl font-semibold mb-4">About Event</h2>
          <p className="text-gray-600 mb-6">{event.description || "No description available."}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <span>Attendees: {event.attendees || 0}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
              <span>Price: {event.price}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <span>Organized by: {event.organizer}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Share Event</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <WhatsApp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-2xl font-bold">{event.price}</div>
              </div>
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">Book Now</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {bookingStep === 1 ? "Select Tickets" : bookingStep === 2 ? "Contact Information" : "Payment"}
                    </DialogTitle>
                  </DialogHeader>
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Number of Tickets</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setBookingForm({ ...bookingForm, seats: Math.max(1, bookingForm.seats - 1) })
                            }
                          >
                            -
                          </Button>
                          <span>{bookingForm.seats}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBookingForm({ ...bookingForm, seats: bookingForm.seats + 1 })}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>
                          {event.price.startsWith("$")
                            ? `$${Number.parseInt(event.price.slice(1)) * bookingForm.seats}`
                            : `${event.price} x ${bookingForm.seats}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            className="col-span-3"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            className="col-span-3"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            className="col-span-3"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                            Notes
                          </Label>
                          <Textarea
                            id="notes"
                            className="col-span-3"
                            value={bookingForm.notes}
                            onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {["PayPal", "Google Pay", "Apple Pay"].map((method) => (
                          <div key={method} className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                            {method}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Event</span>
                          <span>{event.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span>{event.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tickets</span>
                          <span>{bookingForm.seats}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>
                            {event.price.startsWith("$")
                              ? `$${Number.parseInt(event.price.slice(1)) * bookingForm.seats}`
                              : `${event.price} x ${bookingForm.seats}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    {bookingStep > 1 && (
                      <Button variant="outline" onClick={() => setBookingStep(bookingStep - 1)}>
                        Back
                      </Button>
                    )}
                    <Button onClick={handleBooking} className={bookingStep > 1 ? "ml-auto" : ""}>
                      {bookingStep === 3 ? "Complete Booking" : "Continue"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Event Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{event.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Organizer:</span>
                  <span>{event.organizer}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="aspect-video bg-gray-200 rounded-md mb-4">
              {/* Map would go here in a real application */}
              <div className="w-full h-full flex items-center justify-center text-gray-400">Map Preview</div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{event.location}</p>
            <Button variant="outline" className="w-full">
              <MapPin className="mr-2 h-4 w-4" /> Get Directions
            </Button>
          </Card>
        </div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={editEventForm.title}
                onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  value={editEventForm.date}
                  onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  value={editEventForm.time}
                  onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editEventForm.location}
                onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  value={editEventForm.price}
                  onChange={(e) => setEditEventForm({ ...editEventForm, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editEventForm.category}
                  onChange={(e) => setEditEventForm({ ...editEventForm, category: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-organizer">Organizer</Label>
              <Input
                id="edit-organizer"
                value={editEventForm.organizer}
                onChange={(e) => setEditEventForm({ ...editEventForm, organizer: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={editEventForm.image}
                onChange={(e) => setEditEventForm({ ...editEventForm, image: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={4}
                value={editEventForm.description}
                onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent}>Update Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={isDeleteEventOpen} onOpenChange={setIsDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to delete "{event.title}"? This action cannot be undone.</p>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-16 h-16 rounded-md overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {event.date} · {event.location}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDeleteEventOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

