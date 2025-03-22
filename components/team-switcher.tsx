"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronsUpDown, PlusCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRouter } from "next/navigation"

type Team = {
  id: string
  name: string
}

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {
  teams: Team[]
}

export function TeamSwitcher({ className, teams = [] }: TeamSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0] || { id: "personal", name: "Personal" })

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    setOpen(false)
    router.push(`/teams/${team.id}`)
  }

  const handleCreateTeam = () => {
    setOpen(false)
    router.push("/teams")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn("w-[200px] justify-between", className)}
        >
          <Users className="mr-2 h-4 w-4" />
          {selectedTeam.name}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search team..." />
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup heading="Teams">
              {teams.map((team) => (
                <CommandItem key={team.id} onSelect={() => handleTeamSelect(team)} className="text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  {team.name}
                  <Check className={cn("ml-auto h-4 w-4", selectedTeam.id === team.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem onSelect={handleCreateTeam} className="cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

