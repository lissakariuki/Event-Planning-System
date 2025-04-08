"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useTeam } from "@/contexts/team-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Users,
  Settings,
  Bell,
  Share2,
  Calendar,
  Briefcase,
  ClipboardList,
  FileText,
  MessageCircle,
} from "lucide-react"
import { TeamMembersDialog } from "@/components/team-members-dialog"
import { TeamSettingsDialog } from "@/components/team-settings-dialog"
import { TeamChat } from "@/components/team-chat"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/hooks/use-supabase"
import { useUser } from "@clerk/nextjs"
import { TeamInvitationHandler } from "@/components/team-invitation-handler"

export default function TeamPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const teamId = params.id as string
  const { teams, currentTeam, setCurrentTeam, isLoading, refreshTeams } = useTeam()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const { supabase } = useSupabase()
  const { user, isSignedIn } = useUser()
  const [teamData, setTeamData] = useState<any>(null)
  const [teamLoadError, setTeamLoadError] = useState<string | null>(null)
  const [isLoadingTeam, setIsLoadingTeam] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Invitation handling
  const email = searchParams.get("email")
  const isInvitation = Boolean(email)

  // Check for unread messages
  useEffect(() => {
    if (!teamId || !user?.id) return

    const checkUnreadMessages = async () => {
      try {
        // Get the last time the user viewed the chat
        const { data: userPrefs } = await supabase
          .from("user_preferences")
          .select("last_read_timestamp")
          .eq("user_id", user.id)
          .eq("team_id", teamId)
          .single()

        const lastReadTime = userPrefs?.last_read_timestamp ? new Date(userPrefs.last_read_timestamp) : new Date(0) // If no record, use epoch time

        // Count messages after the last read time that aren't from the current user
        const { count, error } = await supabase
          .from("team_messages")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamId)
          .neq("user_id", user.id)
          .gt("created_at", lastReadTime.toISOString())

        if (error) throw error

        setUnreadMessages(count || 0)
      } catch (error) {
        console.error("Error checking unread messages:", error)
      }
    }

    // Set up subscription to new messages
    const channel = supabase
      .channel(`unread-messages-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const newMessage = payload.new as any
          // Only increment unread count if message is from someone else and we're not on the chat tab
          if (newMessage.user_id !== user?.id && activeTab !== "chat") {
            setUnreadMessages((prev) => prev + 1)
          }
        },
      )
      .subscribe()

    checkUnreadMessages()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, user?.id, supabase, activeTab])

  // Reset unread count when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat" && unreadMessages > 0) {
      setUnreadMessages(0)

      // Update the last read timestamp
      if (user?.id) {
        supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            team_id: teamId,
            last_read_timestamp: new Date().toISOString(),
          })
          .then(() => {
            console.log("Updated last read timestamp")
          })
          .catch((error) => {
            console.error("Error updating last read timestamp:", error)
          })
      }
    }
  }, [activeTab, unreadMessages, supabase, user?.id, teamId])

  // Load team directly from database if needed
  useEffect(() => {
    async function loadTeamDirectly() {
      if (!teamId) return

      setIsLoadingTeam(true)
      setTeamLoadError(null)

      try {
        // Try to get the team directly from the database
        const { data: team, error } = await supabase.from("teams").select("*").eq("id", teamId).single()

        if (error) {
          console.error("Error loading team:", error)
          setTeamLoadError("Team not found or you don't have access to it.")
          setTeamData(null)
        } else {
          setTeamData(team)

          // If we're handling an invitation, we don't need to check membership yet
          if (!isInvitation) {
            // Check if the user is a member of this team
            if (isSignedIn && user) {
              const { data: membership, error: membershipError } = await supabase
                .from("team_members")
                .select("*")
                .eq("team_id", teamId)
                .eq("user_id", user.id)
                .maybeSingle()

              if (membershipError || !membership) {
                setTeamLoadError("You don't have access to this team.")
              }
            }
          }
        }
      } catch (err) {
        console.error("Error in loadTeamDirectly:", err)
        setTeamLoadError("An error occurred while loading the team.")
      } finally {
        setIsLoadingTeam(false)
      }
    }

    // If we can't find the team in the context, load it directly
    if ((!currentTeam || currentTeam.id !== teamId) && !isLoading) {
      loadTeamDirectly()
    } else {
      setIsLoadingTeam(false)
    }
  }, [teamId, supabase, currentTeam, isLoading, user, isSignedIn, isInvitation])

  // Set current team based on URL parameter
  useEffect(() => {
    if (teams.length > 0 && teamId) {
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        setCurrentTeam(team)
      }
    }
  }, [teams, teamId, setCurrentTeam])

  // If we're still loading the team context, show a loading indicator
  if (isLoading || isLoadingTeam) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team information...</p>
        </div>
      </div>
    )
  }

  // If we have an invitation but no team in context, we can still show the invitation handler
  if (isInvitation && (!currentTeam || currentTeam.id !== teamId)) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <TeamInvitationHandler teamId={teamId} />

        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Team Access</CardTitle>
              <CardDescription className="text-center">
                {teamLoadError || "Processing your invitation to join this team."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-2">
              <Button asChild size="lg">
                <a href="/teams">Go to Teams</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // If we don't have a team in context or from direct loading, show not found
  if (!currentTeam && !teamData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Team Not Found</CardTitle>
            <CardDescription className="text-center">
              {teamLoadError || "The team you're looking for doesn't exist or you don't have access to it."}
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

  // Use either the team from context or the directly loaded team data
  const team = currentTeam || teamData

  // Calculate budget percentage safely
  const budgetPercentage = Math.min(100, ((team.budget?.current || 0) / (team.budget?.total || 1)) * 100)

  // Determine budget status color
  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <TeamInvitationHandler teamId={teamId} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            {team.description && <p className="text-muted-foreground mt-2 max-w-2xl">{team.description}</p>}
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
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
            >
              Chat
              {unreadMessages > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 animate-pulse"
                >
                  {unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Members ({team.members?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Events ({team.events?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="vendors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Vendors ({team.vendors?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tasks ({team.tasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Documents ({team.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab Content */}
        <TabsContent value="chat" className="space-y-6 mt-6">
          <TeamChat teamId={teamId} />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Budget Overview</CardTitle>
                <CardDescription>Current spending and allocation</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${team.budget?.current?.toLocaleString() || "0"}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    of ${team.budget?.total?.toLocaleString() || "0"}
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
                    <div className="text-3xl font-bold">{team.stats?.upcomingEvents || 0}</div>
                    <p className="text-sm text-muted-foreground">events scheduled</p>
                  </div>
                </div>

                {team.events && team.events.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {team.events.slice(0, 2).map((event) => (
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
                <CardTitle className="text-lg font-medium">Team Chat</CardTitle>
                <CardDescription>Recent communications</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <div className="text-3xl font-bold">
                      {unreadMessages > 0 ? <span className="text-primary animate-pulse">{unreadMessages}</span> : "0"}
                    </div>
                    <p className="text-sm text-muted-foreground">unread messages</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {unreadMessages > 0
                    ? "You have unread messages in the team chat."
                    : "No unread messages in the team chat."}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("chat")}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Go to Chat
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
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => (
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
                {team.events && team.events.length > 0
                  ? `You have ${team.events.length} events scheduled.`
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
                {team.vendors && team.vendors.length > 0
                  ? `You have ${team.vendors.length} vendors registered.`
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
                {team.tasks && team.tasks.length > 0
                  ? `You have ${team.tasks.length} tasks in progress.`
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
                {team.documents && team.documents.length > 0
                  ? `You have ${team.documents.length} documents uploaded.`
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
      {showSettingsDialog && team && (
        <TeamSettingsDialog team={team} isOpen={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} />
      )}
    </div>
  )
}
