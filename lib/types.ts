export interface User {
  id: string
  name: string
  email: string
}

export interface TeamMember {
  userId: string
  role: "owner" | "admin" | "member"
  user: User
}

export interface TeamBudget {
  current: number
  total: number
  logo?: string
  coverImage?: string
}

export interface TeamStats {
  upcomingEvents: number
  activeMembers: number
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

export interface Guest {
  id: string
  name: string
  email: string
  rsvp: "attending" | "declined" | "pending"
  plusOnes: number
}

