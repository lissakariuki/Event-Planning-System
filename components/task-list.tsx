"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Edit } from "lucide-react"
import { useSupabase } from "@/hooks/use-supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "./task-form"

interface Task {
  id: string
  title: string
  completed: boolean
  created_at: string
  created_by: string
}

interface TaskListProps {
  teamId: string
}

export function TaskList({ teamId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useUser()
  const { supabase } = useSupabase()

  // Load tasks for the team
  useEffect(() => {
    async function loadTasks() {
      if (!teamId) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("tasks")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setTasks(data || [])
      } catch (err: any) {
        console.error("Error loading tasks:", err)
        setError(`Failed to load tasks: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [teamId, supabase])

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      // Optimistically update UI
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !currentStatus } : task)))

      // Update in database
      const { error: updateError } = await supabase.from("tasks").update({ completed: !currentStatus }).eq("id", taskId)

      if (updateError) {
        throw updateError
      }
    } catch (err: any) {
      console.error("Error updating task:", err)

      // Revert optimistic update
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: currentStatus } : task)))

      setError(`Failed to update task: ${err.message}`)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return
    }

    try {
      // Optimistically update UI
      setTasks(tasks.filter((task) => task.id !== taskId))

      // Delete from database
      const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId)

      if (deleteError) {
        throw deleteError
      }
    } catch (err: any) {
      console.error("Error deleting task:", err)

      // Reload tasks to revert optimistic update
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })

      setTasks(data || [])

      setError(`Failed to delete task: ${err.message}`)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleTaskUpdated = () => {
    setIsDialogOpen(false)
    setEditingTask(null)

    // Reload tasks
    supabase
      .from("tasks")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTasks(data)
        }
      })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No tasks found</p>
          <p className="text-sm text-gray-400 mt-2">Create your first task using the button above</p>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.id}
            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${task.completed ? "bg-gray-50 dark:bg-gray-800/30" : ""}`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                  id={`task-${task.id}`}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`cursor-pointer ${task.completed ? "line-through text-gray-500" : ""}`}
                >
                  {task.title}
                </label>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditTask(task)}
                  className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              teamId={teamId}
              taskId={editingTask.id}
              initialData={{
                title: editingTask.title,
                completed: editingTask.completed,
              }}
              onTaskCreated={handleTaskUpdated}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

