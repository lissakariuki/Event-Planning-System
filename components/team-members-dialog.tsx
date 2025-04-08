"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useSupabase } from "@/hooks/use-supabase"
import { useTeam, type TeamMember } from "@/contexts/team-context"
import { Loader2, Trash2, UserCog } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
// Import the TeamInviteForm component
import { TeamInviteForm } from "./team-invite-form"

interface TeamMembersDialogProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

export function TeamMembersDialog({ teamId, isOpen, onClose }: TeamMembersDialogProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<string>("member")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()
  const { supabase } = useSupabase()
  const { currentTeam, addTeamMember, removeTeamMember, updateTeamMember } = useTeam()
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Load team members
  useEffect(() => {
    async function loadMembers() {
      if (!teamId || !isOpen) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("team_members")
          .select("user_id, role")
          .eq("team_id", teamId)

        if (fetchError) {
          throw fetchError
        }

        // Transform to TeamMember objects
        // In a real app, you would fetch user details from your user service
        const transformedMembers: TeamMember[] = (data || []).map((member) => ({
          id: `member-${member.user_id}`,
          userId: member.user_id,
          role: member.role as "owner" | "admin" | "member",
          name: member.user_id === user?.id ? user.fullName || "You" : `User ${member.user_id.substring(0, 8)}`,
          email:
            member.user_id === user?.id
              ? user.primaryEmailAddress?.emailAddress
              : `user-${member.user_id.substring(0, 6)}@example.com`,
        }))

        setMembers(transformedMembers)
      } catch (err: any) {
        console.error("Error loading team members:", err)
        setError(`Failed to load team members: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadMembers()
  }, [teamId, isOpen, supabase, user])

  // Function to send invitation email
  async function sendInvitationEmail(data: any) {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Email sending failed:", errorData)
        return { success: false, message: errorData.error || "Failed to send email" }
      }

      const result = await response.json()
      return { success: true, message: result.message }
    } catch (error: any) {
      console.error("Error sending email:", error)
      return { success: false, message: error.message || "Failed to send email" }
    }
  }

  // Update the handleAddMember function to properly handle team invitations
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMemberEmail.trim()) {
      setError("Email is required")
      return
    }

    setIsSubmitting(true)
    setEmailStatus("sending")
    setError(null)

    try {
      const teamName = currentTeam?.name || "an event planning team"
      const fromName = user?.fullName || user?.username || "Unknown User"
      const fromEmail = user?.primaryEmailAddress?.emailAddress || "no-reply@example.com"

      // Generate a unique token for this invitation
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Create invitation link with email and token
      const invitationLink = `${window.location.origin}/teams/${teamId}?email=${encodeURIComponent(newMemberEmail)}&token=${token}`

      // Store the invitation in the database
      const { error: inviteError } = await supabase.from("team_invitations").insert({
        team_id: teamId,
        email: newMemberEmail.trim(),
        role: newMemberRole,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })

      if (inviteError) {
        throw inviteError
      }

      // Send the invitation email
      const emailResult = await sendInvitationEmail({
        to_email: newMemberEmail,
        from_name: fromName,
        from_email: fromEmail,
        subject: `Invitation to join ${teamName}`,
        message: `You have been invited to join ${teamName} on the Event Planning System as a ${newMemberRole}.`,
        team_name: teamName,
        role: newMemberRole.charAt(0).toUpperCase() + newMemberRole.slice(1),
        team_id: teamId,
        invitation_link: invitationLink, // Add the invitation link
      })

      if (!emailResult.success) {
        throw new Error(emailResult.message)
      }

      // Add the member to the database (this will be handled when they accept the invitation)
      // await addTeamMember(teamId, newMemberEmail, newMemberRole)

      // Update local state
      setMembers([...members, { id: `temp-${Date.now()}`, email: newMemberEmail, role: newMemberRole }])
      setNewMemberEmail("")
      setNewMemberRole("member")
      setEmailStatus("success")
      setStatusMessage(`Invitation sent to ${newMemberEmail}`)
    } catch (err: any) {
      console.error("Error adding team member:", err)
      setError(`Failed to add team member: ${err.message}`)
      setEmailStatus("error")
      setStatusMessage("Failed to send invitation email")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (userId === user?.id) {
      if (!window.confirm("Are you sure you want to remove yourself from this team?")) {
        return
      }
    } else {
      if (!window.confirm("Are you sure you want to remove this member?")) {
        return
      }
    }

    try {
      await removeTeamMember(teamId, userId)

      // Remove the member from the local state
      setMembers(members.filter((member) => member.userId !== userId))
    } catch (err: any) {
      console.error("Error removing team member:", err)
      setError(`Failed to remove team member: ${err.message}`)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateTeamMember(teamId, userId, newRole)

      // Update the member in the local state
      setMembers(
        members.map((member) =>
          member.userId === userId ? { ...member, role: newRole as "owner" | "admin" | "member" } : member,
        ),
      )
    } catch (err: any) {
      console.error("Error updating team member role:", err)
      setError(`Failed to update team member role: ${err.message}`)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {statusMessage && (
              <div
                className={`p-3 ${
                  emailStatus === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400"
                } rounded-md`}
              >
                <p className="text-sm">{statusMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Members</h3>

              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-gray-500 text-sm">No members found</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{member.name?.substring(0, 2) || "??"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.name}
                            {member.userId === user?.id && <span className="text-gray-500 text-sm ml-2">(You)</span>}
                          </p>
                          <p className="text-gray-500 text-sm">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>

                        {member.role !== "owner" && (
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.userId, value)}
                            disabled={member.userId === user?.id}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <UserCog className="h-4 w-4 mr-1" />
                              <span className="sr-only">Change Role</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {(member.userId !== user?.id || member.role !== "owner") && (
                          <Button variant="destructive" size="icon" onClick={() => handleRemoveMember(member.userId)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Member</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invite New Member</h3>
              <TeamInviteForm teamId={teamId} teamName={currentTeam?.name || "Team"} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
