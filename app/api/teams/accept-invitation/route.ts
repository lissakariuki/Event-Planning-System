import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { teamId, email, token } = await request.json()

    if (!teamId || !email) {
      return NextResponse.json({ error: "Missing teamId or email" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if the team exists
    const { data: team, error: teamError } = await supabase.from("teams").select("id, name").eq("id", teamId).single()

    if (teamError) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Verify the invitation if token is provided
    if (token) {
      const { data: invitation, error: inviteError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .eq("email", email)
        .eq("token", token)
        .is("accepted_at", null)
        .single()

      if (inviteError || !invitation) {
        return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 })
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
      }

      // Mark invitation as accepted
      await supabase.from("team_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id)
    }

    // Check if the user is already a member of the team
    const { data: existingMember, error: memberError } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("email", email)

    // Ignore "No rows found" error
    if (memberError && memberError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to check membership" }, { status: 500 })
    }

    if (existingMember && existingMember.length > 0) {
      return NextResponse.json({ message: "Already a member", team }, { status: 200 })
    }

    // Get the role from the invitation
    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("role")
      .eq("team_id", teamId)
      .eq("email", email)
      .single()

    const role = invitation?.role || "member"

    // Add the user to the team
    const { error: insertError } = await supabase.from("team_members").insert({
      team_id: teamId,
      email: email,
      role: role,
      user_id: null, // Will be updated when the user signs in
      joined_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: "Failed to add to team" }, { status: 500 })
    }

    // Update team stats
    await supabase
      .from("teams")
      .update({
        active_members: supabase.raw("active_members + 1"),
      })
      .eq("id", teamId)

    return NextResponse.json(
      {
        message: "Successfully joined team",
        team,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
