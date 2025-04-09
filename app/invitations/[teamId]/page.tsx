
"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useSupabase } from "@/hooks/use-supabase"
import { useUser, useClerk } from "@clerk/nextjs"
import { useTeam } from "@/contexts/team-context"

export default function InvitationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const teamId = params.teamId as string
  const email = searchParams.get("email")
  const { supabase } = useSupabase()
  const { user, isSignedIn, isLoaded } = useUser()
  const { openSignIn } = useClerk()
  const { refreshTeams } = useTeam()

  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)

  // Process invitation
  useEffect(() => {
    if (!isLoaded) return // Wait for Clerk to load

    async function processInvitation() {
      if (!teamId || !email) {
        setStatus("error")
        setMessage("Invalid invitation link")
        return
      }

      setIsProcessing(true)

      try {
        // Fetch team details
        const { data: team, error: teamError } = await supabase.from("teams").select("name").eq("id", teamId).single()

        if (teamError) {
          throw new Error("Team not found")
        }

        setTeamName(team.name)

        // Check if the invitation exists
        const { data: invitation, error: inviteError } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", teamId)
          .eq("email", email)
          .is("accepted_at", null)
          .maybeSingle()

        if (inviteError && inviteError.code !== "PGRST116") {
          console.error("Invitation error:", inviteError)
          throw new Error("Failed to check invitation")
        }

        if (!invitation) {
          setStatus("error")
          setMessage("Invitation not found or already accepted")
          return
        }

        // Check if invitation has expired
        if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
          setStatus("error")
          setMessage("This invitation has expired")
          return
        }

        // If user is not signed in, prompt them to sign in
        if (!isSignedIn) {
          setStatus("error")
          setMessage("Please sign in to accept this invitation")
          return
        }

        // Check if user is already a member
        const { data: existingMember, error: memberError } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", teamId)
          .eq("user_id", user?.id)
          .maybeSingle()

        if (memberError && memberError.code !== "PGRST116") {
          console.error("Membership check error:", memberError)
          throw new Error("Failed to check membership")
        }

        if (existingMember) {
          setStatus("success")
          setMessage("You are already a member of this team")
          return
        }

        // Add user to the team - FIXED: removed email field since it doesn't exist in the table
        const { error: insertError } = await supabase.from("team_members").insert({
          team_id: teamId,
          user_id: user?.id,
          role: invitation.role || "member",
        })

        if (insertError) {
          console.error("Insert error:", insertError)
          throw new Error("Failed to add you to the team")
        }

        // Mark invitation as accepted
        const { error: updateError } = await supabase
          .from("team_invitations")
          .update({ accepted_at: new Date().toISOString() })
          .eq("id", invitation.id)

        if (updateError) {
          console.error("Update error:", updateError)
          // Non-critical error, don't throw
        }

        // Refresh teams to include the new team
        await refreshTeams()

        setStatus("success")
        setMessage(`You have successfully joined the team "${team.name}"!`)
      } catch (err: any) {
        console.error("Error processing invitation:", err)
        setStatus("error")
        setMessage(err.message || "Failed to process invitation")
      } finally {
        setIsProcessing(false)
      }
    }

    processInvitation()
  }, [teamId, email, supabase, user, isSignedIn, refreshTeams, isLoaded])

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "loading" ? "Team Access" : status === "success" ? "Invitation Accepted" : "Invitation Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center">Processing your invitation to join {teamName || "this team"}...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-center">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-center">{message}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "success" ? (
            <Button onClick={() => router.push(`/teams/${teamId}`)}>Go to Team</Button>
          ) : status === "error" && !isSignedIn ? (
            <Button onClick={() => openSignIn({ modalMode: true })}>Sign In</Button>
          ) : (
            <Button onClick={() => router.push("/teams")}>Go to Teams</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
