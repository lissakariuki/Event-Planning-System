"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useEventContext } from "@/contexts/event-contexts"
import { TeamContextDisplay } from "@/components/team-context-display"

interface Task {
  id: number
  title: string
  completed: boolean
  assignedTo?: string
}

export default function TasksPage() {
  const { currentTeam } = useTeam()
  const { tasks, setTasks, addActivity } = useEventContext()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [assignee, setAssignee] = useState<string | undefined>(undefined)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newId = Math.max(0, ...tasks.map((t) => t.id)) + 1
      const updatedTasks = [
        ...tasks,
        {
          id: newId,
          title: newTask,
          completed: false,
          teamId: currentTeam?.id,
          assignedTo: assignee,
        },
      ]
      setTasks(updatedTasks)
      setNewTask("")
      setAssignee(undefined)
      setIsAddTaskOpen(false)

      // Add to recent activities
      addActivity(`Task added: ${newTask}`)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsAddTaskOpen(true)
    setNewTask(task.title)
    setAssignee(task.assignedTo)
  }

  const handleUpdateTask = () => {
    if (editingTask && newTask.trim()) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id ? { ...task, title: newTask, assignedTo: assignee } : task,
      )
      setTasks(updatedTasks)
      setNewTask("")
      setAssignee(undefined)
      setIsAddTaskOpen(false)
      setEditingTask(null)

      // Add to recent activities
      addActivity(`Task updated: ${newTask}`)
    }
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))

    // Add to recent activities
    const taskToDelete = tasks.find((task) => task.id === id)
    if (taskToDelete) {
      addActivity(`Task deleted: ${taskToDelete.title}`)
    }
  }

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))

    // Add to recent activities
    const taskToToggle = tasks.find((task) => task.id === id)
    if (taskToToggle) {
      addActivity(`Task ${taskToToggle.completed ? "reopened" : "completed"}: ${taskToToggle.title}`)
    }
  }

  const getAssigneeName = (userId?: string) => {
    if (!userId || !currentTeam) return "Unassigned"
    const member = currentTeam.members.find((m) => m.userId === userId)
    return member ? member.user.name : "Unassigned"
  }

  // Filter tasks to only show those for the current team
  const teamTasks = tasks.filter((task) => !task.teamId || task.teamId === currentTeam?.id)

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Team Selected</h2>
        <p className="text-gray-500 mb-4">Please select or create a team to manage tasks.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-assignee">Assign To</Label>
                <Select value={assignee} onValueChange={(value) => setAssignee(value)}>
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {currentTeam?.members.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={editingTask ? handleUpdateTask : handleAddTask}>
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <TeamContextDisplay />

      <Card className="p-6">
        <ul className="space-y-4">
          {teamTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                  id={`task-${task.id}`}
                />
                <div>
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Assigned to: {getAssigneeName(task.assignedTo)}</p>
                </div>
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
      </Card>
    </div>
  )
}

