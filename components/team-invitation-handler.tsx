"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useSupabase } from "@/hooks/use-supabase"
import { useUser, useClerk } from "@clerk/nextjs"
import { useTeam } from "@/contexts/team-context"

interface TeamInvitationHandlerProps {
  teamId: string
}

export function TeamInvitationHandler({ teamId }: TeamInvitationHandlerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const { supabase } = useSupabase()
  const { user, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const { refreshTeams } = useTeam()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isHandled, setIsHandled] = useState(false)
  const [status, setStatus] = useState<"success" | "error" | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)

  // Check if this is an invitation link
  const isInvitation = Boolean(email)

  // Process invitation if email is in the URL
  useEffect(() => {
    async function processInvitation() {
      if (!isInvitation || isHandled || !teamId) return

      setIsProcessing(true)

      try {
        // Fetch team details
        const { data: team, error: teamError } = await supabase.from("teams").select("name").eq("id", teamId).single()

        if (teamError) throw new Error("Team not found")
        setTeamName(team.name)

        // Check if the invitation exists in team_invitations table
        const { data: invitation, error: inviteError } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", teamId)
          .eq("email", email)
          .is("accepted_at", null)
          .maybeSingle()

        if (inviteError && inviteError.code !== "PGRST116") {
          throw new Error("Failed to check invitation")
        }

        // Check if the invitation has expired
        if (invitation && invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
          setStatus("error")
          setMessage("This invitation has expired")
          return
        }

        // Check if the user is already a member
        if (isSignedIn && user) {
          const { data: existingMember, error: memberError } = await supabase
            .from("team_members")
            .select("*")
            .eq("team_id", teamId)
            .eq("user_id", user.id)
            .maybeSingle()

          if (memberError && memberError.code !== "PGRST116") {
            throw new Error("Failed to check membership")
          }

          if (existingMember) {
            setStatus("success")
            setMessage("You are already a member of this team.")
            return
          }
        }

        // If user is logged in, add them to the team
        if (isSignedIn && user) {
          // FIXED: Removed email field from the insert
          const { error: insertError } = await supabase.from("team_members").insert({
            team_id: teamId,
            user_id: user.id,
            role: invitation?.role || "member", // Use role from invitation or default to member
          })

          if (insertError) throw new Error("Failed to add you to the team")

          // Mark invitation as accepted
          if (invitation) {
            await supabase
              .from("team_invitations")
              .update({ accepted_at: new Date().toISOString() })
              .eq("id", invitation.id)
          }

          // Refresh teams to include the new team
          await refreshTeams()

          setStatus("success")
          setMessage(`You have successfully joined the team "${team.name}"!`)
        } else {
          // If user is not logged in, prompt them to sign in
          setStatus("error")
          setMessage("Please sign in to accept this invitation.")
        }
      } catch (err: any) {
        console.error("Error processing invitation:", err)
        setStatus("error")
        setMessage(err.message || "Failed to process invitation")
      } finally {
        setIsProcessing(false)
        setIsHandled(true)
      }
    }

    processInvitation()
  }, [isInvitation, isHandled, teamId, email, supabase, user, isSignedIn, refreshTeams])

  // If not an invitation or already handled, don't render anything
  if (!isInvitation || (isHandled && !status)) {
    return null
  }

  if (isProcessing) {
    return (
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6 pb-6 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center">Processing your invitation...</p>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="mb-6 shadow-md border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-green-600">Invitation Accepted</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 flex flex-col items-center">
          <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
          <p className="text-center">{message}</p>
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex justify-center">
          <Button onClick={() => router.push(`/teams/${teamId}`)}>Go to Team Dashboard</Button>
        </CardFooter>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="mb-6 shadow-md border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-red-600">Invitation Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 flex flex-col items-center">
          <XCircle className="h-8 w-8 text-red-600 mb-4" />
          <p className="text-center">{message}</p>
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex justify-center">
        <Button onClick={() => openSignIn({ modalMode: true })}>Sign In</Button>
        </CardFooter>
      </Card>
    )
  }

  return null
}
