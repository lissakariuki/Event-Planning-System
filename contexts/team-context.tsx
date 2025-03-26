"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { useSupabase } from "@/hooks/use-supabase"
import type { Team } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team | null) => void
  createTeam: (name: string, description?: string) => Promise<Team | null>
  updateTeam: (id: string, data: Partial<Team>) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
  inviteToTeam: (teamId: string, email: string) => Promise<void>
  isTeamMember: (userId: string, teamId: string) => boolean
  getUserRole: (userId: string, teamId: string) => "owner" | "admin" | "member" | null
  isLoading: boolean
  error: string | null
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isSignedIn } = useUser()
  const { supabase } = useSupabase()

  // Load teams from Supabase
  useEffect(() => {
    async function loadTeams() {
      if (!isSignedIn || !user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get teams where user is a member
        const { data: memberTeams, error: memberError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)

        if (memberError) {
          console.error("Error fetching team memberships:", memberError)
          setError("Failed to load teams. Please try again.")
          setIsLoading(false)
          return
        }

        if (!memberTeams || memberTeams.length === 0) {
          // No teams found, but this is not an error
          setTeams([])
          setIsLoading(false)
          return
        }

        const teamIds = memberTeams.map((t) => t.team_id)

        // Get team details
        const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*").in("id", teamIds)

        if (teamsError) {
          console.error("Error fetching teams data:", teamsError)
          setError("Failed to load team details. Please try again.")
          setIsLoading(false)
          return
        }

        if (!teamsData || teamsData.length === 0) {
          setTeams([])
          setIsLoading(false)
          return
        }

        // For each team, get its members
        const teamsWithMembers = await Promise.all(
          teamsData.map(async (team) => {
            const { data: members, error: membersError } = await supabase
              .from("team_members")
              .select(`
                id, 
                user_id,
                role
              `)
              .eq("team_id", team.id)

            if (membersError) {
              console.error("Error fetching team members:", membersError)
              return null
            }

            // Transform to match our Team type
            const transformedTeam: Team = {
              id: team.id,
              name: team.name,
              description: team.description || undefined,
              createdAt: new Date(team.created_at),
              ownerId: team.owner_id,
              members: members
                ? members.map((m) => ({
                    userId: m.user_id,
                    role: m.role as "owner" | "admin" | "member",
                    user: {
                      id: m.user_id,
                      name: m.user_id === user.id ? user.fullName || user.username || "Current User" : "Team Member",
                      email: m.user_id === user.id ? user.emailAddresses[0]?.emailAddress || "" : "",
                    },
                  }))
                : [],
              budget: {
                current: team.budget_current || 0,
                total: team.budget_total || 0,
              },
              stats: {
                upcomingEvents: team.upcoming_events || 0,
                activeMembers: team.active_members || 0,
              },
            }

            return transformedTeam
          }),
        )

        // Filter out any null values from failed team fetches
        const validTeams = teamsWithMembers.filter(Boolean) as Team[]
        setTeams(validTeams)

        // Set current team if none is selected
        if (validTeams.length > 0 && !currentTeam) {
          setCurrentTeam(validTeams[0])
        }
      } catch (error) {
        console.error("Error loading teams:", error)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTeams()
  }, [user, isSignedIn, supabase, currentTeam])

  const createTeam = async (name: string, description?: string): Promise<Team | null> => {
    if (!user) return null
  
    setError(null)
    setIsLoading(true)
  

    try {
      // Insert team with budget initialization
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name,
          description,
          owner_id: user.id,
          budget_current: 0,  // Initialize current budget
          budget_total: 0,    // Initialize total budget
          upcoming_events: 0,
          active_members: 1,
        })
        .select()
        .single()

      if (teamError) {
        console.error("Error creating team:", teamError)
        setError(`Failed to create team: ${teamError.message}`)
        return null
      }

      if (!teamData) {
        setError("Failed to create team: No data returned")
        return null
      }

      // Add current user as team owner
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: teamData.id,
        user_id: user.id,
        role: "owner",
      })

      if (memberError) {
        console.error("Error adding team member:", memberError)
        setError(`Failed to add you as team owner: ${memberError.message}`)

        // Clean up the team if we couldn't add the member
        await supabase.from("teams").delete().eq("id", teamData.id)
        return null
      }

      // Create team object
      const newTeam: Team = {
        id: teamData.id,
        name: teamData.name,
        description: teamData.description || undefined,
        createdAt: new Date(teamData.created_at),
        ownerId: user.id,
        members: [
          {
            userId: user.id,
            role: "owner",
            user: {
              id: user.id,
              name: user.fullName || user.username || "Current User",
              email: user.emailAddresses[0]?.emailAddress || "",
            },
          },
        ],
        budget: {
          current: teamData.budget_current || 0,  // Map from database
          total: teamData.budget_total || 0,      // Map from database
        },
        stats: {
          upcomingEvents: 0,
          activeMembers: 1,
        },
      }

      setTeams([...teams, newTeam])
      setCurrentTeam(newTeam)

      return newTeam
    } catch (error: any) {
      console.error("Error creating team:", error)
      setError(`An unexpected error occurred: ${error.message}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateTeam = async (id: string, data: Partial<Team>) => {
    setError(null)
    setIsLoading(true)

    try {
      // Prepare data for Supabase
      const updateData: any = {}

      if (data.name) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.budget) {
        if (data.budget.current !== undefined) updateData.budget_current = data.budget.current
        if (data.budget.total !== undefined) updateData.budget_total = data.budget.total
      }
      if (data.stats) {
        if (data.stats.upcomingEvents !== undefined) updateData.upcoming_events = data.stats.upcomingEvents
        if (data.stats.activeMembers !== undefined) updateData.active_members = data.stats.activeMembers
      }

      // Update in Supabase
      const { error } = await supabase.from("teams").update(updateData).eq("id", id)

      if (error) {
        console.error("Error updating team:", error)
        setError(`Failed to update team: ${error.message}`)
        return
      }

      const updateTeamBudget = async (id: string, newBudget: number) => {
        setError(null)
        setIsLoading(true)
      
        try {
          const { error } = await supabase
            .from("teams")
            .update({ 
              budget_total: newBudget,
              budget_current: newBudget  // Reset current budget when total changes
            })
            .eq("id", id)
      
          if (error) throw error
      
          // Update local state
          setTeams(teams.map(team => 
            team.id === id ? { 
              ...team, 
              budget: { 
                total: newBudget, 
                current: newBudget 
              } 
            } : team
          ));
      
        } catch (error: any) {
          console.error("Error updating budget:", error)
          setError(`Budget update failed: ${error.message}`)
        } finally {
          setIsLoading(false)
        }
      }

      if (currentTeam?.id === id) {
        setCurrentTeam({ ...currentTeam, ...data })
      }
    } catch (error: any) {
      console.error("Error updating team:", error)
      setError(`An unexpected error occurred: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTeam = async (id: string) => {
    setError(null)
    setIsLoading(true)

    try {
      // Delete from Supabase
      const { error } = await supabase.from("teams").delete().eq("id", id)

      if (error) {
        console.error("Error deleting team:", error)
        setError(`Failed to delete team: ${error.message}`)
        return
      }

      // Update local state
      setTeams(teams.filter((team) => team.id !== id))

      if (currentTeam?.id === id) {
        setCurrentTeam(teams.find((team) => team.id !== id) || null)
      }
    } catch (error: any) {
      console.error("Error deleting team:", error)
      setError(`An unexpected error occurred: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const inviteToTeam = async (teamId: string, email: string) => {
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
        isLoading,
        error,
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

