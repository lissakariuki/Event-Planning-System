"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, DollarSign, Trash2, Edit } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { useSupabase } from "@/hooks/use-supabase"
import { useTeam } from "@/contexts/team-context"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "./event-form"

interface Event {
  id: string
  title: string
  date: string
  time?: string
  location?: string
  description?: string
  budget?: number
  price?: number
  attendees?: number
  progress?: number
  image?: string
  image_url?: string
}

interface EventCardProps {
  event: Event
  teamId: string
}

export function EventCard({ event, teamId }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { supabase } = useSupabase()
  const { teams, setCurrentTeam } = useTeam()

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      return
    }

    setIsDeleting(true)

    try {
      // Delete from Supabase
      const { error } = await supabase.from("events").delete().eq("id", event.id)

      if (error) {
        throw error
      }

      // Update will happen through real-time subscription
    } catch (err: any) {
      console.error("Error deleting event:", err)
      alert(`Failed to delete event: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEventUpdated = () => {
    setIsEditing(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div
          className="h-40 bg-gray-200 dark:bg-gray-800 relative"
          style={{
            backgroundImage: event.image_url
              ? `url(${event.image_url})`
              : event.image
                ? `url(${event.image})`
                : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!event.image_url && !event.image && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Calendar className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant="secondary"
              size="icon"
              className="opacity-80 hover:opacity-100"
              onClick={handleEdit}
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="opacity-80 hover:opacity-100"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          {event.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
          )}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {formatDate(event.date)}
                {event.time ? ` at ${event.time}` : ""}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.location}</span>
              </div>
            )}
            {(event.budget !== undefined && event.budget > 0) ||
              (event.price !== undefined && event.price > 0 && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  <span>${(event.budget || event.price || 0).toLocaleString()}</span>
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm
            teamId={teamId}
            eventId={event.id}
            initialData={{
              title: event.title,
              description: event.description,
              date: event.date,
              time: event.time,
              location: event.location,
              price: event.price || event.budget,
            }}
            onEventCreated={handleEventUpdated}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

