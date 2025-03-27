"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTeam } from "@/contexts/team-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Settings, Bell, Share2, Calendar, Briefcase, ClipboardList, FileText } from "lucide-react"
import { TeamMembersDialog } from "@/components/team-members-dialog"
import { TeamSettingsDialog } from "@/components/team-settings-dialog"
import { cn } from "@/lib/utils"

export default function TeamPage() {
  const params = useParams()
  const teamId = params.id as string
  const { teams, currentTeam, setCurrentTeam, isLoading } = useTeam()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Set current team based on URL parameter
  useEffect(() => {
    if (teams.length > 0 && teamId) {
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        setCurrentTeam(team)
      }
    }
  }, [teams, teamId, setCurrentTeam])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team information...</p>
        </div>
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Team Not Found</CardTitle>
            <CardDescription className="text-center">
              The team you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-2">
            <Button asChild size="lg">
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Calculate budget percentage safely
  const budgetPercentage = Math.min(100, ((currentTeam.budget?.current || 0) / (currentTeam.budget?.total || 1)) * 100)

  // Determine budget status color
  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{currentTeam.name}</h1>
            {currentTeam.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{currentTeam.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setShowMembersDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              <span>Team Members</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9">
              <Bell className="h-4 w-4 mr-2" />
              <span>Notifications</span>
            </Button>

            <Button size="sm" className="h-9">
              <Share2 className="h-4 w-4 mr-2" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Members ({currentTeam.members?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Events ({currentTeam.events?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="vendors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Vendors ({currentTeam.vendors?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tasks ({currentTeam.tasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Documents ({currentTeam.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Budget Overview</CardTitle>
                <CardDescription>Current spending and allocation</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${currentTeam.budget?.current?.toLocaleString() || "0"}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    of ${currentTeam.budget?.total?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Used</span>
                    <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full transition-all", getBudgetStatusColor(budgetPercentage))}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Budget
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
                <CardDescription>Scheduled team activities</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <div className="text-3xl font-bold">{currentTeam.stats?.upcomingEvents || 0}</div>
                    <p className="text-sm text-muted-foreground">events scheduled</p>
                  </div>
                </div>

                {currentTeam.events && currentTeam.events.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {currentTeam.events.slice(0, 2).map((event) => (
                      <div key={event.id} className="border-l-4 border-primary pl-3 py-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No upcoming events scheduled</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View All Events
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Team Members</CardTitle>
                <CardDescription>Active collaborators</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <div className="text-3xl font-bold">{currentTeam.stats?.activeMembers || 0}</div>
                    <p className="text-sm text-muted-foreground">active members</p>
                  </div>
                </div>

                {currentTeam.members && currentTeam.members.length > 0 ? (
                  <div className="mt-4 flex -space-x-2 overflow-hidden">
                    {currentTeam.members.slice(0, 5).map((member, index) => (
                      <div
                        key={member.userId}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0)}
                      </div>
                    ))}
                    {currentTeam.members.length > 5 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        +{currentTeam.members.length - 5}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No team members added yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowMembersDialog(true)}>
                  Manage Members
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New event created</p>
                      <p className="text-sm text-muted-foreground">Team meeting scheduled for next week</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New team member added</p>
                      <p className="text-sm text-muted-foreground">Sarah Johnson joined the team</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Task completed</p>
                      <p className="text-sm text-muted-foreground">Budget proposal finalized</p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common team management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Calendar className="h-5 w-5 mb-2" />
                    <span>Create Event</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <ClipboardList className="h-5 w-5 mb-2" />
                    <span>Add Task</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Briefcase className="h-5 w-5 mb-2" />
                    <span>Add Vendor</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <FileText className="h-5 w-5 mb-2" />
                    <span>Upload Document</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members, their roles and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {currentTeam.members && currentTeam.members.length > 0 ? (
                  currentTeam.members.map((member) => (
                    <div key={member.userId} className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-medium mb-2">
                        {member.user.name.charAt(0)}
                      </div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No team members added yet</p>
                )}
              </div>
              <Button onClick={() => setShowMembersDialog(true)} className="min-w-[200px]">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Events</CardTitle>
              <CardDescription>View and manage your team's events.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <Calendar className="h-16 w-16 text-primary mb-4" />
              <p className="text-muted-foreground mb-6">
                {currentTeam.events && currentTeam.events.length > 0
                  ? `You have ${currentTeam.events.length} events scheduled.`
                  : "No events scheduled yet. Create your first event!"}
              </p>
              <Button asChild className="min-w-[200px]">
                <a href="/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Events
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Vendors</CardTitle>
              <CardDescription>View and manage your team's vendors.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <Briefcase className="h-16 w-16 text-primary mb-4" />
              <p className="text-muted-foreground mb-6">
                {currentTeam.vendors && currentTeam.vendors.length > 0
                  ? `You have ${currentTeam.vendors.length} vendors registered.`
                  : "No vendors added yet. Add your first vendor!"}
              </p>
              <Button asChild className="min-w-[200px]">
                <a href="/vendors">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Vendors
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Tasks</CardTitle>
              <CardDescription>View and manage your team's tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <ClipboardList className="h-16 w-16 text-primary mb-4" />
              <p className="text-muted-foreground mb-6">
                {currentTeam.tasks && currentTeam.tasks.length > 0
                  ? `You have ${currentTeam.tasks.length} tasks in progress.`
                  : "No tasks created yet. Create your first task!"}
              </p>
              <Button asChild className="min-w-[200px]">
                <a href="/tasks">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manage Tasks
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Documents</CardTitle>
              <CardDescription>View and manage your team's documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <FileText className="h-16 w-16 text-primary mb-4" />
              <p className="text-muted-foreground mb-6">
                {currentTeam.documents && currentTeam.documents.length > 0
                  ? `You have ${currentTeam.documents.length} documents uploaded.`
                  : "No documents uploaded yet. Upload your first document!"}
              </p>
              <Button asChild className="min-w-[200px]">
                <a href="/documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage your team's settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4 pb-6">
              <Settings className="h-16 w-16 text-primary mb-4" />
              <p className="text-muted-foreground mb-6">Update team information, notification preferences, and more.</p>
              <Button onClick={() => setShowSettingsDialog(true)} className="min-w-[200px]">
                <Settings className="h-4 w-4 mr-2" />
                Edit Team Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Members Dialog */}
      {showMembersDialog && (
        <TeamMembersDialog teamId={teamId} isOpen={showMembersDialog} onClose={() => setShowMembersDialog(false)} />
      )}

      {/* Team Settings Dialog */}
      {showSettingsDialog && currentTeam && (
        <TeamSettingsDialog
          team={currentTeam}
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
        />
      )}
    </div>
  )
}

