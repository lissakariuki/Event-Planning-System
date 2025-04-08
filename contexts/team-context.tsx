"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { useSupabase } from "@/hooks/use-supabase"
import type { Team, TeamMember, TeamEvent, TeamTask, Guest, TeamVendor, TeamDocument } from "@/lib/types"

// Types
export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  image_url?: string
  price?: number
  createdAt: Date
  createdBy: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  createdBy: string
}

export interface Vendor {
  id: string
  name: string
  category: string
  contact: string
  email?: string
  phone?: string
  website?: string
  notes?: string
  price?: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
  createdBy: string
}

export interface Document {
  id: string
  name: string
  filePath: string
  fileType: string
  fileSize: number
  eventId?: string
  uploadedBy: string
  uploadedAt: Date
}

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
  refreshTeams: () => Promise<void> // Added refreshTeams function

  // Methods for real-time updates
  updateTeamBudget: (teamId: string, current: number, total: number) => Promise<void>
  addTeamMember: (teamId: string, member: TeamMember) => Promise<void>
  removeTeamMember: (teamId: string, userId: string) => Promise<void>
  addTeamEvent: (teamId: string, event: Omit<TeamEvent, "id">) => Promise<TeamEvent | null>
  updateTeamEvent: (teamId: string, eventId: string, data: Partial<TeamEvent>) => Promise<void>
  deleteTeamEvent: (teamId: string, eventId: string) => Promise<void>
  addEventGuest: (teamId: string, eventId: string, guest: Omit<Guest, "id">) => Promise<Guest | null>
  updateEventGuest: (teamId: string, eventId: string, guestId: string, data: Partial<Guest>) => Promise<void>
  removeEventGuest: (teamId: string, eventId: string, guestId: string) => Promise<void>
  addTeamTask: (teamId: string, task: Omit<TeamTask, "id">) => Promise<TeamTask | null>
  updateTeamTask: (teamId: string, taskId: string, data: Partial<TeamTask>) => Promise<void>
  completeTeamTask: (teamId: string, taskId: string) => Promise<void>
  deleteTeamTask: (teamId: string, taskId: string) => Promise<void>
  addTeamVendor: (teamId: string, vendor: Omit<TeamVendor, "id">) => Promise<TeamVendor | null>
  updateTeamVendor: (teamId: string, vendorId: string, data: Partial<TeamVendor>) => Promise<void>
  deleteTeamVendor: (teamId: string, vendorId: string) => Promise<void>
  addTeamDocument: (teamId: string, document: Omit<TeamDocument, "id">) => Promise<TeamDocument | null>
  deleteTeamDocument: (teamId: string, documentId: string) => Promise<void>

  // Aggregated stats for dashboard
  getDashboardStats: () => {
    totalBudget: number
    currentBudget: number
    totalGuests: number
    confirmedGuests: number
    totalTasks: number
    completedTasks: number
    upcomingEvents: (TeamEvent & { teamId: string; teamName: string })[]
    recentActivities: {
      id: string
      title: string
      timestamp: Date
      teamId: string
      teamName: string
      type: "event" | "task" | "member" | "discussion"
    }[]
  }
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<
    {
      id: string
      title: string
      timestamp: Date
      teamId: string
      teamName: string
      type: "event" | "task" | "member" | "discussion"
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const { user, isSignedIn } = useUser()
  const { supabase } = useSupabase()
  const isMounted = useRef(true)

  // Set up isMounted ref for cleanup
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load teams from Supabase
  useEffect(() => {
    async function loadTeams() {
      if (!isSignedIn || !user || !isMounted.current) {
        if (isMounted.current) setIsLoading(false)
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
          if (isMounted.current) {
            setError("Failed to load teams. Please try again.")
            setIsLoading(false)
          }
          return
        }

        if (!memberTeams || memberTeams.length === 0) {
          // No teams found, but this is not an error
          if (isMounted.current) {
            setTeams([])
            setIsLoading(false)
          }
          return
        }

        const teamIds = memberTeams.map((t) => t.team_id)

        // Get team details
        const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*").in("id", teamIds)

        if (teamsError) {
          console.error("Error fetching teams data:", teamsError)
          if (isMounted.current) {
            setError("Failed to load team details. Please try again.")
            setIsLoading(false)
          }
          return
        }

        if (!teamsData || teamsData.length === 0) {
          if (isMounted.current) {
            setTeams([])
            setIsLoading(false)
          }
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

            // Get events for this team
            const { data: events, error: eventsError } = await supabase
              .from("events")
              .select("*")
              .eq("team_id", team.id)

            if (eventsError) {
              console.error("Error fetching team events:", eventsError)
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
              events: events
                ? events.map((event) => ({
                    id: event.id,
                    title: event.title,
                    date: event.date,
                    location: event.location || "",
                    description: event.description || undefined,
                    budget: event.price || 0,
                    attendees: 0, // We don't have this data yet
                    progress: 0, // We don't have this data yet
                    image: event.image_url || undefined,
                  }))
                : [],
            }

            return transformedTeam
          }),
        )

        if (!isMounted.current) return

        // Filter out any null values from failed team fetches
        const validTeams = teamsWithMembers.filter(Boolean) as Team[]
        setTeams(validTeams)

        // Set current team if none is selected - using functional update to avoid dependency
        if (validTeams.length > 0) {
          setCurrentTeam((prev) => prev || validTeams[0])
        }
      } catch (error) {
        console.error("Error loading teams:", error)
        if (isMounted.current) {
          setError("An unexpected error occurred. Please try again.")
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    loadTeams()
  }, [user, isSignedIn, supabase]) // Removed currentTeam from dependencies

  // Function to fetch teams - can be called manually to refresh
  const fetchTeams = useCallback(async () => {
    if (!user || !isMounted.current) return

    setIsLoading(true)
    setError(null)

    try {
      // Get teams the user is a member of
      const { data: teamMemberships, error: membershipError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id)

      if (membershipError) throw membershipError

      if (!teamMemberships || teamMemberships.length === 0) {
        if (isMounted.current) {
          setTeams([])
          setIsLoading(false)
        }
        return
      }

      const teamIds = teamMemberships.map((tm) => tm.team_id)

      // Get team details
      const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*").in("id", teamIds)

      if (teamsError) throw teamsError

      // Transform the data to match our Team interface
      const transformedTeams: Team[] = await Promise.all(
        (teamsData || []).map(async (team) => {
          // Get team members
          const { data: members } = await supabase.from("team_members").select("user_id, role").eq("team_id", team.id)

          // Get events
          const { data: events } = await supabase.from("events").select("*").eq("team_id", team.id)

          return {
            id: team.id,
            name: team.name,
            description: team.description,
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
            events: events
              ? events.map((event) => ({
                  id: event.id,
                  title: event.title,
                  date: event.date,
                  location: event.location || "",
                  description: event.description || undefined,
                  budget: event.price || 0,
                  attendees: 0,
                  progress: 0,
                  image: event.image_url || undefined,
                }))
              : [],
          }
        }),
      )

      if (!isMounted.current) return

      setTeams(transformedTeams)

      // Update current team if it exists in the new data
      setCurrentTeam((prev) => {
        if (!prev) return transformedTeams[0] || null
        const updatedCurrentTeam = transformedTeams.find((t) => t.id === prev.id)
        return updatedCurrentTeam || transformedTeams[0] || null
      })
    } catch (err: any) {
      console.error("Error fetching teams:", err)
      if (isMounted.current) {
        setError(`Failed to load teams: ${err.message}`)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [user, supabase])

  // Add refreshTeams function that uses fetchTeams
  const refreshTeams = useCallback(async () => {
    try {
      await fetchTeams()
      return Promise.resolve()
    } catch (error) {
      console.error("Error refreshing teams:", error)
      return Promise.reject(error)
    }
  }, [fetchTeams])

  // Set up real-time subscriptions for the current team
  useEffect(() => {
    if (!currentTeam?.id) return

    const teamId = currentTeam.id

    // Set up subscriptions
    const eventsSubscription = supabase
      .channel(`events-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          if (!isMounted.current) return
          fetchTeams()
        },
      )
      .subscribe()

    const tasksSubscription = supabase
      .channel(`tasks-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          if (!isMounted.current) return
          fetchTeams()
        },
      )
      .subscribe()

    const membersSubscription = supabase
      .channel(`team_members-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          if (!isMounted.current) return
          fetchTeams()
        },
      )
      .subscribe()

    // Clean up subscriptions
    return () => {
      eventsSubscription.unsubscribe()
      tasksSubscription.unsubscribe()
      membersSubscription.unsubscribe()
    }
  }, [currentTeam?.id, supabase, fetchTeams])

  const createTeam = useCallback(
    async (name: string, description?: string): Promise<Team | null> => {
      if (!user || !isMounted.current) return null

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
            budget_current: 0, // Initialize current budget
            budget_total: 0, // Initialize total budget
            upcoming_events: 0,
            active_members: 1,
          })
          .select()
          .single()

        if (teamError) {
          console.error("Error creating team:", teamError)
          if (isMounted.current) {
            setError(`Failed to create team: ${teamError.message}`)
          }
          return null
        }

        if (!teamData) {
          if (isMounted.current) {
            setError("Failed to create team: No data returned")
          }
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
          if (isMounted.current) {
            setError(`Failed to add you as team owner: ${memberError.message}`)
          }

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
            current: teamData.budget_current || 0, // Map from database
            total: teamData.budget_total || 0, // Map from database
          },
          stats: {
            upcomingEvents: 0,
            activeMembers: 1,
          },
          events: [],
        }

        if (isMounted.current) {
          setTeams((prev) => [...prev, newTeam])
          setCurrentTeam(newTeam)
        }

        return newTeam
      } catch (error: any) {
        console.error("Error creating team:", error)
        if (isMounted.current) {
          setError(`An unexpected error occurred: ${error.message}`)
        }
        return null
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [user, supabase],
  )

  const updateTeam = useCallback(
    async (id: string, data: Partial<Team>) => {
      if (!isMounted.current) return

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
          if (isMounted.current) {
            setError(`Failed to update team: ${error.message}`)
          }
          return
        }

        // Update local state using functional updates
        if (isMounted.current) {
          setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, ...data } : team)))
          setCurrentTeam((prev) => (prev?.id === id ? { ...prev, ...data } : prev))
        }
      } catch (error: any) {
        console.error("Error updating team:", error)
        if (isMounted.current) {
          setError(`An unexpected error occurred: ${error.message}`)
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [supabase],
  )

  const updateTeamBudget = useCallback(
    async (teamId: string, current: number, total: number) => {
      if (!isMounted.current) return

      try {
        const { error } = await supabase
          .from("teams")
          .update({
            budget_current: current,
            budget_total: total,
          })
          .eq("id", teamId)

        if (error) throw error

        // Update local state using functional updates
        if (isMounted.current) {
          setTeams((prev) =>
            prev.map((team) =>
              team.id === teamId
                ? {
                    ...team,
                    budget: { current, total },
                  }
                : team,
            ),
          )

          setCurrentTeam((prev) =>
            prev?.id === teamId
              ? {
                  ...prev,
                  budget: { current, total },
                }
              : prev,
          )
        }
      } catch (error: any) {
        console.error("Error updating team budget:", error)
        if (isMounted.current) {
          setError(`Failed to update budget: ${error.message}`)
        }
      }
    },
    [supabase],
  )

  const deleteTeam = useCallback(
    async (id: string) => {
      if (!isMounted.current) return

      setError(null)
      setIsLoading(true)

      try {
        // Delete from Supabase
        const { error } = await supabase.from("teams").delete().eq("id", id)

        if (error) {
          console.error("Error deleting team:", error)
          if (isMounted.current) {
            setError(`Failed to delete team: ${error.message}`)
          }
          return
        }

        // Update local state using functional updates
        if (isMounted.current) {
          setTeams((prev) => prev.filter((team) => team.id !== id))
          setCurrentTeam((prev) => {
            if (prev?.id === id) {
              const nextTeam = teams.find((team) => team.id !== id)
              return nextTeam || null
            }
            return prev
          })
        }
      } catch (error: any) {
        console.error("Error deleting team:", error)
        if (isMounted.current) {
          setError(`An unexpected error occurred: ${error.message}`)
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [supabase, teams],
  )

  const inviteToTeam = async (teamId: string, email: string) => {
    // In a real app, this would send an invitation email
    console.log(`Inviting ${email} to team ${teamId}`)
  }

  const isTeamMember = useCallback(
    (userId: string, teamId: string): boolean => {
      const team = teams.find((t) => t.id === teamId)
      return !!team?.members.find((member) => member.userId === userId)
    },
    [teams],
  )

  const getUserRole = useCallback(
    (userId: string, teamId: string): "owner" | "admin" | "member" | null => {
      const team = teams.find((t) => t.id === teamId)
      const member = team?.members.find((m) => m.userId === userId)
      return member?.role || null
    },
    [teams],
  )

  // Memoize the setCurrentTeam function to avoid unnecessary re-renders
  const handleSetCurrentTeam = useCallback((team: Team | null) => {
    setCurrentTeam(team)
  }, [])

  // Placeholder implementations for other methods
  const addTeamMember = useCallback(async () => Promise.resolve(), [])
  const removeTeamMember = useCallback(async () => Promise.resolve(), [])
  const addTeamEvent = useCallback(async () => Promise.resolve(null), [])
  const updateTeamEvent = useCallback(async () => Promise.resolve(), [])
  const deleteTeamEvent = useCallback(async () => Promise.resolve(), [])
  const addEventGuest = useCallback(async () => Promise.resolve(null), [])
  const updateEventGuest = useCallback(async () => Promise.resolve(), [])
  const removeEventGuest = useCallback(async () => Promise.resolve(), [])
  const addTeamTask = useCallback(async () => Promise.resolve(null), [])
  const updateTeamTask = useCallback(async () => Promise.resolve(), [])
  const completeTeamTask = useCallback(async () => Promise.resolve(), [])
  const deleteTeamTask = useCallback(async () => Promise.resolve(), [])
  const addTeamVendor = useCallback(async () => Promise.resolve(null), [])
  const updateTeamVendor = useCallback(async () => Promise.resolve(), [])
  const deleteTeamVendor = useCallback(async () => Promise.resolve(), [])
  const addTeamDocument = useCallback(async () => Promise.resolve(null), [])
  const deleteTeamDocument = useCallback(async () => Promise.resolve(), [])

  const getDashboardStats = useCallback(
    () => ({
      totalBudget: 0,
      currentBudget: 0,
      totalGuests: 0,
      confirmedGuests: 0,
      totalTasks: 0,
      completedTasks: 0,
      upcomingEvents: [],
      recentActivities: [],
    }),
    [],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    teams,
    currentTeam,
    setCurrentTeam: handleSetCurrentTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteToTeam,
    isTeamMember,
    getUserRole,
    isLoading,
    error,
    refreshTeams, // Added refreshTeams to the context value
    updateTeamBudget,
    addTeamMember,
    removeTeamMember,
    addTeamEvent,
    updateTeamEvent,
    deleteTeamEvent,
    addEventGuest,
    updateEventGuest,
    removeEventGuest,
    addTeamTask,
    updateTeamTask,
    completeTeamTask,
    deleteTeamTask,
    addTeamVendor,
    updateTeamVendor,
    deleteTeamVendor,
    addTeamDocument,
    deleteTeamDocument,
    getDashboardStats,
  }

  return <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
