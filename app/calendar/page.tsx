"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface Event {
  id: number
  title: string
  date: Date
  description?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: "Venue Visit", date: new Date(2024, 2, 15) },
    { id: 2, title: "Catering Tasting", date: new Date(2024, 2, 20) },
    { id: 3, title: "Final Guest List Due", date: new Date(2024, 2, 25) },
  ])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", description: "" })

  const eventDates = events.map((event) => event.date)

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      const event: Event = {
        id: Date.now(),
        title: newEvent.title,
        date: selectedDate,
        description: newEvent.description,
      }
      setEvents([...events, event])
      setNewEvent({ title: "", description: "" })
      setIsAddEventOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 dark:bg-gray-900/50 border-gray-800">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={{
                event: eventDates,
              }}
              modifiersStyles={{
                event: {
                  color: "var(--primary)",
                  fontWeight: "bold",
                },
              }}
            />
          </Card>
          <Card className="p-6 dark:bg-gray-900/50 border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Events</h2>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Event</Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-900">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-title">Title</Label>
                      <Input
                        id="event-title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Enter event title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Input
                        id="event-description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Enter event description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <div className="p-2 border rounded-md">
                        {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddEvent}>Save Event</Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {selectedDate &&
                events
                  .filter((event) => event.date.toDateString() === selectedDate.toDateString())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && <p className="text-sm text-gray-400 mt-1">{event.description}</p>}
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
              {selectedDate &&
                events.filter((event) => event.date.toDateString() === selectedDate.toDateString()).length === 0 && (
                  <p className="text-center text-gray-400 py-4">No events for this date</p>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
