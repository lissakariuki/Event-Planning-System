"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUrlInput } from "@/components/image-url-input"
import { useTeam } from "@/contexts/team-context"

interface TeamCreationFormProps {
  isOpen: boolean
  onClose: () => void
}

export function TeamCreationForm({ isOpen, onClose }: TeamCreationFormProps) {
  const router = useRouter()
  const { createTeam } = useTeam()

  // Update the formData state to exclude budget
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    coverImage: "",
  })

  // Update the handleCreateTeam function to exclude budget logic
  const handleCreateTeam = async () => {
    if (formData.name.trim()) {
      // Create the team with the necessary data
      const createdTeam = await createTeam(formData.name.trim(), formData.description.trim() || undefined, {
        logo: formData.logo || `/placeholder.svg?height=100&width=100&text=${formData.name.trim().charAt(0)}`,
        coverImage: formData.coverImage || "/placeholder.svg?height=300&width=1200",
      })

      // Reset form data
      setFormData({
        name: "",
        description: "",
        logo: "",
        coverImage: "",
      })

      onClose()

      // Navigate to the new team page
      if (createdTeam) {
        router.push(`/teams/${createdTeam.id}`)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the team's purpose and responsibilities"
              rows={3}
            />
          </div>

          <div className="grid gap-3">
            <Label>Team Images</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUrlInput
                label="Team Logo"
                id="team-logo"
                value={formData.logo}
                onChange={(value) => setFormData({ ...formData, logo: value })}
                previewHeight={80}
                previewWidth={80}
                previewClassName="rounded-md"
              />

              <ImageUrlInput
                label="Cover Image"
                id="team-cover"
                value={formData.coverImage}
                onChange={(value) => setFormData({ ...formData, coverImage: value })}
                previewHeight={80}
                previewWidth={160}
                previewClassName="rounded-md"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateTeam} disabled={!formData.name.trim()}>
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

