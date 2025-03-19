"use client"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, DollarSign, Users, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEventContext } from "@/contexts/event-contexts"

export default function Dashboard() {
  // Use the shared context instead of local state
  const { guests, tasks, setTasks, budget, currentEvent, recentActivities, addActivity } = useEventContext()

  // Calculate derived data
  const confirmedGuests = guests.filter((guest) => guest.rsvp === "Attending").length
  const totalGuests = guests.length

  const completedTasks = tasks.filter((task) => task.completed).length
  const taskCompletionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const totalSpent = budget.categories.reduce((sum, category) => sum + category.spent, 0)
  const budgetPercentage = Math.round((totalSpent / budget.total) * 100)

  // Calculate days remaining until the event
  const today = new Date()
  const eventDate = new Date(currentEvent.date)
  const daysRemaining = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Get upcoming tasks (incomplete tasks)
  const upcomingTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => a.id - b.id) // Sort by ID to show newest tasks first
    .slice(0, 3)

  // Handle task completion
  const handleCompleteTask = (taskId: number) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
    setTasks(updatedTasks)

    // Add to recent activities
    const completedTask = tasks.find((task) => task.id === taskId)
    if (completedTask) {
      addActivity(`Task completed: ${completedTask.title}`)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/budget" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Budget Overview</h2>
              <DollarSign className="text-blue-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">${budget.total.toLocaleString()}</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Spent: ${totalSpent.toLocaleString()}</span>
                <span className="text-gray-500">{budgetPercentage}%</span>
              </div>
              <Progress value={budgetPercentage} className="h-2" />
            </div>
          </Card>
        </Link>

        <Link href="/guests" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Guest List</h2>
              <Users className="text-green-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">{confirmedGuests}</p>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Confirmed Guests</p>
              <p className="text-sm text-gray-500">of {totalGuests} invited</p>
            </div>
          </Card>
        </Link>

        <Link href="/tasks" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <BarChart className="text-yellow-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">{taskCompletionPercentage}%</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Completed: {completedTasks}</span>
                <span className="text-gray-500">of {tasks.length}</span>
              </div>
              <Progress value={taskCompletionPercentage} className="h-2" />
            </div>
          </Card>
        </Link>

        <Link href="/events/1" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Event Date</h2>
              <Calendar className="text-purple-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">{daysRemaining}</p>
            <p className="text-sm text-gray-500">Days Remaining</p>
            <p className="text-xs text-gray-400 mt-1">
              {eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          {recentActivities.length > 0 ? (
            <ul className="space-y-3">
              {recentActivities.map((activity, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span>{activity.action}</span>
                  <span className="text-sm text-gray-500">{activity.timestamp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          {upcomingTasks.length > 0 ? (
            <ul className="space-y-3">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span>{task.title}</span>
                  <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                    <Check className="h-4 w-4 mr-1" /> Complete
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">All tasks completed!</p>
            </div>
          )}
          <div className="mt-4 text-right">
            <Link href="/tasks">
              <Button variant="outline" size="sm">
                View All Tasks
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

