"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus } from "lucide-react"

interface Task {
  id: number
  title: string
  completed: boolean
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Book venue", completed: true },
    { id: 2, title: "Hire caterer", completed: false },
    { id: 3, title: "Send invitations", completed: false },
  ])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }])
      setNewTask("")
      setIsAddTaskOpen(false)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsAddTaskOpen(true)
    setNewTask(task.title)
  }

  const handleUpdateTask = () => {
    if (editingTask && newTask.trim()) {
      setTasks(tasks.map((task) => (task.id === editingTask.id ? { ...task, title: newTask } : task)))
      setNewTask("")
      setIsAddTaskOpen(false)
      setEditingTask(null)
    }
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="task-title"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={editingTask ? handleUpdateTask : handleAddTask}>
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="p-6">
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between">
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
      </Card>
    </div>
  )
}

