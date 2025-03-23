"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart, Calendar, DollarSign, Users, CheckCircle, Clock, ArrowRight, MessageSquare } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import type { TeamEvent } from "@/lib/types"

export default function Dashboard() {
  const { teams, isLoading, getDashboardStats } = useTeam()
  const [dashboardData, setDashboardData] = useState({
    totalBudget: 0,
    currentBudget: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: [] as (TeamEvent & { teamId: string; teamName: string })[],
    recentActivities: [] as {
      id: string
      title: string
      timestamp: Date
      teamId: string
      teamName: string
      type: "event" | "task" | "member" | "discussion"
    }[],
  })

  // Update dashboard data whenever teams change
  useEffect(() => {
    if (!isLoading) {
      const stats = getDashboardStats()
      setDashboardData(stats)
    }
  }, [isLoading, teams, getDashboardStats])

  // Calculate task completion percentage
  const taskCompletionPercentage =
    dashboardData.totalTasks > 0 ? Math.round((dashboardData.completedTasks / dashboardData.totalTasks) * 100) : 0

  // Calculate days remaining to the next event
  const nextEvent = dashboardData.upcomingEvents[0]
  const daysRemaining = nextEvent
    ? Math.max(1, Math.ceil((new Date(nextEvent.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/teams">View All Teams</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Budget Overview</h2>
            <DollarSign className="text-blue-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">${dashboardData.totalBudget.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Budget</p>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Current: ${dashboardData.currentBudget.toLocaleString()}</span>
              <span>
                {dashboardData.totalBudget > 0
                  ? Math.round((dashboardData.currentBudget / dashboardData.totalBudget) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                dashboardData.totalBudget > 0 ? (dashboardData.currentBudget / dashboardData.totalBudget) * 100 : 0
              }
              className="h-2"
            />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Guest List</h2>
            <Users className="text-green-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">{dashboardData.confirmedGuests}</p>
          <p className="text-sm text-gray-500">Confirmed Guests</p>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Total Invited: {dashboardData.totalGuests}</span>
              <span>
                {dashboardData.totalGuests > 0
                  ? Math.round((dashboardData.confirmedGuests / dashboardData.totalGuests) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                dashboardData.totalGuests > 0 ? (dashboardData.confirmedGuests / dashboardData.totalGuests) * 100 : 0
              }
              className="h-2"
            />
          </div>
        </Card>

        <Link href="/tasks" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <BarChart className="text-yellow-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">{taskCompletionPercentage}%</p>
            <p className="text-sm text-gray-500">Tasks Completed</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Completed: {dashboardData.completedTasks}</span>
                <span>Total: {dashboardData.totalTasks}</span>
              </div>
              <Progress value={taskCompletionPercentage} className="h-2" />
            </div>
          </Card>
        </Link>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Next Event</h2>
            <Calendar className="text-purple-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">{daysRemaining}</p>
          <p className="text-sm text-gray-500">Days Remaining</p>
          {nextEvent && (
            <div className="mt-2 text-sm">
              <p className="font-medium">{nextEvent.title}</p>
              <p className="text-gray-500">{new Date(nextEvent.date).toLocaleDateString()}</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activities</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <ul className="space-y-4">
            {dashboardData.recentActivities.slice(0, 4).map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <div
                  className={`rounded-full p-2 ${
                    activity.type === "event"
                      ? "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300"
                      : activity.type === "task"
                        ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300"
                        : activity.type === "member"
                          ? "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
                          : "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
                  }`}
                >
                  {activity.type === "event" && <Calendar className="h-4 w-4" />}
                  {activity.type === "task" && <CheckCircle className="h-4 w-4" />}
                  {activity.type === "member" && <Users className="h-4 w-4" />}
                  {activity.type === "discussion" && <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{activity.title}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    <Link href={`/teams/${activity.teamId}`} className="hover:underline">
                      {activity.teamName}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link href="/events">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {dashboardData.upcomingEvents.length > 0 ? (
              <ul className="space-y-4">
                {dashboardData.upcomingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md">
                        <Calendar className="h-5 w-5 text-purple-500 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {event.teamName}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No upcoming events</p>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link href="/teams">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {teams.slice(0, 2).map((team) => (
                <div key={team.id} className="w-full">
                  <h3 className="text-sm font-medium mb-2">{team.name}</h3>
                  <div className="flex -space-x-2 overflow-hidden">
                    {team.members.slice(0, 5).map((member) => (
                      <Avatar key={member.userId} className="border-2 border-background">
                        <AvatarImage src={`/placeholder.svg?text=${member.user.name.charAt(0)}`} />
                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 5 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return date.toLocaleDateString()
}

