import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { team_id, user_email } = req.body

  if (!team_id || !user_email) {
    return res.status(400).json({ error: "Missing team_id or user_email" })
  }

  try {
    // Check if the user already exists in the team
    const { data: existingMember, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", team_id)
      .eq("email", user_email)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "No rows found" error
      throw fetchError
    }

    if (existingMember) {
      return res.status(200).json({ message: "User is already a member of the team" })
    }

    // Add the user to the team
    const { error: insertError } = await supabase.from("team_members").insert({
      team_id,
      email: user_email,
      role: "member", // Default role
    })

    if (insertError) {
      throw insertError
    }

    return res.status(200).json({ message: "User added to the team successfully" })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return res.status(500).json({ error: "Failed to accept invitation" })
  }
}