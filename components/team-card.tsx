"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, ArrowRight } from "lucide-react"
import type { Team } from "@/lib/types"

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter()

  // Format budget values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  // Calculate budget percentage
  const budgetPercentage = team.budget
    ? team.budget.total > 0
      ? Math.min(Math.round((team.budget.current / team.budget.total) * 100), 100)
      : 0
    : 0

  return (
    <Card
      className="overflow-hidden hover-card hover:bg-team-card-hover cursor-pointer border border-border"
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      <div className="h-32 relative bg-gradient-to-r from-primary/80 to-primary/40">
        {team.budget?.coverImage && (
          <Image
            src={team.budget.coverImage || "/placeholder.svg?height=128&width=384"}
            alt={team.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center overflow-hidden border-2 border-background">
              {team.budget?.logo ? (
                <Image
                  src={team.budget.logo || "/placeholder.svg"}
                  alt={team.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">{team.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-white text-lg">{team.name}</h3>
            </div>
          </div>
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {team.members.length} {team.members.length === 1 ? "member" : "members"}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {team.description || "No description provided."}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {team.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {team.budget && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>
                {formatCurrency(team.budget.current)} / {formatCurrency(team.budget.total)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full group"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/teams/${team.id}`)
            }}
          >
            View Team
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

