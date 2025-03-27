"use client"

import { useState, useCallback, useEffect } from "react"
import { useSupabase } from "@/hooks/use-supabase"

export function useDashboardData(teamId: string | undefined) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState({
    tasks: [],
    events: [],
  })

  // Fetch tasks data
  const fetchTasks = useCallback(async () => {
    if (!teamId) return []

    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("team_id", teamId)

      if (error) {
        console.error("Error loading tasks:", error)
        setError("Failed to load tasks")
        return []
      }

      // Update the dashboardData state with the new tasks
      setDashboardData((prev) => ({
        ...prev,
        tasks: data || [],
      }))

      return data || []
    } catch (error) {
      console.error("Error in fetchTasks:", error)
      setError("An unexpected error occurred while loading tasks")
      return []
    }
  }, [teamId, supabase])

  // Fetch events data
  const fetchEvents = useCallback(async () => {
    if (!teamId) return []

    try {
      const { data, error } = await supabase.from("events").select("*").eq("team_id", teamId)

      if (error) {
        console.error("Error loading events:", error)
        setError("Failed to load events")
        return []
      }

      // Update the dashboardData state with the new events
      setDashboardData((prev) => ({
        ...prev,
        events: data || [],
      }))

      return data || []
    } catch (error) {
      console.error("Error in fetchEvents:", error)
      setError("An unexpected error occurred while loading events")
      return []
    }
  }, [teamId, supabase])

  // Refresh dashboard data
  const refreshDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchTasks(), fetchEvents()])
    } catch (error) {
      console.error("Error refreshing dashboard data:", error)
      setError("Failed to refresh dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [fetchTasks, fetchEvents])

  // Add a new task
  const addTask = useCallback(
    async (task) => {
      try {
        const { data, error } = await supabase.from("tasks").insert(task).select().single()

        if (error) {
          console.error("Error adding task:", error)
          setError("Failed to add task")
          return null
        }

        // Optimistically update the state
        setDashboardData((prev) => ({
          ...prev,
          tasks: [...prev.tasks, data],
        }))

        return data
      } catch (error) {
        console.error("Error in addTask:", error)
        setError("An unexpected error occurred while adding a task")
        return null
      }
    },
    [supabase],
  )

  // Update an existing task
  const updateTask = useCallback(
    async (taskId, updates) => {
      try {
        const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single()

        if (error) {
          console.error("Error updating task:", error)
          setError("Failed to update task")
          return null
        }

        // Optimistically update the state
        setDashboardData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === taskId ? data : task)),
        }))

        return data
      } catch (error) {
        console.error("Error in updateTask:", error)
        setError("An unexpected error occurred while updating a task")
        return null
      }
    },
    [supabase],
  )

  // Delete a task
  const deleteTask = useCallback(
    async (taskId) => {
      try {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId)

        if (error) {
          console.error("Error deleting task:", error)
          setError("Failed to delete task")
          return false
        }

        // Optimistically update the state
        setDashboardData((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.id !== taskId),
        }))

        return true
      } catch (error) {
        console.error("Error in deleteTask:", error)
        setError("An unexpected error occurred while deleting a task")
        return false
      }
    },
    [supabase],
  )

  // Set up real-time subscriptions
  useEffect(() => {
    if (!teamId) return

    // Initial data load
    refreshDashboardData()

    // Set up real-time subscriptions for tasks
    const tasksChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `team_id=eq.${teamId}` },
        (payload) => {
          console.log("Task change received:", payload)
          fetchTasks()
        },
      )
      .subscribe()

    // Set up real-time subscriptions for events
    const eventsChannel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `team_id=eq.${teamId}` },
        (payload) => {
          console.log("Event change received:", payload)
          fetchEvents()
        },
      )
      .subscribe()

    // Set up real-time subscriptions for teams (for budget updates)
    const teamsChannel = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams", filter: `id=eq.${teamId}` },
        (payload) => {
          console.log("Team update received:", payload)
          // This will trigger a refresh in components that depend on team data
        },
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(teamsChannel)
    }
  }, [teamId, supabase, refreshDashboardData, fetchTasks, fetchEvents])

  return {
    dashboardData,
    fetchTasks,
    fetchEvents,
    refreshDashboardData,
    addTask,
    updateTask,
    deleteTask,
    isLoading,
    setIsLoading,
    error,
    setError,
  }
}

