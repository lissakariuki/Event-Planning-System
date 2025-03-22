export interface User {
    id: string
    name: string
    email: string
    image?: string
  }
  
  export interface Team {
    id: string
    name: string
    description?: string
    createdAt: Date
    ownerId: string
    members: TeamMember[]
  }
  
  export interface TeamMember {
    userId: string
    role: "owner" | "admin" | "member"
    user: User
  }
  
  export interface TeamInvitation {
    id: string
    teamId: string
    email: string
    status: "pending" | "accepted" | "declined"
    createdAt: Date
    expiresAt: Date
  }
  
  export interface Event {
    id: string
    title: string
    date: string
    time: string
    location: string
    description: string
    image: string
    price: string
    category: string
    organizer: string
    teamId: string
    attendees: number
  }
  
  export interface Task {
    id: number
    title: string
    completed: boolean
    assignedTo?: string
    teamId?: string
    eventId?: string
  }
  
  export interface Vendor {
    id: number
    name: string
    type: string
    rating: number
    price: number
    capacity: number | null
    location: string
    teamId?: string
    eventId?: string
  }
  
  export interface Guest {
    id: number
    name: string
    email: string
    rsvp: "Attending" | "Not Attending" | "Pending"
    teamId?: string
    eventId?: string
  }
  
  export interface Budget {
    id: number
    total: number
    spent: number
    categories: BudgetCategory[]
    teamId?: string
    eventId?: string
  }
  
  export interface BudgetCategory {
    name: string
    allocated: number
    spent: number
  }
  
  