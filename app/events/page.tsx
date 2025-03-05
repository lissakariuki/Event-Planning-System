"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search } from "lucide-react"

const events = [
  {
    id: 1,
    title: "National Music Festival",
    date: "December 24, 2023",
    time: "18:00 - 23:00",
    location: "Grand Park, New York City",
    image: "/placeholder.svg?height=400&width=600",
    price: "$50",
  },
  {
    id: 2,
    title: "DJ Music Competition",
    date: "December 16, 2023",
    time: "20:00 - 02:00",
    location: "Club Atmosphere, Miami",
    image: "/placeholder.svg?height=400&width=600",
    price: "$30",
  },
  {
    id: 3,
    title: "Rock & Roll Night",
    date: "December 31, 2023",
    time: "19:00 - 00:00",
    location: "Stadium Arena, Los Angeles",
    image: "/placeholder.svg?height=400&width=600",
    price: "$45",
  },
]

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="relative w-72">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date} · {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">{event.price}</span>
                  <Button>View Details</Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

