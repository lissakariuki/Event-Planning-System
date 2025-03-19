"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, Filter } from "lucide-react"
import { useEventContext } from "@/contexts/event-contexts"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TasksPage() {
  const { tasks, setTasks, addActivity } = useEventContext()

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [editingTask, setEditingTask] = useState<(typeof tasks)[0] | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter tasks based on status and search term
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.completed) ||
      (filterStatus === "pending" && !task.completed)

    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newId = Math.max(0, ...tasks.map((t) => t.id)) + 1
      const updatedTasks = [...tasks, { id: newId, title: newTask, completed: false }]
      setTasks(updatedTasks)
      setNewTask("")
      setIsAddTaskOpen(false)

      // Add to recent activities
      addActivity(`Task added: ${newTask}`)

      toast({
        title: "Task Added",
        description: `"${newTask}" has been added to your tasks.`,
      })
    }
  }

  const handleEditTask = (task: (typeof tasks)[0]) => {
    setEditingTask(task)
    setIsAddTaskOpen(true)
    setNewTask(task.title)
  }

  const handleUpdateTask = () => {
    if (editingTask && newTask.trim()) {
      const updatedTasks = tasks.map((task) => (task.id === editingTask.id ? { ...task, title: newTask } : task))
      setTasks(updatedTasks)
      setNewTask("")
      setIsAddTaskOpen(false)

      // Add to recent activities
      addActivity(`Task updated: ${newTask}`)

      toast({
        title: "Task Updated",
        description: `Task has been updated to "${newTask}".`,
      })

      setEditingTask(null)
    }
  }

  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find((task) => task.id === id)
    if (taskToDelete) {
      const updatedTasks = tasks.filter((task) => task.id !== id)
      setTasks(updatedTasks)

      // Add to recent activities
      addActivity(`Task deleted: ${taskToDelete.title}`)

      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.title}" has been removed from your tasks.`,
        variant: "destructive",
      })
    }
  }

  const handleToggleTask = (id: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newStatus = !task.completed

        // Add to recent activities
        if (newStatus) {
          addActivity(`Task completed: ${task.title}`)
        } else {
          addActivity(`Task reopened: ${task.title}`)
        }

        return { ...task, completed: newStatus }
      }
      return task
    })

    setTasks(updatedTasks)

    const task = tasks.find((t) => t.id === id)
    if (task) {
      toast({
        title: task.completed ? "Task Reopened" : "Task Completed",
        description: `"${task.title}" has been marked as ${task.completed ? "pending" : "completed"}.`,
      })
    }
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddTaskOpen(false)
                  setEditingTask(null)
                  setNewTask("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingTask ? handleUpdateTask : handleAddTask}>
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No tasks found.</p>
            {(searchTerm || filterStatus !== "all") && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm("")
                  setFilterStatus("all")
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
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
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allCompleted = tasks.every((t) => t.completed)
              const updatedTasks = tasks.map((t) => ({ ...t, completed: !allCompleted }))
              setTasks(updatedTasks)

              toast({
                title: allCompleted ? "All Tasks Reopened" : "All Tasks Completed",
                description: `All tasks have been marked as ${allCompleted ? "pending" : "completed"}.`,
              })

              addActivity(allCompleted ? "All tasks reopened" : "All tasks completed")
            }}
          >
            {tasks.every((t) => t.completed) ? "Mark All as Pending" : "Mark All as Completed"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

