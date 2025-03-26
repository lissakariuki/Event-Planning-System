"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTeam } from "@/contexts/team-context"

export default function TeamMembersRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get("team")
  const { teams } = useTeam()

  useEffect(() => {
    if (teamId) {
      // Check if the team exists
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        // Redirect to the new team page structure
        router.push(`/teams/${teamId}`)
      } else {
        // Team not found, redirect to teams page
        router.push("/teams")
      }
    } else if (teams.length > 0) {
      // No team specified, redirect to first team
      router.push(`/teams/${teams[0].id}`)
    } else {
      // No teams exist, redirect to teams page
      router.push("/teams")
    }
  }, [teamId, teams, router])

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting...</p>
    </div>
  )
}

