"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/hooks/use-supabase"

interface TaskFormProps {
  teamId: string
  taskId?: string
  initialData?: {
    title: string
    completed: boolean
  }
  onTaskCreated: () => void
  onCancel: () => void
}

export function TaskForm({ teamId, taskId, initialData, onTaskCreated, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Task title is required")
      return
    }

    if (!user) {
      setError("You must be logged in to create a task")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const taskData = {
        team_id: teamId,
        title: title.trim(),
      }

      if (taskId) {
        // Update existing task
        const { error: updateError } = await supabase.from("tasks").update(taskData).eq("id", taskId)

        if (updateError) throw updateError
      } else {
        // Create new task
        const { error: insertError } = await supabase.from("tasks").insert({
          ...taskData,
          completed: false,
          created_by: user.id,
        })

        if (insertError) throw insertError
      }

      onTaskCreated()
    } catch (err: any) {
      console.error("Error saving task:", err)
      setError(`Failed to save task: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Task Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={isSubmitting}
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (taskId ? "Updating..." : "Creating...") : taskId ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}

