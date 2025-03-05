"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for events
const events = [
  { id: 1, title: "Venue Visit", date: new Date(2023, 5, 15) },
  { id: 2, title: "Catering Tasting", date: new Date(2023, 5, 20) },
  { id: 3, title: "Final Guest List Due", date: new Date(2023, 6, 1) },
  { id: 4, title: "Wedding Rehearsal", date: new Date(2023, 6, 14) },
  { id: 5, title: "Wedding Day", date: new Date(2023, 6, 15) },
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  const eventDates = events.map((event) => event.date)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Event Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{ event: eventDates }}
            modifiersStyles={{
              event: { backgroundColor: "lightblue", color: "black", borderRadius: "50%" },
            }}
          />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Events</h2>
          <ul className="space-y-2">
            {events
              .filter((event) => event.date.toDateString() === selectedDate?.toDateString())
              .map((event) => (
                <li key={event.id} className="flex justify-between items-center">
                  <span>{event.title}</span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </li>
              ))}
          </ul>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Title
                  </Label>
                  <Input id="event-title" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Date
                  </Label>
                  <Input id="event-date" type="date" className="col-span-3" />
                </div>
              </div>
              <Button onClick={() => setIsAddEventOpen(false)}>Save Event</Button>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  )
}

