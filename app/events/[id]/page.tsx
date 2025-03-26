"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  MapPin,
  PhoneIcon as WhatsApp,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Clock,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useSupabase } from "@/hooks/use-supabase"
import { useUser } from "@clerk/nextjs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  location: string | null
  image_url: string | null
  price: number
  created_by: string
  team_id: string
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { currentTeam } = useTeam()
  const { user } = useUser()

  const { supabase } = useSupabase()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [seats, setSeats] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!currentTeam) return

    async function loadEvent() {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .eq("team_id", currentTeam.id)
          .single()

        if (error) {
          console.error("Error loading event:", error)
          setError("Failed to load event details")
          return
        }

        if (data) {
          setEvent(data)

          // Prepare data for edit form
          setEventForm({
            title: data.title,
            description: data.description || "",
            date: new Date(data.date).toISOString().split("T")[0],
            time: data.time || "",
            location: data.location || "",
            price: data.price.toString(),
          })
        } else {
          setError("Event not found")
        }
      } catch (err) {
        console.error("Error in loadEvent:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId, currentTeam, supabase])

  const handleBooking = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    } else {
      setIsBookingOpen(false)
      setBookingStep(1)
      // Handle booking completion
    }
  }

  const handleUpdateEvent = async () => {
    if (!event || !currentTeam || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: eventForm.title,
          description: eventForm.description || null,
          date: new Date(eventForm.date).toISOString(),
          time: eventForm.time || null,
          location: eventForm.location || null,
          price: Number.parseFloat(eventForm.price) || 0,
        })
        .eq("id", event.id)
        .eq("team_id", currentTeam.id)

      if (error) throw error

      // Update local state
      setEvent({
        ...event,
        title: eventForm.title,
        description: eventForm.description || null,
        date: new Date(eventForm.date).toISOString(),
        time: eventForm.time || null,
        location: eventForm.location || null,
        price: Number.parseFloat(eventForm.price) || 0,
      })

      setIsEditEventOpen(false)
    } catch (err: any) {
      console.error("Error updating event:", err)
      setError(`Failed to update event: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !currentTeam) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.from("events").delete().eq("id", event.id).eq("team_id", currentTeam.id)

      if (error) throw error

      // Update team stats if it was an upcoming event
      if (new Date(event.date) > new Date()) {
        const { error: updateError } = await supabase
          .from("teams")
          .update({
            upcoming_events: Math.max((currentTeam.stats?.upcomingEvents || 0) - 1, 0),
          })
          .eq("id", currentTeam.id)

        if (updateError) console.error("Error updating team stats:", updateError)
      }

      // Redirect to events page
      router.push("/events")
    } catch (err: any) {
      console.error("Error deleting event:", err)
      setError(`Failed to delete event: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Event Details</h1>
        <Alert variant="destructive">
          <AlertDescription>{error || "Event not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/events")}>Back to Events</Button>
      </div>
    )
  }

  const isOwner = user?.id === event.created_by

  return (
    <div className="space-y-6">
      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <Image
          src={event.image_url || "/placeholder.svg?height=300&width=1200"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {event.time && (
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {event.time}
              </div>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={() => setIsEditEventOpen(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-red-500"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h2 className="text-2xl font-semibold mb-4">About Event</h2>
          <p className="text-gray-600 mb-6">{event.description || "No description provided."}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-2xl font-bold">${event.price}</div>
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
                          <Button variant="outline" size="sm" onClick={() => setSeats(Math.max(1, seats - 1))}>
                            -
                          </Button>
                          <span>{seats}</span>
                          <Button variant="outline" size="sm" onClick={() => setSeats(seats + 1)}>
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${(event.price * seats).toFixed(2)}</span>
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
                          <Input id="name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input id="email" type="email" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input id="phone" type="tel" className="col-span-3" />
                        </div>
                      </div>
                    </div>
                  )}
                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {["PayPal", "Google Pay", "Apple Pay"].map((method) => (
                          <div
                            key={method}
                            className={`p-4 border rounded-lg cursor-pointer ${
                              paymentMethod === method ? "border-primary bg-primary/5" : "border-gray-200"
                            }`}
                            onClick={() => setPaymentMethod(method)}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button onClick={handleBooking}>{bookingStep === 3 ? "Complete Booking" : "Continue"}</Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Share Event</h4>
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
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title*
              </Label>
              <Input
                id="edit-title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="col-span-3"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date*
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-time" className="text-right">
                Time
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={eventForm.price}
                onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditEventOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateEvent}
              disabled={isSubmitting || !eventForm.title || !eventForm.date}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Event"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this event? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteEvent} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}