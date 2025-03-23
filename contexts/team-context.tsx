"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Team, TeamMember, TeamEvent, TeamTask, Guest, TeamVendor, TeamDocument } from "@/lib/types"
import { teamsData, getAllTeams } from "@/lib/mock-data"

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  setCurrentTeam: (team: Team | null) => void
  createTeam: (
    name: string,
    description?: string,
    budget?: { current: number; total: number; logo?: string; coverImage?: string },
  ) => Team
  updateTeam: (id: string, data: Partial<Team>) => void
  deleteTeam: (id: string) => void
  inviteToTeam: (teamId: string, email: string, role: string) => void
  isTeamMember: (userId: string, teamId: string) => boolean
  getUserRole: (userId: string, teamId: string) => "owner" | "admin" | "member" | null
  isLoading: boolean

  // New methods for real-time updates
  updateTeamBudget: (teamId: string, current: number, total: number) => void
  addTeamMember: (teamId: string, member: TeamMember) => void
  removeTeamMember: (teamId: string, userId: string) => void
  addTeamEvent: (teamId: string, event: Omit<TeamEvent, "id">) => TeamEvent
  updateTeamEvent: (teamId: string, eventId: string, data: Partial<TeamEvent>) => void
  deleteTeamEvent: (teamId: string, eventId: string) => void
  addEventGuest: (teamId: string, eventId: string, guest: Omit<Guest, "id">) => Guest
  updateEventGuest: (teamId: string, eventId: string, guestId: string, data: Partial<Guest>) => void
  removeEventGuest: (teamId: string, eventId: string, guestId: string) => void
  addTeamTask: (teamId: string, task: Omit<TeamTask, "id">) => TeamTask
  updateTeamTask: (teamId: string, taskId: string, data: Partial<TeamTask>) => void
  completeTeamTask: (teamId: string, taskId: string) => void
  deleteTeamTask: (teamId: string, taskId: string) => void
  addTeamVendor: (teamId: string, vendor: Omit<TeamVendor, "id">) => TeamVendor
  updateTeamVendor: (teamId: string, vendorId: string, data: Partial<TeamVendor>) => void
  deleteTeamVendor: (teamId: string, vendorId: string) => void
  addTeamDocument: (teamId: string, document: Omit<TeamDocument, "id">) => TeamDocument
  deleteTeamDocument: (teamId: string, documentId: string) => void

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
  const [teams, setTeams] = useState<Team[]>(Object.values(teamsData))
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

  // Load teams on initial render
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)
        const allTeams = await getAllTeams()

        // Try to load from localStorage first
        const storedTeams = localStorage.getItem("teams")
        if (storedTeams) {
          try {
            const parsedTeams = JSON.parse(storedTeams)
            // Convert string dates back to Date objects
            const teamsWithDates = parsedTeams.map((team: any) => ({
              ...team,
              createdAt: new Date(team.createdAt),
            }))
            setTeams(teamsWithDates)
          } catch (error) {
            console.error("Failed to parse stored teams:", error)
            // Fall back to mock data
            setTeams(allTeams)
          }
        } else {
          // No stored teams, use mock data
          setTeams(allTeams)
        }

        // Initialize recent activities
        const initialActivities = [
          {
            id: "1",
            title: "Venue booked for Johnson Wedding",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            teamId: allTeams[0]?.id || "1",
            teamName: allTeams[0]?.name || "Wedding Planning Team",
            type: "event" as const,
          },
          {
            id: "2",
            title: "Catering menu finalized",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            teamId: allTeams[0]?.id || "1",
            teamName: allTeams[0]?.name || "Wedding Planning Team",
            type: "task" as const,
          },
          {
            id: "3",
            title: "Sarah Johnson joined the team",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            teamId: allTeams[0]?.id || "1",
            teamName: allTeams[0]?.name || "Wedding Planning Team",
            type: "member" as const,
          },
          {
            id: "4",
            title: 'New discussion: "Venue options for Tech Conference"',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            teamId: allTeams[1]?.id || "2",
            teamName: allTeams[1]?.name || "Corporate Event Team",
            type: "discussion" as const,
          },
        ]
        setRecentActivities(initialActivities)
      } catch (error) {
        console.error("Error fetching teams:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  // Save teams to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("teams", JSON.stringify(teams))
    }
  }, [teams, isLoading])

  // Set current team if none is selected
  useEffect(() => {
    if (teams.length > 0 && !currentTeam && !isLoading) {
      setCurrentTeam(teams[0])
    }
  }, [teams, currentTeam, isLoading])

  // Add a new activity to the recent activities list
  const addActivity = useCallback(
    (activity: {
      title: string
      teamId: string
      teamName: string
      type: "event" | "task" | "member" | "discussion"
    }) => {
      const newActivity = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...activity,
      }

      setRecentActivities((prev) => [newActivity, ...prev].slice(0, 20)) // Keep only the 20 most recent activities
    },
    [],
  )

  // Create a new team
  const createTeam = useCallback(
    (
      name: string,
      description?: string,
      budget?: { current: number; total: number; logo?: string; coverImage?: string },
    ): Team => {
      // Mock user ID - in a real app, this would come from authentication
      const userId = "user1"
      const userName = "Current User"
      const userEmail = "user@example.com"

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
            user: { id: userId, name: userName, email: userEmail },
          },
        ],
        budget: budget || {
          current: 0,
          total: 0,
          logo: `/placeholder.svg?height=100&width=100&text=${name.charAt(0)}`,
          coverImage: "/placeholder.svg?height=300&width=1200",
        },
        stats: {
          upcomingEvents: 0,
          activeMembers: 1,
        },
        events: [],
        tasks: [],
        vendors: [],
        documents: [],
      }

      setTeams((prevTeams) => [...prevTeams, newTeam])
      setCurrentTeam(newTeam)

      // Add activity
      addActivity({
        title: `Team "${name}" created`,
        teamId: newTeam.id,
        teamName: newTeam.name,
        type: "event",
      })

      return newTeam
    },
    [addActivity],
  )

  // Update an existing team
  const updateTeam = useCallback(
    (id: string, data: Partial<Team>) => {
      setTeams((prevTeams) => prevTeams.map((team) => (team.id === id ? { ...team, ...data } : team)))

      if (currentTeam?.id === id) {
        setCurrentTeam((prevTeam) => (prevTeam ? { ...prevTeam, ...data } : null))
      }

      // Add activity if name or description changed
      if (data.name || data.description) {
        const team = teams.find((t) => t.id === id)
        if (team) {
          addActivity({
            title: `Team "${team.name}" updated`,
            teamId: team.id,
            teamName: team.name,
            type: "event",
          })
        }
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Delete a team
  const deleteTeam = useCallback(
    (id: string) => {
      const teamToDelete = teams.find((team) => team.id === id)

      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== id))

      if (currentTeam?.id === id) {
        const remainingTeams = teams.filter((team) => team.id !== id)
        setCurrentTeam(remainingTeams.length > 0 ? remainingTeams[0] : null)
      }

      // Add activity
      if (teamToDelete) {
        addActivity({
          title: `Team "${teamToDelete.name}" deleted`,
          teamId: "system",
          teamName: "System",
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Update team budget
  const updateTeamBudget = useCallback(
    (teamId: string, current: number, total: number) => {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedBudget = {
              ...(team.budget || {}),
              current,
              total,
            }

            return {
              ...team,
              budget: updatedBudget,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            budget: {
              ...(prevTeam.budget || {}),
              current,
              total,
            },
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `Budget updated for "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a team member
  const addTeamMember = useCallback(
    (teamId: string, member: TeamMember) => {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedMembers = [...team.members, member]

            return {
              ...team,
              members: updatedMembers,
              stats: {
                ...(team.stats || {}),
                activeMembers: updatedMembers.length,
              },
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedMembers = [...prevTeam.members, member]

          return {
            ...prevTeam,
            members: updatedMembers,
            stats: {
              ...(prevTeam.stats || {}),
              activeMembers: updatedMembers.length,
            },
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `${member.user.name} joined "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "member",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Remove a team member
  const removeTeamMember = useCallback(
    (teamId: string, userId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const member = team?.members.find((m) => m.userId === userId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedMembers = team.members.filter((m) => m.userId !== userId)

            return {
              ...team,
              members: updatedMembers,
              stats: {
                ...(team.stats || {}),
                activeMembers: updatedMembers.length,
              },
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedMembers = prevTeam.members.filter((m) => m.userId !== userId)

          return {
            ...prevTeam,
            members: updatedMembers,
            stats: {
              ...(prevTeam.stats || {}),
              activeMembers: updatedMembers.length,
            },
          }
        })
      }

      // Add activity
      if (team && member) {
        addActivity({
          title: `${member.user.name} left "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "member",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a team event
  const addTeamEvent = useCallback(
    (teamId: string, eventData: Omit<TeamEvent, "id">): TeamEvent => {
      const newEvent: TeamEvent = {
        id: Date.now().toString(),
        ...eventData,
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = [...(team.events || []), newEvent]

            return {
              ...team,
              events: updatedEvents,
              stats: {
                ...(team.stats || {}),
                upcomingEvents: updatedEvents.length,
              },
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = [...(prevTeam.events || []), newEvent]

          return {
            ...prevTeam,
            events: updatedEvents,
            stats: {
              ...(prevTeam.stats || {}),
              upcomingEvents: updatedEvents.length,
            },
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `New event "${newEvent.title}" created for "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }

      return newEvent
    },
    [teams, currentTeam, addActivity],
  )

  // Update a team event
  const updateTeamEvent = useCallback(
    (teamId: string, eventId: string, data: Partial<TeamEvent>) => {
      const team = teams.find((t) => t.id === teamId)
      const event = team?.events?.find((e) => e.id === eventId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = (team.events || []).map((event) =>
              event.id === eventId ? { ...event, ...data } : event,
            )

            return {
              ...team,
              events: updatedEvents,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = (prevTeam.events || []).map((event) =>
            event.id === eventId ? { ...event, ...data } : event,
          )

          return {
            ...prevTeam,
            events: updatedEvents,
          }
        })
      }

      // Add activity if title or date changed
      if (team && event && (data.title || data.date)) {
        addActivity({
          title: `Event "${event.title}" updated for "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Delete a team event
  const deleteTeamEvent = useCallback(
    (teamId: string, eventId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const event = team?.events?.find((e) => e.id === eventId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = (team.events || []).filter((event) => event.id !== eventId)

            return {
              ...team,
              events: updatedEvents,
              stats: {
                ...(team.stats || {}),
                upcomingEvents: updatedEvents.length,
              },
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = (prevTeam.events || []).filter((event) => event.id !== eventId)

          return {
            ...prevTeam,
            events: updatedEvents,
            stats: {
              ...(prevTeam.stats || {}),
              upcomingEvents: updatedEvents.length,
            },
          }
        })
      }

      // Add activity
      if (team && event) {
        addActivity({
          title: `Event "${event.title}" deleted from "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a guest to an event
  const addEventGuest = useCallback(
    (teamId: string, eventId: string, guestData: Omit<Guest, "id">): Guest => {
      const newGuest: Guest = {
        id: Date.now().toString(),
        ...guestData,
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = (team.events || []).map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  guests: [...(event.guests || []), newGuest],
                }
              }
              return event
            })

            return {
              ...team,
              events: updatedEvents,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = (prevTeam.events || []).map((event) => {
            if (event.id === eventId) {
              return {
                ...event,
                guests: [...(event.guests || []), newGuest],
              }
            }
            return event
          })

          return {
            ...prevTeam,
            events: updatedEvents,
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      const event = team?.events?.find((e) => e.id === eventId)
      if (team && event) {
        addActivity({
          title: `Guest "${newGuest.name}" added to "${event.title}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }

      return newGuest
    },
    [teams, currentTeam, addActivity],
  )

  // Update a guest's information
  const updateEventGuest = useCallback(
    (teamId: string, eventId: string, guestId: string, data: Partial<Guest>) => {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = (team.events || []).map((event) => {
              if (event.id === eventId) {
                const updatedGuests = (event.guests || []).map((guest) =>
                  guest.id === guestId ? { ...guest, ...data } : guest,
                )

                return {
                  ...event,
                  guests: updatedGuests,
                }
              }
              return event
            })

            return {
              ...team,
              events: updatedEvents,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = (prevTeam.events || []).map((event) => {
            if (event.id === eventId) {
              const updatedGuests = (event.guests || []).map((guest) =>
                guest.id === guestId ? { ...guest, ...data } : guest,
              )

              return {
                ...event,
                guests: updatedGuests,
              }
            }
            return event
          })

          return {
            ...prevTeam,
            events: updatedEvents,
          }
        })
      }

      // Add activity if RSVP status changed
      if (data.rsvp) {
        const team = teams.find((t) => t.id === teamId)
        const event = team?.events?.find((e) => e.id === eventId)
        const guest = event?.guests?.find((g) => g.id === guestId)

        if (team && event && guest) {
          addActivity({
            title: `Guest "${guest.name}" ${data.rsvp === "attending" ? "confirmed attendance" : data.rsvp === "declined" ? "declined" : "updated RSVP"} for "${event.title}"`,
            teamId: team.id,
            teamName: team.name,
            type: "event",
          })
        }
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Remove a guest from an event
  const removeEventGuest = useCallback(
    (teamId: string, eventId: string, guestId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const event = team?.events?.find((e) => e.id === eventId)
      const guest = event?.guests?.find((g) => g.id === guestId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedEvents = (team.events || []).map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  guests: (event.guests || []).filter((guest) => guest.id !== guestId),
                }
              }
              return event
            })

            return {
              ...team,
              events: updatedEvents,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedEvents = (prevTeam.events || []).map((event) => {
            if (event.id === eventId) {
              return {
                ...event,
                guests: (event.guests || []).filter((guest) => guest.id !== guestId),
              }
            }
            return event
          })

          return {
            ...prevTeam,
            events: updatedEvents,
          }
        })
      }

      // Add activity
      if (team && event && guest) {
        addActivity({
          title: `Guest "${guest.name}" removed from "${event.title}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a task to a team
  const addTeamTask = useCallback(
    (teamId: string, taskData: Omit<TeamTask, "id">): TeamTask => {
      const newTask: TeamTask = {
        id: Date.now().toString(),
        ...taskData,
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              tasks: [...(team.tasks || []), newTask],
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            tasks: [...(prevTeam.tasks || []), newTask],
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `New task "${newTask.title}" created for "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "task",
        })
      }

      return newTask
    },
    [teams, currentTeam, addActivity],
  )

  // Update a team task
  const updateTeamTask = useCallback(
    (teamId: string, taskId: string, data: Partial<TeamTask>) => {
      const team = teams.find((t) => t.id === teamId)
      const task = team?.tasks?.find((t) => t.id === taskId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedTasks = (team.tasks || []).map((task) => (task.id === taskId ? { ...task, ...data } : task))

            return {
              ...team,
              tasks: updatedTasks,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedTasks = (prevTeam.tasks || []).map((task) => (task.id === taskId ? { ...task, ...data } : task))

          return {
            ...prevTeam,
            tasks: updatedTasks,
          }
        })
      }

      // Add activity if status changed
      if (data.status && team && task) {
        addActivity({
          title: `Task "${task.title}" ${data.status === "completed" ? "completed" : `marked as ${data.status}`} for "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "task",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Mark a task as completed
  const completeTeamTask = useCallback(
    (teamId: string, taskId: string) => {
      updateTeamTask(teamId, taskId, { status: "completed" })
    },
    [updateTeamTask],
  )

  // Delete a team task
  const deleteTeamTask = useCallback(
    (teamId: string, taskId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const task = team?.tasks?.find((t) => t.id === taskId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              tasks: (team.tasks || []).filter((task) => task.id !== taskId),
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            tasks: (prevTeam.tasks || []).filter((task) => task.id !== taskId),
          }
        })
      }

      // Add activity
      if (team && task) {
        addActivity({
          title: `Task "${task.title}" deleted from "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "task",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a vendor to a team
  const addTeamVendor = useCallback(
    (teamId: string, vendorData: Omit<TeamVendor, "id">): TeamVendor => {
      const newVendor: TeamVendor = {
        id: Date.now().toString(),
        ...vendorData,
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              vendors: [...(team.vendors || []), newVendor],
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            vendors: [...(prevTeam.vendors || []), newVendor],
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `New vendor "${newVendor.name}" added to "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }

      return newVendor
    },
    [teams, currentTeam, addActivity],
  )

  // Update a team vendor
  const updateTeamVendor = useCallback(
    (teamId: string, vendorId: string, data: Partial<TeamVendor>) => {
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            const updatedVendors = (team.vendors || []).map((vendor) =>
              vendor.id === vendorId ? { ...vendor, ...data } : vendor,
            )

            return {
              ...team,
              vendors: updatedVendors,
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          const updatedVendors = (prevTeam.vendors || []).map((vendor) =>
            vendor.id === vendorId ? { ...vendor, ...data } : vendor,
          )

          return {
            ...prevTeam,
            vendors: updatedVendors,
          }
        })
      }
    },
    [teams, currentTeam],
  )

  // Delete a team vendor
  const deleteTeamVendor = useCallback(
    (teamId: string, vendorId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const vendor = team?.vendors?.find((v) => v.id === vendorId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              vendors: (team.vendors || []).filter((vendor) => vendor.id !== vendorId),
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            vendors: (prevTeam.vendors || []).filter((vendor) => vendor.id !== vendorId),
          }
        })
      }

      // Add activity
      if (team && vendor) {
        addActivity({
          title: `Vendor "${vendor.name}" removed from "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Add a document to a team
  const addTeamDocument = useCallback(
    (teamId: string, documentData: Omit<TeamDocument, "id">): TeamDocument => {
      const newDocument: TeamDocument = {
        id: Date.now().toString(),
        ...documentData,
      }

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              documents: [...(team.documents || []), newDocument],
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            documents: [...(prevTeam.documents || []), newDocument],
          }
        })
      }

      // Add activity
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        addActivity({
          title: `New document "${newDocument.name}" uploaded to "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }

      return newDocument
    },
    [teams, currentTeam, addActivity],
  )

  // Delete a team document
  const deleteTeamDocument = useCallback(
    (teamId: string, documentId: string) => {
      const team = teams.find((t) => t.id === teamId)
      const document = team?.documents?.find((d) => d.id === documentId)

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              documents: (team.documents || []).filter((doc) => doc.id !== documentId),
            }
          }
          return team
        }),
      )

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam((prevTeam) => {
          if (!prevTeam) return null

          return {
            ...prevTeam,
            documents: (prevTeam.documents || []).filter((doc) => doc.id !== documentId),
          }
        })
      }

      // Add activity
      if (team && document) {
        addActivity({
          title: `Document "${document.name}" deleted from "${team.name}"`,
          teamId: team.id,
          teamName: team.name,
          type: "event",
        })
      }
    },
    [teams, currentTeam, addActivity],
  )

  // Invite a user to a team
  const inviteToTeam = useCallback(
    (teamId: string, email: string, role: string) => {
      // In a real app, this would send an invitation email
      // For now, we'll just add the user directly
      const newMemberId = `user${Date.now()}`
      const newMember: TeamMember = {
        userId: newMemberId,
        role: role.toLowerCase() as "owner" | "admin" | "member",
        user: {
          id: newMemberId,
          name: email.split("@")[0], // Use part of email as name
          email,
        },
      }

      addTeamMember(teamId, newMember)
    },
    [addTeamMember],
  )

  // Check if a user is a member of a team
  const isTeamMember = useCallback(
    (userId: string, teamId: string): boolean => {
      const team = teams.find((t) => t.id === teamId)
      return !!team?.members.find((member) => member.userId === userId)
    },
    [teams],
  )

  // Get a user's role in a team
  const getUserRole = useCallback(
    (userId: string, teamId: string): "owner" | "admin" | "member" | null => {
      const team = teams.find((t) => t.id === teamId)
      const member = team?.members.find((m) => m.userId === userId)
      return member?.role || null
    },
    [teams],
  )

  // Get aggregated stats for the dashboard
  const getDashboardStats = useCallback(() => {
    // Calculate total and current budget across all teams
    const totalBudget = teams.reduce((sum, team) => sum + (team.budget?.total || 0), 0)
    const currentBudget = teams.reduce((sum, team) => sum + (team.budget?.current || 0), 0)

    // Calculate total and confirmed guests
    let totalGuests = 0
    let confirmedGuests = 0

    teams.forEach((team) => {
      if (team.events) {
        team.events.forEach((event) => {
          if (event.guests) {
            totalGuests += event.guests.length
            confirmedGuests += event.guests.filter((guest) => guest.rsvp === "attending").length
          }
        })
      }
    })

    // If no guests data, use placeholder values
    if (totalGuests === 0) {
      totalGuests = 150
      confirmedGuests = 75
    }

    // Calculate total and completed tasks
    let allTasks: TeamTask[] = []
    teams.forEach((team) => {
      if (team.tasks && team.tasks.length > 0) {
        allTasks = [...allTasks, ...team.tasks]
      }
    })
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((task) => task.status === "completed").length

    // Get upcoming events from all teams
    let allEvents: (TeamEvent & { teamId: string; teamName: string })[] = []
    teams.forEach((team) => {
      if (team.events && team.events.length > 0) {
        const teamEvents = team.events.map((event) => ({
          ...event,
          teamId: team.id,
          teamName: team.name,
        }))
        allEvents = [...allEvents, ...teamEvents]
      }
    })

    // Sort events by date and take the next 3
    const upcomingEvents = allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3)

    return {
      totalBudget,
      currentBudget,
      totalGuests,
      confirmedGuests,
      totalTasks,
      completedTasks,
      upcomingEvents,
      recentActivities,
    }
  }, [teams, recentActivities])

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

