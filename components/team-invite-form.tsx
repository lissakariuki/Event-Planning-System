"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from "@/hooks/use-supabase"
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendInvitationEmail } from "@/lib/email-service"

interface TeamInviteFormProps {
  teamId: string
  teamName: string
}

export function TeamInviteForm({ teamId, teamName }: TeamInviteFormProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("member")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const { user } = useUser()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus("error")
      setStatusMessage("Email is required")
      return
    }

    setIsSubmitting(true)
    setStatus("idle")

    try {
      // Store the invitation in the database
      const { error: inviteError } = await supabase.from("team_invitations").insert({
        team_id: teamId,
        email: email.trim(),
        role,
        token: Math.random().toString(36).substring(2, 15), // Simple token for tracking
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })

      if (inviteError) {
        // Check if it's a duplicate key error
        if (inviteError.code === "23505") {
          setStatus("error")
          setStatusMessage("This email has already been invited to this team")
          return
        }
        throw inviteError
      }

      // Send the invitation email using the user's EmailJS service
      const fromName = user?.fullName || user?.username || "Event Planning System"
      const fromEmail = user?.primaryEmailAddress?.emailAddress || "noreply@example.com"

      // Prepare the message
      const message = `You have been invited to join ${teamName} as a ${role}. Click the link below to accept the invitation.`

      // Send the email
      const emailResult = await sendInvitationEmail({
        to_email: email,
        from_name: fromName,
        from_email: fromEmail,
        subject: `Invitation to join ${teamName}`,
        message: message,
        team_name: teamName,
        role: role.charAt(0).toUpperCase() + role.slice(1),
        team_id: teamId,
      })

      if (!emailResult.success) {
        throw new Error(emailResult.message)
      }

      setStatus("success")
      setStatusMessage(`Invitation sent to ${email}`)
      setEmail("")
      setRole("member")
    } catch (err: any) {
      console.error("Error sending invitation:", err)
      setStatus("error")
      setStatusMessage(err.message || "Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {status === "success" && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">{statusMessage}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-600 dark:text-red-400">{statusMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role
            </label>
            <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
