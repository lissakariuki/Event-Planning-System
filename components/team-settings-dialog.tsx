"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTeam, type Team } from "@/contexts/team-context"
import { Loader2 } from "lucide-react"

interface TeamSettingsDialogProps {
  team: Team
  isOpen: boolean
  onClose: () => void
}

export function TeamSettingsDialog({ team, isOpen, onClose }: TeamSettingsDialogProps) {
  // Get budget values safely, handling both possible data structures
  const getBudgetTotal = () => {
    // Check if budget is in the nested structure (team.budget.total)
    if (team.budget?.total !== undefined) {
      return team.budget.total
    }
    // Check if budget is in the flat structure (team.budgetTotal)
    if (team.budgetTotal !== undefined) {
      return team.budgetTotal
    }
    // Default to 0 if neither exists
    return 0
  }

  const getBudgetCurrent = () => {
    // Check if budget is in the nested structure (team.budget.current)
    if (team.budget?.current !== undefined) {
      return team.budget.current
    }
    // Check if budget is in the flat structure (team.budgetCurrent)
    if (team.budgetCurrent !== undefined) {
      return team.budgetCurrent
    }
    // Default to 0 if neither exists
    return 0
  }

  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || "")
  const [budgetTotal, setBudgetTotal] = useState(getBudgetTotal().toString())
  const [budgetCurrent, setBudgetCurrent] = useState(getBudgetCurrent().toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { updateTeam } = useTeam()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    if (!user) {
      setError("You must be logged in to update team settings")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Parse budget values to numbers, with validation
      const budgetTotalValue = budgetTotal ? Number.parseFloat(budgetTotal) : 0
      const budgetCurrentValue = budgetCurrent ? Number.parseFloat(budgetCurrent) : 0

      // Check for valid numbers
      if (isNaN(budgetTotalValue) || isNaN(budgetCurrentValue)) {
        throw new Error("Budget values must be valid numbers")
      }

      // Check if current budget exceeds total budget
      if (budgetCurrentValue > budgetTotalValue) {
        setError("Current budget cannot exceed total budget")
        setIsSubmitting(false)
        return
      }

      await updateTeam(team.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        budgetTotal: budgetTotalValue,
        budgetCurrent: budgetCurrentValue,
      })

      onClose()
    } catch (err: any) {
      console.error("Error updating team settings:", err)
      setError(`Failed to update team settings: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Team Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Team Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budgetTotal" className="block text-sm font-medium mb-1">
                Total Budget ($)
              </label>
              <Input
                id="budgetTotal"
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                placeholder="Enter total budget"
                disabled={isSubmitting}
                min="0"
                step="0.01"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum budget for this team</p>
            </div>

            <div>
              <label htmlFor="budgetCurrent" className="block text-sm font-medium mb-1">
                Current Budget ($)
              </label>
              <Input
                id="budgetCurrent"
                type="number"
                value={budgetCurrent}
                onChange={(e) => setBudgetCurrent(e.target.value)}
                placeholder="Enter current budget"
                disabled={isSubmitting}
                min="0"
                step="0.01"
                max={budgetTotal || undefined}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Current amount spent (should be ≤ total budget)</p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

