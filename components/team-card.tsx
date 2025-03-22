import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar } from "lucide-react"

interface TeamCardProps {
  team: {
    id: number
    name: string
    description: string
    members: number
    events: number
    role: string
  }
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{team.name}</h3>
          <Badge variant={team.role === "Admin" ? "default" : "outline"}>{team.role}</Badge>
        </div>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{team.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{team.members} members</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{team.events} events</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

