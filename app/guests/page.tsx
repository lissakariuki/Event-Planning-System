"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, Mail, Trash2, Edit, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useEventContext } from "@/contexts/event-contexts"

export default function GuestsPage() {
  const { guests, setGuests, addActivity } = useEventContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false)
  const [isDeleteGuestOpen, setIsDeleteGuestOpen] = useState(false)
  const [isSendInvitationOpen, setIsSendInvitationOpen] = useState(false)

  const [currentGuest, setCurrentGuest] = useState<(typeof guests)[0] | null>(null)
  const [newGuest, setNewGuest] = useState<Omit<(typeof guests)[0], "id">>({
    name: "",
    email: "",
    rsvp: "Pending",
    phone: "",
    dietaryRestrictions: "",
  })

  const [selectedGuests, setSelectedGuests] = useState<number[]>([])
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const validateGuestForm = (guest: Omit<(typeof guests)[0], "id">) => {
    const errors: { [key: string]: string } = {}

    if (!guest.name.trim()) {
      errors.name = "Name is required"
    }

    if (!guest.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(guest.email)) {
      errors.email = "Email is invalid"
    }

    return errors
  }

  const handleAddGuest = () => {
    const errors = validateGuestForm(newGuest)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const newId = Math.max(0, ...guests.map((g) => g.id)) + 1
    const updatedGuests = [...guests, { ...newGuest, id: newId }]
    setGuests(updatedGuests)
    setIsAddGuestOpen(false)
    setNewGuest({ name: "", email: "", rsvp: "Pending", phone: "", dietaryRestrictions: "" })
    setFormErrors({})

    addActivity(`Guest added: ${newGuest.name}`)

    toast({
      title: "Guest Added",
      description: `${newGuest.name} has been added to your guest list.`,
    })
  }

  const handleEditGuest = () => {
    if (!currentGuest) return

    const errors = validateGuestForm(currentGuest)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setGuests(guests.map((guest) => (guest.id === currentGuest.id ? currentGuest : guest)))
    setIsEditGuestOpen(false)
    setCurrentGuest(null)
    setFormErrors({})

    addActivity(`Guest updated: ${currentGuest.name}`)

    toast({
      title: "Guest Updated",
      description: `${currentGuest.name}'s information has been updated.`,
    })
  }

  const handleDeleteGuest = () => {
    if (!currentGuest) return

    setGuests(guests.filter((guest) => guest.id !== currentGuest.id))
    setIsDeleteGuestOpen(false)

    addActivity(`Guest removed: ${currentGuest.name}`)

    toast({
      title: "Guest Removed",
      description: `${currentGuest.name} has been removed from your guest list.`,
      variant: "destructive",
    })

    setCurrentGuest(null)
  }

  const handleSendInvitation = () => {
    // Here you would implement the logic to send invitations
    const selectedGuestNames = guests.filter((guest) => selectedGuests.includes(guest.id)).map((guest) => guest.name)

    addActivity(`Invitations sent to ${selectedGuestNames.length} guests`)

    toast({
      title: "Invitations Sent",
      description: `Invitations have been sent to ${selectedGuestNames.join(", ")}.`,
    })

    setIsSendInvitationOpen(false)
    setSelectedGuests([])
  }

  const handleRSVPChange = (id: number, newRSVP: string) => {
    setGuests(
      guests.map((guest) =>
        guest.id === id ? { ...guest, rsvp: newRSVP as "Attending" | "Not Attending" | "Pending" } : guest,
      ),
    )

    const guestName = guests.find((g) => g.id === id)?.name

    addActivity(`RSVP updated: ${guestName} is ${newRSVP}`)

    toast({
      title: "RSVP Updated",
      description: `${guestName}'s RSVP status is now "${newRSVP}".`,
    })
  }

  const openEditDialog = (guest: (typeof guests)[0]) => {
    setCurrentGuest(guest)
    setFormErrors({})
    setIsEditGuestOpen(true)
  }

  const openDeleteDialog = (guest: (typeof guests)[0]) => {
    setCurrentGuest(guest)
    setIsDeleteGuestOpen(true)
  }

  const getTotalAttending = () => {
    return guests.filter((guest) => guest.rsvp === "Attending").length
  }

  const getTotalNotAttending = () => {
    return guests.filter((guest) => guest.rsvp === "Not Attending").length
  }

  const getTotalPending = () => {
    return guests.filter((guest) => guest.rsvp === "Pending").length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Guest List</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Total: {guests.length}
          </Badge>
          <Badge variant="success" className="px-3 py-1 bg-green-600">
            Attending: {getTotalAttending()}
          </Badge>
          <Badge variant="destructive" className="px-3 py-1">
            Declined: {getTotalNotAttending()}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Pending: {getTotalPending()}
          </Badge>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Guest
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="add-guest-description">
                <DialogHeader>
                  <DialogTitle>Add New Guest</DialogTitle>
                  <DialogDescription id="add-guest-description">
                    Enter the details of the new guest you want to add to your event.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guest-name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="guest-name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guest-email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="guest-email"
                      type="email"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guest-phone">Phone</Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guest-dietary">Dietary Restrictions</Label>
                    <Input
                      id="guest-dietary"
                      value={newGuest.dietaryRestrictions}
                      onChange={(e) => setNewGuest({ ...newGuest, dietaryRestrictions: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guest-rsvp">RSVP Status</Label>
                    <Select
                      value={newGuest.rsvp}
                      onValueChange={(value) =>
                        setNewGuest({ ...newGuest, rsvp: value as "Attending" | "Not Attending" | "Pending" })
                      }
                    >
                      <SelectTrigger id="guest-rsvp">
                        <SelectValue placeholder="Select RSVP status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Attending">Attending</SelectItem>
                        <SelectItem value="Not Attending">Not Attending</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddGuestOpen(false)
                      setFormErrors({})
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddGuest}>Save Guest</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isSendInvitationOpen} onOpenChange={setIsSendInvitationOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto" variant="outline">
                  <Mail className="mr-2 h-4 w-4" /> Send Invitations
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="send-invitations-description">
                <DialogHeader>
                  <DialogTitle>Send Invitations</DialogTitle>
                  <DialogDescription id="send-invitations-description">
                    Select the guests you want to send invitations to for your event.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {selectedGuests.length === 0 && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No guests selected. Please select at least one guest.</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between mb-2">
                    <p>Select guests:</p>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedGuests(guests.map((g) => g.id))}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedGuests([])}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {guests.map((guest) => (
                      <div key={guest.id} className="flex items-center py-2 border-b last:border-0">
                        <input
                          type="checkbox"
                          id={`guest-${guest.id}`}
                          checked={selectedGuests.includes(guest.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGuests([...selectedGuests, guest.id])
                            } else {
                              setSelectedGuests(selectedGuests.filter((id) => id !== guest.id))
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`guest-${guest.id}`} className="flex-1">
                          <div>{guest.name}</div>
                          <div className="text-sm text-gray-500">{guest.email}</div>
                        </label>
                        <Badge
                          variant={
                            guest.rsvp === "Attending"
                              ? "default"
                              : guest.rsvp === "Not Attending"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {guest.rsvp}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSendInvitationOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation} disabled={selectedGuests.length === 0}>
                    Send Invitations
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No guests found matching your search.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Dietary Restrictions</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.email}</TableCell>
                    <TableCell>{guest.phone || "-"}</TableCell>
                    <TableCell>{guest.dietaryRestrictions || "-"}</TableCell>
                    <TableCell>
                      <Select value={guest.rsvp} onValueChange={(value) => handleRSVPChange(guest.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select RSVP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attending">Attending</SelectItem>
                          <SelectItem value="Not Attending">Not Attending</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(guest)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(guest)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Guest Dialog */}
      <Dialog open={isEditGuestOpen} onOpenChange={setIsEditGuestOpen}>
        <DialogContent aria-describedby="edit-guest-description">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription id="edit-guest-description">
              Update the details for {currentGuest?.name}.
            </DialogDescription>
          </DialogHeader>
          {currentGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-guest-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-guest-name"
                  value={currentGuest.name}
                  onChange={(e) => setCurrentGuest({ ...currentGuest, name: e.target.value })}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-guest-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-guest-email"
                  type="email"
                  value={currentGuest.email}
                  onChange={(e) => setCurrentGuest({ ...currentGuest, email: e.target.value })}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-guest-phone">Phone</Label>
                <Input
                  id="edit-guest-phone"
                  type="tel"
                  value={currentGuest.phone || ""}
                  onChange={(e) => setCurrentGuest({ ...currentGuest, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-guest-dietary">Dietary Restrictions</Label>
                <Input
                  id="edit-guest-dietary"
                  value={currentGuest.dietaryRestrictions || ""}
                  onChange={(e) => setCurrentGuest({ ...currentGuest, dietaryRestrictions: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-guest-rsvp">RSVP Status</Label>
                <Select
                  value={currentGuest.rsvp}
                  onValueChange={(value) =>
                    setCurrentGuest({ ...currentGuest, rsvp: value as "Attending" | "Not Attending" | "Pending" })
                  }
                >
                  <SelectTrigger id="edit-guest-rsvp">
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Attending">Attending</SelectItem>
                    <SelectItem value="Not Attending">Not Attending</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditGuestOpen(false)
                setFormErrors({})
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditGuest}>Update Guest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Guest Dialog */}
      <Dialog open={isDeleteGuestOpen} onOpenChange={setIsDeleteGuestOpen}>
        <DialogContent aria-describedby="delete-guest-description">
          <DialogHeader>
            <DialogTitle>Delete Guest</DialogTitle>
            <DialogDescription id="delete-guest-description">
              Are you sure you want to remove {currentGuest?.name} from your guest list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteGuestOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGuest}>
              Delete Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

