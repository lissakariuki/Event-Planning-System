"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createTeam, updateTeam } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Team } from "@/types"

interface TeamFormProps {
  team?: Team
  onSuccess?: () => void
  onCancel?: () => void
}

export function TeamForm({ team, onSuccess, onCancel }: TeamFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: team?.name || "",
    description: team?.description || "",
    budget_total: team?.budget_total?.toString() || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (team) {
        await updateTeam(team.id, {
          ...formData,
          budget_total: formData.budget_total ? Number.parseFloat(formData.budget_total) : undefined,
        })
        toast({
          title: "Team updated",
          description: "Your team has been updated successfully.",
        })
      } else {
        await createTeam({
          ...formData,
          budget_total: formData.budget_total ? Number.parseFloat(formData.budget_total) : undefined,
          budget_current: 0,
        })
        toast({
          title: "Team created",
          description: "Your team has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving team:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your team.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_total">Total Budget (USD)</Label>
        <Input
          id="budget_total"
          name="budget_total"
          type="number"
          min="0"
          step="0.01"
          value={formData.budget_total}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} data-cy="save-team-button">
          {isLoading ? "Saving..." : team ? "Update Team" : "Create Team"}
        </Button>
      </div>
    </form>
  )
}

