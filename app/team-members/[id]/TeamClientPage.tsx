"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageUrlInput } from "@/components/image-url-input"
import Image from "next/image"
import type { FC } from "react"

interface Params {
  id: string
}

interface Props {
  params: Params
  team: any // TODO: fix type
  setTeam: any // TODO: fix type
  editTeamData: any // TODO: fix type
  setEditTeamData: any // TODO: fix type
  isEditImagesOpen: boolean
  setIsEditImagesOpen: any
  setIsEditTeamOpen: any
}

// This component is now deprecated and replaced by team-detail-page.tsx
const TeamClientPage: FC<Props> = ({
  params,
  team,
  setTeam,
  editTeamData,
  setEditTeamData,
  isEditImagesOpen,
  setIsEditImagesOpen,
  setIsEditTeamOpen,
}) => {
  const handleEditTeam = () => {
    if (editTeamData.name) {
      const updatedTeam = { ...team }
      updatedTeam.name = editTeamData.name
      updatedTeam.description = editTeamData.description
      // Only update these if they were changed in the edit team dialog
      if (editTeamData.logo) updatedTeam.logo = editTeamData.logo
      if (editTeamData.coverImage) updatedTeam.coverImage = editTeamData.coverImage
      setTeam(updatedTeam)
      setIsEditImagesOpen(false)
      setIsEditTeamOpen(false)
    }
  }

  return (
    <>
      <Dialog open={isEditImagesOpen} onOpenChange={setIsEditImagesOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-white/90 hover:bg-white mr-2">
            <Image className="mr-2 h-4 w-4" alt="edit images" src="/images/placeholder.svg" width={16} height={16} />{" "}
            Edit Images
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Team Images</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <ImageUrlInput
              label="Team Logo URL"
              id="logo-url"
              value={editTeamData.logo || team.logo || ""}
              onChange={(value) => setEditTeamData({ ...editTeamData, logo: value })}
              previewHeight={80}
              previewWidth={80}
              previewClassName="rounded-md"
            />

            <ImageUrlInput
              label="Cover Image URL"
              id="cover-url"
              value={editTeamData.coverImage || team.coverImage || ""}
              onChange={(value) => setEditTeamData({ ...editTeamData, coverImage: value })}
              previewHeight={120}
              previewWidth={480}
              previewClassName="rounded-md"
            />
          </div>
          <Button
            onClick={() => {
              // Update the team images
              const updatedTeam = { ...team }
              updatedTeam.logo = editTeamData.logo || team.logo
              updatedTeam.coverImage = editTeamData.coverImage || team.coverImage
              setTeam(updatedTeam)
              setIsEditImagesOpen(false)
            }}
          >
            Update Images
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TeamClientPage

