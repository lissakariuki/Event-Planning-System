"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

interface EmptyTeamStateProps {
  onCreateTeam: () => void
}

export function EmptyTeamState({ onCreateTeam }: EmptyTeamStateProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Team Not Found</h2>
        <p className="mt-2 text-gray-500 max-w-md">
          The team you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={onCreateTeam} className="mt-6">
          Create a New Team
        </Button>
      </div>
    </Card>
  )
}

