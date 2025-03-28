"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/hooks/use-supabase"
import { useTeam } from "@/contexts/team-context"

interface EventFormProps {
  teamId: string
  eventId?: string
  initialData?: {
    title: string
    description?: string
    date: string
    time?: string
    location?: string
    price?: number
  }
  onEventCreated: () => void
  onCancel: () => void
}

export function EventForm({ teamId, eventId, initialData, onEventCreated, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [date, setDate] = useState(initialData?.date || "")
  const [time, setTime] = useState(initialData?.time || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { supabase } = useSupabase()
  const { teams, setCurrentTeam } = useTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !date) {
      setError("Event title and date are required")
      return
    }

    if (!user) {
      setError("You must be logged in to create an event")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Parse price to number if provided
      const priceValue = price ? Number.parseFloat(price) : null

      const eventData = {
        team_id: teamId,
        title: title.trim(),
        description: description.trim() || null,
        date,
        time: time || null,
        location: location.trim() || null,
        price: priceValue,
      }

      if (eventId) {
        // Update existing event
        const { error: updateError } = await supabase.from("events").update(eventData).eq("id", eventId)

        if (updateError) throw updateError
      } else {
        // Create new event
        const { error: insertError } = await supabase.from("events").insert({
          ...eventData,
          created_by: user.id,
        })

        if (insertError) throw insertError
      }

      onEventCreated()
    } catch (err: any) {
      console.error("Error saving event:", err)
      setError(`Failed to save event: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="event-title" className="block text-sm font-medium mb-1">
          Event Title *
        </label>
        <Input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          disabled={isSubmitting}
          required
          data-cy="event-title-input"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium mb-1">
            Date *
          </label>
          <Input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
            required
            data-cy="event-date-input"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time
          </label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={isSubmitting} />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Budget
        </label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter event budget"
          disabled={isSubmitting}
          min="0"
          step="0.01"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} data-cy="save-event">
          {isSubmitting ? (eventId ? "Updating..." : "Creating...") : eventId ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  )
}

