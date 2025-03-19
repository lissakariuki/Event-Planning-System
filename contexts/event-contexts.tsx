"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define types for our data
interface Guest {
  id: number
  name: string
  email: string
  rsvp: "Attending" | "Not Attending" | "Pending"
  phone?: string
  dietaryRestrictions?: string
}

interface Task {
  id: number
  title: string
  completed: boolean
}

interface BudgetCategory {
  name: string
  allocated: number
  spent: number
}

interface Event {
  id: number
  title: string
  date: Date
}

interface Activity {
  action: string
  timestamp: string
}

interface Vendor {
  id: number
  name: string
  type: string
  rating: number
  price: number
  capacity: number | null
  location: string
  description?: string
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
  amenities?: string[]
  verified: boolean
  featured?: boolean
  images?: string[]
  reviews?: {
    id: number
    user: string
    rating: number
    comment: string
    date: string
  }[]
}

// Add this new interface after the Vendor interface
interface EventItem {
  id: number
  title: string
  date: string
  time: string
  location: string
  description?: string
  image: string
  price: string
  category: string
  organizer: string
  attendees?: number
}

// Update the EventContextType interface to include events
interface EventContextType {
  guests: Guest[]
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  budget: {
    total: number
    categories: BudgetCategory[]
  }
  setBudget: React.Dispatch<
    React.SetStateAction<{
      total: number
      categories: BudgetCategory[]
    }>
  >
  currentEvent: Event
  setCurrentEvent: React.Dispatch<React.SetStateAction<Event>>
  recentActivities: Activity[]
  setRecentActivities: React.Dispatch<React.SetStateAction<Activity[]>>
  addActivity: (action: string) => void
  vendors: Vendor[]
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>
  events: EventItem[]
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  // State for different data sections
  const [guests, setGuests] = useState<Guest[]>([
    { id: 1, name: "John Doe", email: "john@example.com", rsvp: "Attending", phone: "+1 234-567-8901" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", rsvp: "Not Attending", dietaryRestrictions: "Vegetarian" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com", rsvp: "Pending" },
    {
      id: 4,
      name: "Bob Williams",
      email: "bob@example.com",
      rsvp: "Attending",
      phone: "+1 987-654-3210",
      dietaryRestrictions: "Gluten-free",
    },
    { id: 5, name: "Emma Brown", email: "emma@example.com", rsvp: "Pending" },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Book venue", completed: true },
    { id: 2, title: "Hire caterer", completed: false },
    { id: 3, title: "Send invitations", completed: true },
    { id: 4, title: "Finalize decorations", completed: false },
    { id: 5, title: "Confirm entertainment", completed: false },
    { id: 6, title: "Review seating arrangements", completed: false },
  ])

  const [budget, setBudget] = useState({
    total: 15000,
    categories: [
      { name: "Venue", allocated: 5000, spent: 4500 },
      { name: "Catering", allocated: 3000, spent: 1200 },
      { name: "Decorations", allocated: 1500, spent: 800 },
      { name: "Entertainment", allocated: 2000, spent: 1000 },
      { name: "Miscellaneous", allocated: 1000, spent: 300 },
    ] as BudgetCategory[],
  })

