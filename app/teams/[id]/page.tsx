"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeam } from "@/contexts/team-context"
import { EmptyTeamState } from "@/components/empty-team-state"
import { UserPlus, Edit, Share, Bell } from "lucide-react"

export default function TeamDashboardPage() {
  const params = useParams()
  const teamId = params.id as string
  const { teams, currentTeam, setCurrentTeam } = useTeam()

  useEffect(() => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
    }
  }, [teamId, teams, setCurrentTeam])

  if (!currentTeam) {
    return <EmptyTeamState onCreateTeam={() => {}} />
  }

  // Calculate budget percentage
  const budgetPercentage = currentTeam.budget
    ? Math.min(Math.round((currentTeam.budget.current / currentTeam.budget.total) * 100), 100) || 0
    : 0

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex flex-col space-y-4">
        <div className="w-full h-40 relative bg-gray-900 rounded-lg overflow-hidden">
          <Image src="/placeholder.svg?height=160&width=1200" alt={currentTeam.name} fill className="object-cover" />
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 relative -mt-10 rounded-lg overflow-hidden border-4 border-background bg-gray-200">
              <Image
                src={`/placeholder.svg?text=${currentTeam.name.charAt(0)}`}
                alt={currentTeam.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentTeam.name}</h1>
              <p className="text-sm text-gray-500">
                Created{" "}
                {currentTeam.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Edit Members
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Team
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Team Navigation */}
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="members">Members ({currentTeam.members.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({currentTeam.stats?.upcomingEvents || 0})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors (0)</TabsTrigger>
          <TabsTrigger value="tasks">Tasks (0)</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Description */}
            <Card className="p-6 col-span-1">
              <h2 className="text-xl font-semibold mb-4">Team Description</h2>
              <p className="text-gray-600">{currentTeam.description || "No description provided."}</p>
            </Card>

            {/* Team Stats */}
            <Card className="p-6 col-span-1">
              <h2 className="text-xl font-semibold mb-4">Team Stats</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Budget</span>
                    <span>
                      ${currentTeam.budget?.current.toLocaleString() || 0} / $
                      {currentTeam.budget?.total.toLocaleString() || 0}
                    </span>
                  </div>
                  <Progress value={budgetPercentage} />
                </div>

                <div className="flex justify-between">
                  <span>Upcoming Events</span>
                  <span>{currentTeam.stats?.upcomingEvents || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span>Active Members</span>
                  <span>{currentTeam.stats?.activeMembers || currentTeam.members.length}</span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 col-span-1">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New member joined the team</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New event created</p>
                    <p className="text-xs text-gray-500">5 days ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Other tab contents would go here */}
      </Tabs>
    </div>
  )
}