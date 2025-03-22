// Mock data for teams with more detailed information
export const teamsData = {
    "1": {
      id: 1,
      name: "Wedding Planning Team",
      description:
        "Team responsible for planning and executing wedding events for clients. We specialize in luxury weddings with attention to detail and personalized experiences.",
      coverImage: "/placeholder.svg?height=300&width=1200",
      logo: "/placeholder.svg?height=100&width=100",
      createdAt: "January 15, 2023",
      members: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "Admin",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Team Lead",
          phone: "+1 (555) 123-4567",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Member",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Event Coordinator",
          phone: "+1 (555) 234-5678",
        },
        {
          id: 3,
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "Member",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Decor Specialist",
          phone: "+1 (555) 345-6789",
        },
      ],
      events: [
        {
          id: 1,
          title: "Johnson Wedding",
          date: "March 15, 2024",
          progress: 65,
          location: "Grand Ballroom, Hilton Hotel",
          budget: 35000,
          guests: 150,
          image: "/placeholder.svg?height=200&width=300",
        },
        {
          id: 2,
          title: "Smith Anniversary",
          date: "April 10, 2024",
          progress: 30,
          location: "Sunset Gardens",
          budget: 15000,
          guests: 75,
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      tasks: [
        {
          id: 1,
          title: "Book venue for Johnson Wedding",
          assignee: "Jane Smith",
          dueDate: "Feb 20, 2024",
          status: "Completed",
          priority: "High",
        },
        {
          id: 2,
          title: "Finalize catering menu",
          assignee: "Alice Johnson",
          dueDate: "Feb 25, 2024",
          status: "In Progress",
          priority: "Medium",
        },
        {
          id: 3,
          title: "Send invitations",
          assignee: "John Doe",
          dueDate: "Mar 1, 2024",
          status: "Pending",
          priority: "High",
        },
      ],
      vendors: [
        {
          id: 1,
          name: "Elegant Events Venue",
          type: "Venue",
          rating: 4.8,
          price: 500000,
          location: "Nairobi, Kenya",
          image: "/placeholder.svg?height=200&width=300",
        },
        {
          id: 2,
          name: "Gourmet Delights Catering",
          type: "Catering",
          rating: 4.5,
          price: 250000,
          location: "Mombasa, Kenya",
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      documents: [
        { id: 1, name: "Team Guidelines.pdf", size: "2.4 MB", updatedAt: "Feb 10, 2024", uploadedBy: "John Doe" },
        { id: 2, name: "Vendor Contracts.zip", size: "5.1 MB", updatedAt: "Feb 15, 2024", uploadedBy: "Jane Smith" },
      ],
      settings: {
        notificationPreferences: {
          email: true,
          inApp: true,
          taskAssignments: true,
          eventUpdates: true,
        },
        teamVisibility: "Public",
        memberPermissions: {
          canInviteMembers: true,
          canCreateEvents: true,
          canEditTeamSettings: false,
        },
      },
      stats: {
        totalBudget: 95000,
        allocatedBudget: 75000,
        spentBudget: 45000,
        upcomingEvents: 3,
        completedEvents: 12,
        activeMembers: 5,
      },
    },
    "2": {
      id: 2,
      name: "Corporate Events",
      description:
        "Team handling all corporate events and conferences for business clients. We focus on professional settings and business networking opportunities.",
      coverImage: "/placeholder.svg?height=300&width=1200",
      logo: "/placeholder.svg?height=100&width=100",
      createdAt: "March 5, 2023",
      members: [
        {
          id: 6,
          name: "Michael Brown",
          email: "michael@example.com",
          role: "Admin",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Team Lead",
          phone: "+1 (555) 678-9012",
        },
        {
          id: 7,
          name: "Sarah Miller",
          email: "sarah@example.com",
          role: "Member",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Corporate Relations",
          phone: "+1 (555) 789-0123",
        },
      ],
      events: [
        {
          id: 4,
          title: "Tech Conference 2024",
          date: "June 5, 2024",
          progress: 45,
          location: "Convention Center",
          budget: 75000,
          guests: 500,
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      tasks: [
        {
          id: 6,
          title: "Book speakers for Tech Conference",
          assignee: "Michael Brown",
          dueDate: "Apr 15, 2024",
          status: "In Progress",
          priority: "High",
        },
      ],
      vendors: [
        {
          id: 4,
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
          id: 4,
          name: "Corporate Event Proposal.pdf",
          size: "3.2 MB",
          updatedAt: "Mar 5, 2024",
          uploadedBy: "Michael Brown",
        },
      ],
      settings: {
        notificationPreferences: {
          email: true,
          inApp: true,
          taskAssignments: true,
          eventUpdates: true,
        },
        teamVisibility: "Private",
        memberPermissions: {
          canInviteMembers: false,
          canCreateEvents: true,
          canEditTeamSettings: false,
        },
      },
      stats: {
        totalBudget: 150000,
        allocatedBudget: 100000,
        spentBudget: 35000,
        upcomingEvents: 2,
        completedEvents: 8,
        activeMembers: 3,
      },
    },
    "3": {
      id: 3,
      name: "Music Festival Crew",
      description:
        "Team organizing music festivals and concerts throughout the year. We create unforgettable experiences for music lovers.",
      coverImage: "/placeholder.svg?height=300&width=1200",
      logo: "/placeholder.svg?height=100&width=100",
      createdAt: "May 20, 2023",
      members: [
        {
          id: 9,
          name: "Jessica Taylor",
          email: "jessica@example.com",
          role: "Admin",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Festival Director",
          phone: "+1 (555) 901-2345",
        },
        {
          id: 10,
          name: "Ryan Martinez",
          email: "ryan@example.com",
          role: "Member",
          avatar: "/placeholder.svg?height=40&width=40",
          position: "Artist Relations",
          phone: "+1 (555) 012-3456",
        },
      ],
      events: [
        {
          id: 6,
          title: "Summer Music Festival",
          date: "August 10-12, 2024",
          progress: 35,
          location: "City Park",
          budget: 120000,
          guests: 5000,
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      tasks: [
        {
          id: 8,
          title: "Book headline artists",
          assignee: "Jessica Taylor",
          dueDate: "May 1, 2024",
          status: "In Progress",
          priority: "High",
        },
      ],
      vendors: [
        {
          id: 6,
          name: "Sound Masters",
          type: "Audio Equipment",
          rating: 4.9,
          price: 200000,
          location: "Nairobi, Kenya",
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      documents: [
        { id: 6, name: "Festival Layout.pdf", size: "4.7 MB", updatedAt: "Apr 2, 2024", uploadedBy: "Jessica Taylor" },
      ],
      settings: {
        notificationPreferences: {
          email: true,
          inApp: true,
          taskAssignments: true,
          eventUpdates: true,
        },
        teamVisibility: "Public",
        memberPermissions: {
          canInviteMembers: true,
          canCreateEvents: true,
          canEditTeamSettings: true,
        },
      },
      stats: {
        totalBudget: 200000,
        allocatedBudget: 155000,
        spentBudget: 50000,
        upcomingEvents: 2,
        completedEvents: 5,
        activeMembers: 3,
      },
    },
  }
  
  // Function to get a team by ID
  export async function getTeam(id: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  
    // Return the team if it exists
    return teamsData[id as keyof typeof teamsData] || null
  }
  
  // Function to update a team
  export async function updateTeam(id: string, data: Partial<(typeof teamsData)[keyof typeof teamsData]>) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  
    // Check if team exists
    if (!teamsData[id as keyof typeof teamsData]) {
      return null
    }
  
    // Update the team data
    const updatedTeam = {
      ...teamsData[id as keyof typeof teamsData],
      ...data,
    }
  
    // In a real app, this would update the database
    // For now, we'll just update our in-memory object
    teamsData[id as keyof typeof teamsData] = updatedTeam
  
    return updatedTeam
  }
  
  