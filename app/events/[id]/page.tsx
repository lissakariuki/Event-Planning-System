"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Users, PhoneIcon as WhatsApp, Twitter, Facebook, Instagram, Mail, Clock } from "lucide-react"

// Mock event data
const event = {
  id: 1,
  title: "National Music Festival",
  date: "Monday, December 24, 2023",
  time: "18:00 - 23:00 PM (GMT+3)",
  location: "Grand Park, New York City, US",
  description:
    "Join us for an unforgettable night of music featuring top artists from around the world. Experience amazing performances, great food, and create lasting memories.",
  price: "$50",
  capacity: "20,000",
  organizer: {
    name: "World of Music",
    image: "/placeholder.svg",
    events: 24,
    followers: "967K",
  },
  gallery: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
}

export default function EventPage({ params }: { params: { id: string } }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [seats, setSeats] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")

  const handleBooking = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    } else {
      setIsBookingOpen(false)
      setBookingStep(1)
      // Handle booking completion
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <Image src={event.gallery[0] || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
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
          <p className="text-gray-600 mb-6">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <span>Capacity: {event.capacity}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Gallery</h3>
          <div className="grid grid-cols-3 gap-4">
            {event.gallery.map((image, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <Image src={image || "/placeholder.svg"} alt={`Gallery ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Organizer</h3>
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={event.organizer.image || "/placeholder.svg"}
                alt={event.organizer.name}
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h4 className="font-semibold">{event.organizer.name}</h4>
                <div className="text-sm text-gray-500">
                  {event.organizer.events} Events · {event.organizer.followers} Followers
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Follow Organizer
            </Button>
          </Card>

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
                        <span>${Number.parseInt(event.price.slice(1)) * seats}</span>
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
    </div>
  )
}

