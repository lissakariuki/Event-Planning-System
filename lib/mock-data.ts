import type { Team, TeamMember, TeamEvent } from "@/lib/types"

// Mock data for teams with more detailed information
export const teamsData: Record<string, Team> = {
  "1": {
    id: "1",
    name: "Wedding Planning Team",
    description:
      "Team responsible for planning and executing wedding events for clients. We specialize in luxury weddings with attention to detail and personalized experiences.",
    createdAt: new Date("2023-01-15"),
    ownerId: "user1",
    members: [
      {
        userId: "user1",
        role: "owner",
        user: {
          id: "user1",
          name: "John Smith",
          email: "john@example.com",
        },
      },
      {
        userId: "user2",
        role: "admin",
        user: {
          id: "user2",
          name: "Sarah Johnson",
          email: "sarah@example.com",
        },
      },
      {
        userId: "user3",
        role: "member",
        user: {
          id: "user3",
          name: "Mike Davis",
          email: "mike@example.com",
        },
      },
      {
        userId: "user4",
        role: "member",
        user: {
          id: "user4",
          name: "Alice Johnson",
          email: "alice@example.com",
        },
      },
    ],
    budget: {
      current: 45000,
      total: 95000,
      logo: "/placeholder.svg?height=100&width=100&text=W",
      coverImage: "/placeholder.svg?height=300&width=1200",
    },
    stats: {
      upcomingEvents: 3,
      activeMembers: 5,
    },
    events: [
      {
        id: "1",
        title: "Johnson Wedding",
        date: "March 15, 2024",
        location: "Grand Ballroom, Hilton Hotel",
        description: "Luxury wedding for 150 guests with full catering and entertainment package.",
        budget: 35000,
        attendees: 150,
        progress: 65,
        image: "/placeholder.svg?height=200&width=300",
        guests: [
          {
            id: "1",
            name: "John Smith",
            email: "john.smith@example.com",
            rsvp: "attending",
            plusOnes: 1,
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            rsvp: "attending",
            plusOnes: 0,
          },
          {
            id: "3",
            name: "Michael Brown",
            email: "michael.b@example.com",
            rsvp: "pending",
            plusOnes: 0,
          },
          {
            id: "4",
            name: "Emily Davis",
            email: "emily.d@example.com",
            rsvp: "declined",
            plusOnes: 0,
          },
        ],
      },
      {
        id: "2",
        title: "Smith Anniversary",
        date: "April 10, 2024",
        location: "Sunset Gardens",
        description: "Intimate anniversary celebration with gourmet dining experience.",
        budget: 15000,
        attendees: 75,
        progress: 30,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "3",
        title: "Williams Wedding",
        date: "May 22, 2024",
        location: "Beachfront Resort",
        description: "Destination wedding with beach ceremony and reception.",
        budget: 45000,
        attendees: 100,
        progress: 15,
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    tasks: [
      {
        id: "1",
        title: "Book venue for Johnson Wedding",
        description: "Contact Hilton Hotel to finalize booking details and deposit",
        assigneeId: "user2",
        dueDate: "2024-02-20",
        status: "completed",
        priority: "high",
      },
      {
        id: "2",
        title: "Finalize catering menu",
        description: "Review menu options with client and confirm selections",
        assigneeId: "user4",
        dueDate: "2024-02-25",
        status: "in-progress",
        priority: "medium",
      },
      {
        id: "3",
        title: "Send invitations",
        description: "Print and mail invitations to guest list",
        assigneeId: "user1",
        dueDate: "2024-03-01",
        status: "pending",
        priority: "high",
      },
    ],
    vendors: [
      {
        id: "1",
        name: "Elegant Events Venue",
        type: "Venue",
        rating: 4.8,
        price: 500000,
        location: "Nairobi, Kenya",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "2",
        name: "Gourmet Delights Catering",
        type: "Catering",
        rating: 4.5,
        price: 250000,
        location: "Mombasa, Kenya",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    documents: [
      {
        id: "1",
        name: "Team Guidelines.pdf",
        size: "2.4 MB",
        updatedAt: "2024-02-10",
        uploadedBy: "user1",
      },
      {
        id: "2",
        name: "Vendor Contracts.zip",
        size: "5.1 MB",
        updatedAt: "2024-02-15",
        uploadedBy: "user2",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Corporate Event Team",
    description:
      "Team handling all corporate events and conferences for business clients. We focus on professional settings and business networking opportunities.",
    createdAt: new Date("2023-02-20"),
    ownerId: "user1",
    members: [
      {
        userId: "user1",
        role: "owner",
        user: {
          id: "user1",
          name: "John Smith",
          email: "john@example.com",
        },
      },
      {
        userId: "user5",
        role: "admin",
        user: {
          id: "user5",
          name: "Michael Brown",
          email: "michael@example.com",
        },
      },
      {
        userId: "user6",
        role: "member",
        user: {
          id: "user6",
          name: "Sarah Miller",
          email: "sarah.m@example.com",
        },
      },
    ],
    budget: {
      current: 35000,
      total: 150000,
      logo: "/placeholder.svg?height=100&width=100&text=C",
      coverImage: "/placeholder.svg?height=300&width=1200",
    },
    stats: {
      upcomingEvents: 2,
      activeMembers: 3,
    },
    events: [
      {
        id: "4",
        title: "Tech Conference 2024",
        date: "June 5, 2024",
        location: "Convention Center",
        description: "Annual technology conference with keynote speakers and networking opportunities.",
        budget: 75000,
        attendees: 500,
        progress: 45,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "5",
        title: "Executive Retreat",
        date: "July 15-17, 2024",
        location: "Mountain Resort",
        description: "Three-day leadership retreat for executive team building.",
        budget: 45000,
        attendees: 25,
        progress: 20,
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    tasks: [
      {
        id: "4",
        title: "Book speakers for Tech Conference",
        description: "Contact and confirm keynote speakers for the event",
        assigneeId: "user5",
        dueDate: "2024-04-15",
        status: "in-progress",
        priority: "high",
      },
      {
        id: "5",
        title: "Secure venue for Executive Retreat",
        description: "Finalize contract with Mountain Resort",
        assigneeId: "user6",
        dueDate: "2024-04-30",
        status: "pending",
        priority: "medium",
      },
    ],
    vendors: [
      {
        id: "3",
        name: "Business Convention Center",
        type: "Venue",
        rating: 4.6,
        price: 750000,
        location: "Nairobi, Kenya",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    documents: [
      {
        id: "3",
        name: "Corporate Event Proposal.pdf",
        size: "3.2 MB",
        updatedAt: "2024-03-05",
        uploadedBy: "user5",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Music Festival Crew",
    description:
      "Team organizing music festivals and concerts throughout the year. We create unforgettable experiences for music lovers.",
    createdAt: new Date("2023-05-20"),
    ownerId: "user7",
    members: [
      {
        userId: "user7",
        role: "owner",
        user: {
          id: "user7",
          name: "Jessica Taylor",
          email: "jessica@example.com",
        },
      },
      {
        userId: "user8",
        role: "admin",
        user: {
          id: "user8",
          name: "Ryan Martinez",
          email: "ryan@example.com",
        },
      },
      {
        userId: "user9",
        role: "member",
        user: {
          id: "user9",
          name: "Emma Wilson",
          email: "emma@example.com",
        },
      },
    ],
    budget: {
      current: 50000,
      total: 200000,
      logo: "/placeholder.svg?height=100&width=100&text=M",
      coverImage: "/placeholder.svg?height=300&width=1200",
    },
    stats: {
      upcomingEvents: 2,
      activeMembers: 3,
    },
    events: [
      {
        id: "6",
        title: "Summer Music Festival",
        date: "August 10-12, 2024",
        location: "City Park",
        description: "Three-day music festival featuring local and international artists.",
        budget: 120000,
        attendees: 5000,
        progress: 35,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "7",
        title: "Jazz Night",
        date: "September 5, 2024",
        location: "Downtown Jazz Club",
        description: "Evening of jazz performances with dinner and drinks.",
        budget: 25000,
        attendees: 200,
        progress: 10,
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    tasks: [
      {
        id: "6",
        title: "Book headline artists",
        description: "Finalize contracts with main performers",
        assigneeId: "user7",
        dueDate: "2024-05-01",
        status: "in-progress",
        priority: "high",
      },
      {
        id: "7",
        title: "Secure permits for City Park",
        description: "Submit application for event permits and licenses",
        assigneeId: "user8",
        dueDate: "2024-05-15",
        status: "pending",
        priority: "high",
      },
      {
        id: "8",
        title: "Coordinate with food vendors",
        description: "Select and confirm food vendors for the festival",
        assigneeId: "user9",
        dueDate: "2024-06-01",
        status: "pending",
        priority: "medium",
      },
    ],
    vendors: [
      {
        id: "4",
        name: "Sound Masters",
        type: "Audio Equipment",
        rating: 4.9,
        price: 200000,
        location: "Nairobi, Kenya",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "5",
        name: "Stage Craft",
        type: "Stage Setup",
        rating: 4.7,
        price: 150000,
        location: "Mombasa, Kenya",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    documents: [
      {
        id: "4",
        name: "Festival Layout.pdf",
        size: "4.7 MB",
        updatedAt: "2024-04-02",
        uploadedBy: "user7",
      },
      {
        id: "5",
        name: "Artist Contracts.zip",
        size: "8.3 MB",
        updatedAt: "2024-04-10",
        uploadedBy: "user8",
      },
    ],
  },
}

// Function to get a team by ID
export async function getTeam(id: string): Promise<Team | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Return the team if it exists
  return teamsData[id] || null
}

// Function to get all teams
export async function getAllTeams(): Promise<Team[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Return all teams
  return Object.values(teamsData)
}

// Function to update a team
export async function updateTeam(id: string, data: Partial<Team>): Promise<Team | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check if team exists
  if (!teamsData[id]) {
    return null
  }

  // Update the team data
  const updatedTeam = {
    ...teamsData[id],
    ...data,
  }

  // In a real app, this would update the database
  // For now, we'll just update our in-memory object
  teamsData[id] = updatedTeam

  return updatedTeam
}

// Function to create a new team
export async function createTeam(teamData: Partial<Team>): Promise<Team> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Generate a new ID
  const id = `${Object.keys(teamsData).length + 1}`

  // Create the new team
  const newTeam: Team = {
    id,
    name: teamData.name || "New Team",
    description: teamData.description || "",
    createdAt: new Date(),
    ownerId: teamData.ownerId || "user1",
    members: teamData.members || [
      {
        userId: "user1",
        role: "owner",
        user: { id: "user1", name: "John Smith", email: "john@example.com" },
      },
    ],
    budget: teamData.budget || {
      current: 0,
      total: 0,
      logo: `/placeholder.svg?height=100&width=100&text=${teamData.name?.charAt(0) || "N"}`,
      coverImage: "/placeholder.svg?height=300&width=1200",
    },
    stats: teamData.stats || {
      upcomingEvents: 0,
      activeMembers: 1,
    },
    events: teamData.events || [],
    tasks: teamData.tasks || [],
    vendors: teamData.vendors || [],
    documents: teamData.documents || [],
  }

  // Add the new team to our data
  teamsData[id] = newTeam

  return newTeam
}

// Function to delete a team
export async function deleteTeam(id: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check if team exists
  if (!teamsData[id]) {
    return false
  }

  // Delete the team
  delete teamsData[id]

  return true
}

// Function to add a member to a team
export async function addTeamMember(teamId: string, member: TeamMember): Promise<Team | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check if team exists
  if (!teamsData[teamId]) {
    return null
  }

  // Add the member to the team
  const updatedTeam = {
    ...teamsData[teamId],
    members: [...teamsData[teamId].members, member],
  }

  // Update stats
  if (updatedTeam.stats) {
    updatedTeam.stats.activeMembers = updatedTeam.members.length
  }

  // Update the team
  teamsData[teamId] = updatedTeam

  return updatedTeam
}

// Function to add an event to a team
export async function addTeamEvent(teamId: string, event: TeamEvent): Promise<Team | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check if team exists
  if (!teamsData[teamId]) {
    return null
  }

  // Add the event to the team
  const updatedTeam = {
    ...teamsData[teamId],
    events: [...(teamsData[teamId].events || []), event],
  }

  // Update stats
  if (updatedTeam.stats) {
    updatedTeam.stats.upcomingEvents = (updatedTeam.events || []).length
  }

  // Update the team
  teamsData[teamId] = updatedTeam

  return updatedTeam
}

