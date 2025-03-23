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
    budget?: TeamBudget
    stats?: TeamStats
    events?: TeamEvent[]
    tasks?: TeamTask[]
    vendors?: TeamVendor[]
    documents?: TeamDocument[]
  }
  

  export interface TeamBudget {
    total: number
    current: number
    logo?: string
    coverImage?: string
  }
  
  export interface TeamStats {
    upcomingEvents: number
    activeMembers: number
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
  
  export interface TeamEvent {
    id: string
    title: string
    date: string
    location: string
    description?: string
    budget: number
    attendees: number
    progress: number
    image?: string
    guests?: Guest[]
  }

  export interface Guest {
    id: number
    name: string
    email: string
    rsvp: "Attending" | "Not Attending" | "Pending"
    plusOnes: number
  }
  
  export interface TeamVendor {
    id: string
    name: string
    type: string
    rating: number
    price: number
    location: string
    image?: string
  }
  
  export interface TeamTask {
    id: string
    title: string
    description?: string
    assigneeId?: string
    dueDate: string
    status: "pending" | "in-progress" | "completed"
    priority: "low" | "medium" | "high"
  }
  
  export interface TeamDocument {
    id: string
    name: string
    size: string
    updatedAt: string
    uploadedBy: string
    url?: string
  }