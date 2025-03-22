"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ImageUrlInput } from "@/components/image-url-input"
import {
  Users,
  Calendar,
  PlusCircle,
  UserPlus,
  Edit,
  Share2,
  Bell,
  BellOff,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Search,
  MapPin,
  DollarSign,
  FileText,
  ImageIcon,
} from "lucide-react"
import { TeamMember } from "@/components/team-member"
import { updateTeam } from "./mock-data"

export function TeamDetailPage({ initialTeam }: { initialTeam: any }) {
  const [team, setTeam] = useState(initialTeam)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [newMember, setNewMember] = useState({ email: "", role: "Member" })
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "", budget: "", guests: "" })
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [isEditImagesOpen, setIsEditImagesOpen] = useState(false)
  const [editTeamData, setEditTeamData] = useState({
    name: team.name,
    description: team.description,
    logo: team.logo,
    coverImage: team.coverImage,
  })

  const handleInviteMember = () => {
    if (newMember.email) {
      // In a real app, this would send an invitation to the email
      console.log("Inviting member:", newMember)
      setIsInviteMemberOpen(false)
      setNewMember({ email: "", role: "Member" })

      // Add a temporary member to the UI
      const updatedTeam = { ...team }
      updatedTeam.members = [
        ...updatedTeam.members,
        {
          id: Date.now(),
          name: newMember.email.split("@")[0], // Use part of email as name
          email: newMember.email,
          role: newMember.role,
          avatar: "/placeholder.svg?height=40&width=40",
          position: "New Member",
          phone: "Not provided",
        },
      ]
      setTeam(updatedTeam)

      // Update the team in our mock database
      updateTeam(team.id.toString(), updatedTeam)
    }
  }

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event = {
        id: Date.now(),
        title: newEvent.title,
        date: newEvent.date,
        location: newEvent.location || "TBD",
        budget: newEvent.budget ? Number.parseInt(newEvent.budget) : 0,
        guests: newEvent.guests ? Number.parseInt(newEvent.guests) : 0,
        progress: 0,
        image: "/placeholder.svg?height=200&width=300",
      }

      const updatedTeam = { ...team }
      updatedTeam.events = [...updatedTeam.events, event]
      setTeam(updatedTeam)

      // Update the team in our mock database
      updateTeam(team.id.toString(), updatedTeam)

      setIsCreateEventOpen(false)
      setNewEvent({ title: "", date: "", location: "", budget: "", guests: "" })
    }
  }

  const handleEditTeam = () => {
    if (editTeamData.name) {
      const updatedTeam = { ...team }
      updatedTeam.name = editTeamData.name
      updatedTeam.description = editTeamData.description
      setTeam(updatedTeam)

      // Update the team in our mock database
      updateTeam(team.id.toString(), updatedTeam)

      setIsEditTeamOpen(false)
    }
  }

  const handleUpdateImages = () => {
    const updatedTeam = { ...team }
    updatedTeam.logo = editTeamData.logo
    updatedTeam.coverImage = editTeamData.coverImage
    setTeam(updatedTeam)

    // Update the team in our mock database
    updateTeam(team.id.toString(), updatedTeam)

    setIsEditImagesOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="relative">
        <div className="h-48 w-full rounded-xl overflow-hidden">
          <Image src={team.coverImage || "/placeholder.svg"} alt={team.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="absolute -bottom-12 left-6 flex items-end">
          <div className="relative h-24 w-24 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800">
            <Image src={team.logo || "/placeholder.svg"} alt={team.name} fill className="object-cover" />
          </div>
          <div className="ml-4 mb-2 text-white">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-sm opacity-90">Created {team.createdAt}</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 flex space-x-2">
          <Dialog open={isEditImagesOpen} onOpenChange={setIsEditImagesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/90 hover:bg-white">
                <ImageIcon className="mr-2 h-4 w-4" /> Edit Images
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Team Images</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <ImageUrlInput
                  label="Team Logo URL"
                  id="logo-url"
                  value={editTeamData.logo || ""}
                  onChange={(value) => setEditTeamData({ ...editTeamData, logo: value })}
                  previewHeight={80}
                  previewWidth={80}
                  previewClassName="rounded-md"
                />

                <ImageUrlInput
                  label="Cover Image URL"
                  id="cover-url"
                  value={editTeamData.coverImage || ""}
                  onChange={(value) => setEditTeamData({ ...editTeamData, coverImage: value })}
                  previewHeight={120}
                  previewWidth={300}
                  previewClassName="rounded-md"
                />
              </div>
              <Button onClick={handleUpdateImages}>Update Images</Button>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/90 hover:bg-white">
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
              <Button onClick={handleEditTeam}>Save Changes</Button>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="bg-white/90 hover:bg-white">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>

          <Button variant="outline" className="bg-white/90 hover:bg-white">
            {team.settings?.notificationPreferences?.inApp ? (
              <>
                <Bell className="mr-2 h-4 w-4" /> Notifications On
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" /> Notifications Off
              </>
            )}
          </Button>
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
                  Members ({team.members?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Events ({team.events?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="vendors"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Vendors ({team.vendors?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Tasks ({team.tasks?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                >
                  Documents
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
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Description</h3>
                <p className="text-gray-600">{team.description}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Budget</span>
                      <span>
                        ${team.stats?.spentBudget || 0} / ${team.stats?.totalBudget || 0}
                      </span>
                    </div>
                    <Progress value={(team.stats?.spentBudget / team.stats?.totalBudget) * 100 || 0} />
                  </div>
                  <div className="flex justify-between">
                    <span>Upcoming Events</span>
                    <span>{team.stats?.upcomingEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Members</span>
                    <span>{team.stats?.activeMembers || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">New member joined the team</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">New event created</p>
                      <p className="text-xs text-gray-500">5 days ago</p>
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
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleInviteMember}>Send Invitation</Button>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-6">
              <div className="space-y-2">
                {team.members?.map((member: any) => (
                  <TeamMember key={member.id} member={member} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Events Tab Content */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search events..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                          value={newEvent.guests}
                          onChange={(e) => setNewEvent({ ...newEvent, guests: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleCreateEvent}>Create Event</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.events?.map((event: any) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Progress</span>
                        <span>{event.progress}%</span>
                      </div>
                      <Progress value={event.progress} />
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
          </TabsContent>

          {/* Vendors Tab Content */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search vendors..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <Button>
                <Store className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.vendors?.map((vendor: any) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image src={vendor.image || "/placeholder.svg"} alt={vendor.name} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.type}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{vendor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="mr-2 h-4 w-4" />
                      {vendor.location}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <DollarSign className="mr-2 h-4 w-4" />${vendor.price.toLocaleString()}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab Content */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search tasks..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {team.tasks?.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      {task.status === "Completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : task.status === "In Progress" ? (
                        <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>Assigned to: {task.assignee}</span>
                          <span className="mx-2">•</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "outline"
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab Content */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Input placeholder="Search documents..." className="pl-10" />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <Button>
                <FileText className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {team.documents?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>{doc.size}</span>
                          <span className="mx-2">•</span>
                          <span>Updated: {doc.updatedAt}</span>
                          <span className="mx-2">•</span>
                          <span>By: {doc.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.notificationPreferences?.email}
                    className="toggle"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>In-App Notifications</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.notificationPreferences?.inApp}
                    className="toggle"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Task Assignments</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.notificationPreferences?.taskAssignments}
                    className="toggle"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Event Updates</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.notificationPreferences?.eventUpdates}
                    className="toggle"
                    readOnly
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    checked={team.settings?.teamVisibility === "Public"}
                    readOnly
                  />
                  <label htmlFor="visibility-public">Public - Anyone can find this team</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    checked={team.settings?.teamVisibility === "Private"}
                    readOnly
                  />
                  <label htmlFor="visibility-private">Private - Only members can access</label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Member Permissions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Can invite members</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.memberPermissions?.canInviteMembers}
                    className="toggle"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Can create events</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.memberPermissions?.canCreateEvents}
                    className="toggle"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Can edit team settings</span>
                  <input
                    type="checkbox"
                    checked={team.settings?.memberPermissions?.canEditTeamSettings}
                    className="toggle"
                    readOnly
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-200">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
              <div className="space-y-4">
                <Button variant="destructive">Leave Team</Button>
                <Button variant="destructive">Delete Team</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

