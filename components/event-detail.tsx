"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, PlusCircle, CheckCircle } from "lucide-react"
import { EventGuestList } from "@/components/event-guest-list"
import type { TeamEvent, Guest } from "@/lib/types"

interface EventDetailProps {
  event: TeamEvent
  onBack: () => void
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [eventData, setEventData] = useState(event)

  const handleAddGuest = (guest: Omit<Guest, "id">) => {
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString(),
    }

    setEventData({
      ...eventData,
      guests: [...(eventData.guests || []), newGuest],
    })
  }

  const handleUpdateRsvp = (guestId: string, rsvp: "attending" | "declined" | "pending") => {
    if (!eventData.guests) return

    const updatedGuests = eventData.guests.map((guest) => {
      if (guest.id === guestId) {
        return { ...guest, rsvp }
      }
      return guest
    })

    setEventData({
      ...eventData,
      guests: updatedGuests,
    })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <Image
          src={event.image || "/placeholder.svg?height=300&width=1200"}
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
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {/* Placeholder time - would come from actual event data */}
              18:00 - 23:00 PM
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Guests ({eventData.guests?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Budget
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              Tasks
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6">
              <h2 className="text-2xl font-semibold mb-4">About Event</h2>
              <p className="text-gray-600 mb-6">{event.description || "No description provided."}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  <span>Capacity: {event.attendees}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                  <span>Budget: ${event.budget.toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Progress</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>Overall Progress</span>
                  <span>{event.progress}%</span>
                </div>
                <Progress value={event.progress} className="h-2" />
              </div>

              <div className="flex justify-between">
                <Button variant="outline">Edit Event</Button>
                <Button>Manage Event</Button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Event Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Event Date</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Event Time</p>
                      <p className="text-sm text-gray-500">18:00 - 23:00 PM</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" /> Manage Guest List
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" /> Update Budget
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" /> Reschedule Event
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="space-y-6">
          <EventGuestList guests={eventData.guests || []} onAddGuest={handleAddGuest} onUpdateRsvp={handleUpdateRsvp} />
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Event Budget</h2>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Budget</span>
                <span className="font-medium">${event.budget.toLocaleString()}</span>
              </div>
              <Progress value={65} className="h-2" />
              <div className="flex justify-between mt-1 text-sm text-gray-500">
                <span>Spent: $22,750</span>
                <span>Remaining: $12,250</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Budget Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Venue</span>
                    <span>$15,000 (42.9%)</span>
                  </div>
                  <Progress value={42.9} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Catering</span>
                    <span>$10,000 (28.6%)</span>
                  </div>
                  <Progress value={28.6} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Decorations</span>
                    <span>$5,000 (14.3%)</span>
                  </div>
                  <Progress value={14.3} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Entertainment</span>
                    <span>$3,000 (8.6%)</span>
                  </div>
                  <Progress value={8.6} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Miscellaneous</span>
                    <span>$2,000 (5.7%)</span>
                  </div>
                  <Progress value={5.7} className="h-1.5" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" className="mr-2">
                Add Expense
              </Button>
              <Button>Update Budget</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Event Tasks</h2>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Book venue</p>
                    <p className="text-sm text-gray-500">Completed on Jan 15, 2024</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  Completed
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                <div className="flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium">Finalize catering menu</p>
                    <p className="text-sm text-gray-500">Due on Feb 20, 2024</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                >
                  In Progress
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Send invitations</p>
                    <p className="text-sm text-gray-500">Due on Feb 25, 2024</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                >
                  Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Arrange transportation</p>
                    <p className="text-sm text-gray-500">Due on Mar 1, 2024</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                >
                  Pending
                </Badge>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Task Progress</span>
                <span className="font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

