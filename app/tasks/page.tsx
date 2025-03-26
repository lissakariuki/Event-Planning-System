"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, Loader2, CheckSquare } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useSupabase, useRealtimeSubscription } from "@/hooks/use-supabase"
import { useUser } from "@clerk/nextjs"
import { AlertDisplay } from "@/components/ui/alert-display"

interface Task {
  id: string
  title: string
  completed: boolean
  created_by: string
}

export default function TasksPage() {
  const { currentTeam, isLoading: isTeamLoading } = useTeam()
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Fetch tasks data
  const fetchTasks = async () => {
    if (!currentTeam) return []

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("team_id", currentTeam.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading tasks:", error)
        setError("Failed to load tasks")
        return []
      }

      if (data) {
        setTasks(data)
      }

      return data || []
    } catch (err) {
      console.error("Error in fetchTasks:", err)
      setError("An unexpected error occurred")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Set up real-time subscription
  useRealtimeSubscription(
    "tasks",
    currentTeam?.id,
    () => {
      fetchTasks()
    },
    fetchTasks,
  )

  // Initial data load
  useEffect(() => {
    if (currentTeam) {
      fetchTasks()
    }
  }, [currentTeam])

  const handleAddTask = async () => {
    if (!newTask.trim() || !currentTeam || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          team_id: currentTeam.id,
          title: newTask.trim(),
          completed: false,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setNewTask("")
      setIsAddTaskOpen(false)
    } catch (err: any) {
      console.error("Error adding task:", err)
      setError(`Failed to add task: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTask(task.title)
    setIsAddTaskOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !newTask.trim() || !currentTeam) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: newTask.trim() })
        .eq("id", editingTask.id)
        .eq("team_id", currentTeam.id)

      if (error) throw error

      setNewTask("")
      setIsAddTaskOpen(false)
      setEditingTask(null)
    } catch (err: any) {
      console.error("Error updating task:", err)
      setError(`Failed to update task: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!currentTeam) return

    setError(null)

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("team_id", currentTeam.id)

      if (error) throw error
    } catch (err: any) {
      console.error("Error deleting task:", err)
      setError(`Failed to delete task: ${err.message}`)
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    if (!currentTeam) return

    setError(null)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id)
        .eq("team_id", currentTeam.id)

      if (error) throw error
    } catch (err: any) {
      console.error("Error toggling task:", err)
      setError(`Failed to update task status: ${err.message}`)
    }
  }

  // Show loading state when team is loading
  if (isTeamLoading || !currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog
          open={isAddTaskOpen}
          onOpenChange={(open) => {
            setIsAddTaskOpen(open)
            if (!open) setEditingTask(null)
          }}
        >
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
            </DialogHeader>

            <AlertDisplay message={error} />

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="task-title"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="col-span-3"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button onClick={editingTask ? handleUpdateTask : handleAddTask} disabled={isSubmitting || !newTask.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTask ? "Updating..." : "Adding..."}
                </>
              ) : editingTask ? (
                "Update Task"
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDisplay message={error} />

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-sm bg-muted"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    id={`task-${task.id}`}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditTask(task)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-gray-500 mb-4">No tasks yet. Add your first task to get started.</p>
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Task
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

