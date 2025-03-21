"use client"

import { useTeam } from "@/contexts/team-context"
import { Users } from "lucide-react"

export function TeamContextDisplay() {
  const { currentTeam } = useTeam()

  if (!currentTeam) return null

  return (
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Users className="h-4 w-4 mr-1" />
      <span>Team: {currentTeam.name}</span>
    </div>
  )
}

