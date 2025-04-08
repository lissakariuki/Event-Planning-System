"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useSupabase } from "@/hooks/use-supabase"

export function TeamInvitationHandler({ teamId }: { teamId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isSignedIn } = useUser()
  const { refreshTeams } = useTeam()
  const { supabase } = useSupabase()

  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [teamName, setTeamName] = useState("")

  const email = searchParams.get("email")
  const isInvitation = Boolean(email)

  useEffect(() => {
    // Only process if this is an invitation link and user is signed in
    if (!isInvitation || !isSignedIn || !user || status !== "idle") {
      return
    }

    // Check if the invited email matches the signed-in user's email
    const userEmail = user.emailAddresses[0]?.emailAddress
    if (userEmail !== email) {
      setStatus("error")
      setMessage(`This invitation was sent to ${email}. Please sign in with that email address.`)
      return
    }

    // Process the invitation
    const acceptInvitation = async () => {
      setIsProcessing(true)
      setStatus("processing")

      try {
        // First, check if the team exists
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("id, name")
          .eq("id", teamId)
          .single()

        if (teamError) {
          console.error("Team lookup error:", teamError)
          throw new Error("Team not found. The team may have been deleted.")
        }

        setTeamName(team.name)

        // Check if the invitation exists
        const { data: invitation, error: invitationError } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", teamId)
          .eq("email", email)
          .is("accepted_at", null)
          .single()

        if (invitationError) {
          console.error("Invitation lookup error:", invitationError)
          throw new Error("Invitation not found or already accepted")
        }

        // Check if invitation has expired
        if (new Date(invitation.expires_at) < new Date()) {
          throw new Error("Invitation has expired")
        }

        // Check if user is already a member
        const { data: existingMember, error: memberCheckError } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", teamId)
          .eq("user_id", user.id)
          .maybeSingle()

        if (existingMember) {
          setStatus("success")
          setMessage(`You are already a member of ${team.name}`)
          return
        }

        // Add user to team members
        const { error: memberError } = await supabase.from("team_members").insert({
          team_id: teamId,
          user_id: user.id,
          role: invitation.role,
        })

        if (memberError) {
          console.error("Error adding member:", memberError)
          throw memberError
        }

        // Mark invitation as accepted
        const { error: updateError } = await supabase
          .from("team_invitations")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", invitation.id)

        if (updateError) {
          console.error("Error updating invitation:", updateError)
          throw updateError
        }

        setStatus("success")
        setMessage(`You have successfully joined ${team.name}!`)

        // Refresh teams to include the newly joined team
        await refreshTeams()
      } catch (error: any) {
        console.error("Error accepting invitation:", error)
        setStatus("error")
        setMessage(error.message || "Failed to accept invitation")
      } finally {
        setIsProcessing(false)
      }
    }

    acceptInvitation()
  }, [isInvitation, isSignedIn, user, email, teamId, refreshTeams, status, supabase])

  if (!isInvitation) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {status === "processing" && (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-center">Processing your invitation...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Invitation Accepted!</h3>
            <p className="text-center mb-4">{message}</p>
            <Button onClick={() => router.push(`/teams/${teamId}`)}>Go to Team Dashboard</Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-4">
            <XCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-xl font-semibold mb-2">Invitation Error</h3>
            <p className="text-center mb-4">{message}</p>
            <Button variant="outline" onClick={() => router.push("/teams")}>
              Go to Teams
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
