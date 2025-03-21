"use client"

import { useState } from "react"
import { useTeam } from "@/contexts/team-context"
import { useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Mail, AlertCircle, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function TeamMembersPage() {
  const { user } = useUser()
  const { currentTeam, inviteToTeam, createTeam } = useTeam()
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", description: "" })

  const handleInvite = () => {
    if (currentTeam && inviteEmail.trim()) {
      inviteToTeam(currentTeam.id, inviteEmail)
      setInviteEmail("")
      setIsInviteOpen(false)
    }
  }

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      createTeam(newTeam.name, newTeam.description)
      setNewTeam({ name: "", description: "" })
      setIsCreateTeamOpen(false)
    }
  }

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Team Selected</h2>
        <p className="text-gray-500 mb-4">Please select or create a team to manage members.</p>
        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create a Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-description">Description (Optional)</Label>
                <Textarea
                  id="team-description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
              {user && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You ({user.fullName || user.username}) will be the owner of this team.
                  </p>
                </div>
              )}
            </div>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
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
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Team: {currentTeam.name}</h2>
        {currentTeam.description && <p className="text-gray-500 mb-4">{currentTeam.description}</p>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTeam.members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    {member.role !== "owner" && (
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
        <div className="flex items-center justify-center p-8 text-gray-500">
          <Mail className="mr-2 h-5 w-5" />
          No pending invitations
        </div>
      </Card>
    </div>
  )
}

