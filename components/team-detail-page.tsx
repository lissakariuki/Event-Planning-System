"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ImageUrlInput } from "@/components/image-url-input"
import { EmptyTeamState } from "@/components/empty-team-state"
import { TeamMembersList } from "@/components/team-members-list"
import { TeamDiscussions } from "@/components/team-discussion"
import {
  Users,
  Calendar,
  PlusCircle,
  UserPlus,
  Edit,
  Share2,
  Bell,
  Store,
  CheckCircle,
  Trash2,
  Search,
  MapPin,
  ImageIcon,
  ArrowLeft,
  MoreHorizontal,
  Star,
  Shield,
  DollarSign,
} from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TeamDetailPageProps {
  teamId: string
}

export function TeamDetailPage({ teamId }: TeamDetailPageProps) {
  const router = useRouter()
  const { teams, currentTeam, setCurrentTeam, updateTeam, deleteTeam, inviteToTeam, addTeamEvent, updateTeamBudget } =
    useTeam()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [newMember, setNewMember] = useState({ email: "", role: "member" })
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    budget: "",
    attendees: "",
  })
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [isEditImagesOpen, setIsEditImagesOpen] = useState(false)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false)
  const [editTeamData, setEditTeamData] = useState({
    name: "",
    description: "",
    logo: "",
    coverImage: "",
  })
  const [editBudgetData, setEditBudgetData] = useState({
    current: 0,
    total: 0,
  })

  // Find the team based on the ID
  useEffect(() => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setCurrentTeam(team)
      setEditTeamData({
        name: team.name,
        description: team.description || "",
        logo: team.budget?.logo || "",
        coverImage: team.budget?.coverImage || "",
      })
      setEditBudgetData({
        current: team.budget?.current || 0,
        total: team.budget?.total || 0,
      })
    }
  }, [teamId, teams, setCurrentTeam])

  if (!currentTeam) {
    return <EmptyTeamState onCreateTeam={() => router.push("/teams")} />
  }

  // Calculate budget percentage
  const budgetPercentage = currentTeam.budget
    ? currentTeam.budget.total > 0
      ? Math.min(Math.round((currentTeam.budget.current / currentTeam.budget.total) * 100), 100)
      : 0
    : 0

  const handleInviteMember = () => {
    if (newMember.email) {
      // Invite the member to the team
      inviteToTeam(currentTeam.id, newMember.email, newMember.role)

      // Reset form and close dialog
      setNewMember({ email: "", role: "member" })
      setIsInviteMemberOpen(false)
    }
  }

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      // Create a new event
      addTeamEvent(currentTeam.id, {
        title: newEvent.title,
        date: newEvent.date,
        location: newEvent.location || "TBD",
        description: newEvent.description,
        budget: Number(newEvent.budget) || 0,
        attendees: Number(newEvent.attendees) || 0,
        progress: 0,
        image: "/placeholder.svg?height=200&width=300",
      })

      // Reset form and close dialog
      setNewEvent({ title: "", date: "", location: "", description: "", budget: "", attendees: "" })
      setIsCreateEventOpen(false)
    }
  }

  const handleEditTeam = () => {
    if (editTeamData.name) {
      // Update the team with the new data
      updateTeam(currentTeam.id, {
        name: editTeamData.name,
        description: editTeamData.description,
      })

      // Close dialog
      setIsEditTeamOpen(false)
    }
  }

  const handleUpdateImages = () => {
    // Update the team with the new images
    updateTeam(currentTeam.id, {
      budget: {
        ...(currentTeam.budget || { current: 0, total: 0 }),
        logo: editTeamData.logo,
        coverImage: editTeamData.coverImage,
      },
    })

    // Close dialog
    setIsEditImagesOpen(false)
  }

  const handleUpdateBudget = () => {
    // Update the team budget
    updateTeamBudget(currentTeam.id, Number(editBudgetData.current) || 0, Number(editBudgetData.total) || 0)

    // Close dialog
    setIsEditBudgetOpen(false)
  }

  const handleDeleteTeam = () => {
    // Delete the team
    deleteTeam(currentTeam.id)

    // Navigate back to teams page
    router.push("/teams")
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => router.push("/teams")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teams
      </Button>

      {/* Team Header */}
      <div className="relative">
        <div className="h-48 w-full rounded-xl overflow-hidden">
          <Image
            src={currentTeam.budget?.coverImage || "/placeholder.svg?height=192&width=1200"}
            alt={currentTeam.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="absolute -bottom-12 left-6 flex items-end">
          <div className="relative h-24 w-24 rounded-xl overflow-hidden border-4 border-background dark:border-gray-800 bg-background dark:bg-gray-800">
            <Image
              src={
                currentTeam.budget?.logo ||
                `/placeholder.svg?height=96&width=96&text=${encodeURIComponent(currentTeam.name.charAt(0)) || "/placeholder.svg"}`
              }
              alt={currentTeam.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4 mb-2 text-white">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{currentTeam.name}</h1>
              {currentTeam.members.find((m) => m.role === "owner")?.userId === "user1" && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/20">
                  <Star className="h-3 w-3 mr-1 fill-primary" /> Owner
                </Badge>
              )}
            </div>
            <p className="text-sm opacity-90">
              Created{" "}
              {currentTeam.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 flex space-x-2">
          <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
              >
                <DollarSign className="mr-2 h-4 w-4" /> Edit Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Team Budget</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-budget">Current Budget ($)</Label>
                  <Input
                    id="current-budget"
                    type="number"
                    value={editBudgetData.current}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, current: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total-budget">Total Budget ($)</Label>
                  <Input
                    id="total-budget"
                    type="number"
                    value={editBudgetData.total}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, total: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditBudgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBudget}>Update Budget</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditImagesOpen} onOpenChange={setIsEditImagesOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
              >
                <ImageIcon className="mr-2 h-4 w-4" /> Edit Images
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Team Images</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <ImageUrlInput
                  label="Team Logo"
                  id="logo-url"
                  value={editTeamData.logo}
                  onChange={(value) => setEditTeamData({ ...editTeamData, logo: value })}
                  previewHeight={80}
                  previewWidth={80}
                  previewClassName="rounded-md"
                />

                <ImageUrlInput
                  label="Cover Image"
                  id="cover-url"
                  value={editTeamData.coverImage}
                  onChange={(value) => setEditTeamData({ ...editTeamData, coverImage: value })}
                  previewHeight={120}
                  previewWidth={300}
                  previewClassName="rounded-md"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditImagesOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateImages}>Update Images</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-team-name">Team Name</Label>
                  <Input
                    id="edit-team-name"
                    value={editTeamData.name}
                    onChange={(e) => setEditTeamData({ ...editTeamData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-team-description">Description</Label>
                  <Textarea
                    id="edit-team-description"
                    value={editTeamData.description}
                    onChange={(e) => setEditTeamData({ ...editTeamData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditTeamOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditTeam}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" /> Notification Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" /> Privacy Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteTeamOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Team Navigation */}
      <div className="pt-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b">
            <div className="flex justify-between items-center">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Members ({currentTeam.members?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Events ({currentTeam.stats?.upcomingEvents || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="vendors"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Vendors
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="discussions"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Discussions
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 glass-card hover-card">
                <h3 className="text-lg font-semibold mb-4">Team Description</h3>
                <p className="text-muted-foreground">{currentTeam.description || "No description provided."}</p>
              </Card>

              <Card className="p-6 glass-card hover-card">
                <h3 className="text-lg font-semibold mb-4">Team Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Budget</span>
                      <span>
                        ${currentTeam.budget?.current.toLocaleString() || 0} / $
                        {currentTeam.budget?.total.toLocaleString() || 0}
                      </span>
                    </div>
                    <Progress value={budgetPercentage} className="h-2" />
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

              <Card className="p-6 glass-card hover-card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">New member joined the team</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">Team created</p>
                      <p className="text-xs text-muted-foreground">
                        {currentTeam.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab Content */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search members..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>

              <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member-email">Email</Label>
                      <Input
                        id="member-email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="member-role">Role</Label>
                      <select
                        id="member-role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember}>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-6 glass-card">
              <TeamMembersList team={currentTeam} />
            </Card>
          </TabsContent>

          {/* Events Tab Content */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search events..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>

              <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="event-budget">Budget ($)</Label>
                        <Input
                          id="event-budget"
                          type="number"
                          value={newEvent.budget}
                          onChange={(e) => setNewEvent({ ...newEvent, budget: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="event-guests">Expected Guests</Label>
                        <Input
                          id="event-guests"
                          type="number"
                          value={newEvent.attendees}
                          onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {currentTeam.events && currentTeam.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTeam.events.map((event: any) => (
                  <Card key={event.id} className="overflow-hidden glass-card hover-card">
                    <div className="aspect-video relative">
                      <Image
                        src={event.image || "/placeholder.svg?height=200&width=300"}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-primary/90">{new Date(event.date).toLocaleDateString()}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location || "Location TBD"}
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Progress</span>
                          <span>{event.progress || 0}%</span>
                        </div>
                        <Progress value={event.progress || 0} className="h-2" />
                      </div>
                      <div className="mt-4 flex justify-between">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center glass-card">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first event to start planning and organizing your team activities.
                  </p>
                  <Button onClick={() => setIsCreateEventOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Vendors Tab Content */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search vendors..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>

              <Button>
                <Store className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            </div>

            <Card className="p-8 text-center glass-card">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No vendors yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add vendors to keep track of your event suppliers and service providers.
                </p>
                <Button>
                  <Store className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Tasks Tab Content */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search tasks..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>

              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </div>

            <Card className="p-8 text-center glass-card">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create tasks to track your team's progress and assign responsibilities.
                </p>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Discussions Tab Content */}
          <TabsContent value="discussions" className="space-y-6">
            <TeamDiscussions team={currentTeam} />
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Team Settings</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="team-name-settings">Team Name</Label>
                    <Input id="team-name-settings" value={currentTeam.name} readOnly />
                    <p className="text-xs text-muted-foreground">
                      To change the team name, use the Edit Team button in the header.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="team-created">Created</Label>
                    <Input
                      id="team-created"
                      value={currentTeam.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      readOnly
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="team-owner">Team Owner</Label>
                    <Input
                      id="team-owner"
                      value={currentTeam.members.find((m) => m.role === "owner")?.user.name || "Unknown"}
                      readOnly
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 glass-card">
                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <input id="email-notifications" type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                    <input id="in-app-notifications" type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="member-join-notifications">Member Join Notifications</Label>
                    <input id="member-join-notifications" type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="event-notifications">Event Notifications</Label>
                    <input id="event-notifications" type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 border-destructive/20 glass-card">
              <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These actions are irreversible. Please be certain before proceeding.
              </p>
              <div className="space-y-4">
                <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
                  Leave Team
                </Button>

                <Dialog open={isDeleteTeamOpen} onOpenChange={setIsDeleteTeamOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Team</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this team? This action cannot be undone and all team data will
                        be permanently lost.
                      </p>
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-sm font-medium text-destructive">
                          To confirm, please type the team name: <span className="font-bold">{currentTeam.name}</span>
                        </p>
                        <Input className="mt-2" placeholder="Type team name to confirm" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteTeamOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteTeam}>
                        Delete Team
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

