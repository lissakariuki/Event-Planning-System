"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, DollarSign, CheckSquare, Loader2, Users, Plus } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useSupabase, useRealtimeSubscription } from "@/hooks/use-supabase"
import { useUser } from "@clerk/nextjs"
import { AlertDisplay } from "@/components/ui/alert-display"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const { currentTeam, isLoading: isTeamLoading } = useTeam()
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [tasks, setTasks] = useState<{ total: number; completed: number }>({ total: 0, completed: 0 })
  const [events, setEvents] = useState<{ total: number; upcoming: number }>({ total: 0, upcoming: 0 })
  const [recentActivities, setRecentActivities] = useState<{ title: string; date: string }[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Fetch tasks data
  const fetchTasks = async () => {
    if (!currentTeam) return []

    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("team_id", currentTeam.id)

      if (error) {
        console.error("Error loading tasks:", error)
        setDataError("Failed to load tasks")
        return []
      }

      if (data) {
        const completedTasks = data.filter((task) => task.completed).length
        setTasks({
          total: data.length,
          completed: completedTasks,
        })

        // Get upcoming tasks (limit to 3)
        setUpcomingTasks(
          data
            .filter((task) => !task.completed)
            .slice(0, 3)
            .map((task) => ({
              id: task.id,
              title: task.title,
              completed: task.completed,
            })),
        )
      }

      return data || []
    } catch (error) {
      console.error("Error in fetchTasks:", error)
      setDataError("An unexpected error occurred while loading tasks")
      return []
    }
  }

  // Fetch events data
  const fetchEvents = async () => {
    if (!currentTeam) return []

    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase.from("events").select("*").eq("team_id", currentTeam.id)

      if (error) {
        console.error("Error loading events:", error)
        setDataError("Failed to load events")
        return []
      }

      if (data) {
        const upcomingEvents = data.filter((event) => new Date(event.date) > new Date()).length
        setEvents({
          total: data.length,
          upcoming: upcomingEvents,
        })

        // Get recent activities
        const recentItems = [
          ...data.map((event) => ({
            title: `Event "${event.title}" created`,
            date: new Date(event.created_at).toLocaleDateString(),
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)

        setRecentActivities(recentItems)
      }

      return data || []
    } catch (error) {
      console.error("Error in fetchEvents:", error)
      setDataError("An unexpected error occurred while loading events")
      return []
    }
  }

  // Set up real-time subscriptions
  useRealtimeSubscription(
    "tasks",
    currentTeam?.id,
    () => {
      fetchTasks()
    },
    fetchTasks,
  )

  useRealtimeSubscription(
    "events",
    currentTeam?.id,
    () => {
      fetchEvents()
    },
    fetchEvents,
  )

  // Initial data load
  useEffect(() => {
    async function loadData() {
      if (!currentTeam) return

      setIsDataLoading(true)
      setDataError(null)

      try {
        await Promise.all([fetchTasks(), fetchEvents()])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setDataError("Failed to load dashboard data")
      } finally {
        setIsDataLoading(false)
      }
    }

    loadData()
  }, [currentTeam])

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    if (!currentTeam) return

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq("id", taskId)
        .eq("team_id", currentTeam.id)

      if (error) {
        console.error("Error completing task:", error)
        return
      }

      // Update local state
      setUpcomingTasks(upcomingTasks.filter((task) => task.id !== taskId))

      // Update task counts
      setTasks({
        ...tasks,
        completed: tasks.completed + 1,
      })
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  // Show loading state
  if (isTeamLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  // Show no team state
  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <AlertDisplay message={dataError} />

        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-6">Create a team to get started with your event planning</p>
          <Link href="/teams">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Team
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show data loading state
  if (isDataLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse flex flex-col">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <AlertDisplay message={dataError} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Budget Overview</h2>
            <DollarSign className="text-blue-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">${currentTeam.budget?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Budget</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Events</h2>
            <Calendar className="text-green-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">{events.upcoming}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </Card>
        <Link href="/tasks" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <BarChart className="text-yellow-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">
              {tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">Tasks Completed</p>
          </Card>
        </Link>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <CheckSquare className="text-purple-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">{tasks.total - tasks.completed}</p>
          <p className="text-sm text-gray-500">Tasks Remaining</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          {recentActivities.length > 0 ? (
            <ul className="space-y-2">
              {recentActivities.map((activity, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{activity.title}</span>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activities</p>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          {upcomingTasks.length > 0 ? (
            <ul className="space-y-4">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                      Complete
                    </Button>
                  </div>
                  <Progress value={0} className="h-2" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-gray-500">No upcoming tasks</p>
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-3 w-3" /> Add Task
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

