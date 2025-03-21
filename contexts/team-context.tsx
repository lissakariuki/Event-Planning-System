"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Team } from "@/lib/types"

// Mock data for teams
const mockTeams: Team[] = [
  {
    id: "1",
    name: "Wedding Planning Team",
    description: "Team for planning the Johnson wedding",
    createdAt: new Date("2023-01-15"),
    ownerId: "user1",
    members: [
      {
        userId: "user1",
        role: "owner",
        user: { id: "user1", name: "John Smith", email: "john@example.com" },
      },
      {
        userId: "user2",
        role: "admin",
        user: { id: "user2", name: "Sarah Johnson", email: "sarah@example.com" },
      },
      {
        userId: "user3",
        role: "member",
        user: { id: "user3", name: "Mike Davis", email: "mike@example.com" },
      },
    ],
  },
  {
    id: "2",
    name: "Corporate Event Team",
    description: "Annual company retreat planning",
    createdAt: new Date("2023-02-20"),
    ownerId: "user1",
    members: [
      {
        userId: "user1",
        role: "owner",
        user: { id: "user1", name: "John Smith", email: "john@example.com" },
      },
      {
        userId: "user4",
        role: "member",
        user: { id: "user4", name: "Lisa Wong", email: "lisa@example.com" },
      },
    ],
  },
]

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team | null) => void
  createTeam: (name: string, description?: string) => void
  updateTeam: (id: string, data: Partial<Team>) => void
  deleteTeam: (id: string) => void
  inviteToTeam: (teamId: string, email: string) => void
  isTeamMember: (userId: string, teamId: string) => boolean
  getUserRole: (userId: string, teamId: string) => "owner" | "admin" | "member" | null
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)

  // Load teams from API or localStorage
  useEffect(() => {
    // In a real app, you would fetch teams from an API
    // For now, we'll use the mock data
    if (teams.length > 0 && !currentTeam) {
      setCurrentTeam(teams[0])
    }
  }, [teams, currentTeam])

  const createTeam = (name: string, description?: string) => {
    // Mock user ID - in a real app, this would come from authentication
    const userId = "user1"

    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      ownerId: userId,
      members: [
        {
          userId,
          role: "owner",
          user: { id: userId, name: "Current User", email: "user@example.com" },
        },
      ],
    }

    setTeams([...teams, newTeam])
    setCurrentTeam(newTeam)
  }

  const updateTeam = (id: string, data: Partial<Team>) => {
    setTeams(teams.map((team) => (team.id === id ? { ...team, ...data } : team)))

    if (currentTeam?.id === id) {
      setCurrentTeam({ ...currentTeam, ...data })
    }
  }

  const deleteTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id))

    if (currentTeam?.id === id) {
      setCurrentTeam(teams.find((team) => team.id !== id) || null)
    }
  }

  const inviteToTeam = (teamId: string, email: string) => {
    // In a real app, this would send an invitation email
    console.log(`Inviting ${email} to team ${teamId}`)
  }

  const isTeamMember = (userId: string, teamId: string): boolean => {
    const team = teams.find((t) => t.id === teamId)
    return !!team?.members.find((member) => member.userId === userId)
  }

  const getUserRole = (userId: string, teamId: string): "owner" | "admin" | "member" | null => {
    const team = teams.find((t) => t.id === teamId)
    const member = team?.members.find((m) => m.userId === userId)
    return member?.role || null
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeam,
        setCurrentTeam,
        createTeam,
        updateTeam,
        deleteTeam,
        inviteToTeam,
        isTeamMember,
        getUserRole,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}