  const [currentEvent, setCurrentEvent] = useState<Event>({
    id: 1,
    title: "Annual Corporate Gala",
    date: new Date(2024, 5, 15), // June 15, 2024
  })

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    { action: "Venue booked", timestamp: "2 days ago" },
    { action: "Catering menu finalized", timestamp: "4 days ago" },
    { action: "Invitations sent", timestamp: "1 week ago" },
  ])

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 1,
      name: "Elegant Events Venue",
      type: "Venue",
      rating: 4.8,
      price: 500000,
      capacity: 200,
      location: "Nairobi, Kenya",
      verified: true,
      featured: true,
      description: "A luxurious venue perfect for corporate events and weddings.",
      contactInfo: {
        phone: "+254 123 456 789",
        email: "info@elegantevents.com",
        website: "www.elegantevents.com",
      },
      amenities: ["On-site catering", "AV equipment", "Parking", "Wheelchair accessible"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      id: 2,
      name: "Gourmet Delights Catering",
      type: "Catering",
      rating: 4.5,
      price: 250000,
      capacity: null,
      location: "Mombasa, Kenya",
      verified: true,
      description: "Exquisite catering services for all types of events.",
      contactInfo: {
        phone: "+254 987 654 321",
        email: "info@gourmetdelights.com",
      },
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      id: 3,
      name: "Floral Fantasy",
      type: "Decor",
      rating: 4.7,
      price: 100000,
      capacity: null,
      location: "Kisumu, Kenya",
      verified: false,
      description: "Beautiful floral arrangements and decorations for your special day.",
      contactInfo: {
        email: "info@floralfantasy.com",
      },
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      id: 4,
      name: "Sound Masters",
      type: "Entertainment",
      rating: 4.6,
      price: 150000,
      capacity: null,
      location: "Nakuru, Kenya",
      verified: true,
      description: "Professional sound and lighting equipment for events.",
      contactInfo: {
        phone: "+254 712 345 678",
        email: "info@soundmasters.com",
        website: "www.soundmasters.com",
      },
      images: ["/placeholder.svg?height=400&width=600"],
    },
    {
      id: 5,
      name: "Luxe Ballroom",
      type: "Venue",
      rating: 4.9,
      price: 750000,
      capacity: 300,
      location: "Nairobi, Kenya",
      verified: true,
      featured: true,
      description: "An elegant ballroom for grand celebrations and corporate events.",
      contactInfo: {
        phone: "+254 723 456 789",
        email: "info@luxeballroom.com",
        website: "www.luxeballroom.com",
      },
      amenities: ["In-house catering", "Valet parking", "Bridal suite", "Stage", "Dance floor"],
      images: ["/placeholder.svg?height=400&width=600"],
    },
  ])

  // Add the events state after the vendors state in the EventProvider function
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 1,
      title: "National Music Festival",
      date: "December 24, 2023",
      time: "18:00 - 23:00",
      location: "Grand Park, New York City",
      image:
        "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      price: "$50",
      category: "Music",
      organizer: "World of Music",
      description: "Join us for an unforgettable night of music featuring top artists from around the world.",
      attendees: 120,
    },
    {
      id: 2,
      title: "DJ Music Competition",
      date: "December 16, 2023",
      time: "20:00 - 02:00",
      location: "Club Atmosphere, Miami",
      image:
        "https://images.pexels.com/photos/698907/pexels-photo-698907.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      price: "$30",
      category: "Music",
      organizer: "Miami Beats",
      description: "Watch the best DJs compete for the grand prize in this exciting competition.",
      attendees: 85,
    },
    {
      id: 3,
      title: "Rock & Roll Night",
      date: "December 31, 2023",
      time: "19:00 - 00:00",
      location: "Stadium Arena, Los Angeles",
      image: "https://images.pexels.com/photos/2311713/pexels-photo-2311713.jpeg?auto=compress&cs=tinysrgb&w=600",
      price: "$45",
      category: "Music",
      organizer: "Rock Legends",
      description: "Ring in the new year with classic rock hits and amazing performances.",
      attendees: 200,
    },
  ])

  // Helper function to add a new activity
  const addActivity = (action: string) => {
    setRecentActivities([{ action, timestamp: "Just now" }, ...recentActivities.slice(0, 2)])
  }

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const storedGuests = localStorage.getItem("eps_guests")
        if (storedGuests) setGuests(JSON.parse(storedGuests))

        const storedTasks = localStorage.getItem("eps_tasks")
        if (storedTasks) setTasks(JSON.parse(storedTasks))

        const storedBudget = localStorage.getItem("eps_budget")
        if (storedBudget) setBudget(JSON.parse(storedBudget))

        const storedEvent = localStorage.getItem("eps_event")
        if (storedEvent) {
          const parsedEvent = JSON.parse(storedEvent)
          parsedEvent.date = new Date(parsedEvent.date) // Convert date string back to Date object
          setCurrentEvent(parsedEvent)
        }

        const storedActivities = localStorage.getItem("eps_activities")
        if (storedActivities) setRecentActivities(JSON.parse(storedActivities))

        const storedVendors = localStorage.getItem("eps_vendors")
        if (storedVendors) setVendors(JSON.parse(storedVendors))

        // Add events to localStorage loading
        const storedEvents = localStorage.getItem("eps_events")
        if (storedEvents) setEvents(JSON.parse(storedEvents))
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      }
    }

    loadData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("eps_guests", JSON.stringify(guests))
      localStorage.setItem("eps_tasks", JSON.stringify(tasks))
      localStorage.setItem("eps_budget", JSON.stringify(budget))
      localStorage.setItem("eps_event", JSON.stringify(currentEvent))
      localStorage.setItem("eps_activities", JSON.stringify(recentActivities))
      localStorage.setItem("eps_vendors", JSON.stringify(vendors))
      localStorage.setItem("eps_events", JSON.stringify(events))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }, [guests, tasks, budget, currentEvent, recentActivities, vendors, events])

  // Update the EventContext.Provider value to include events and setEvents
  return (
    <EventContext.Provider
      value={{
        guests,
        setGuests,
        tasks,
        setTasks,
        budget,
        setBudget,
        currentEvent,
        setCurrentEvent,
        recentActivities,
        setRecentActivities,
        addActivity,
        vendors,
        setVendors,
        events,
        setEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider")
  }
  return context
}
