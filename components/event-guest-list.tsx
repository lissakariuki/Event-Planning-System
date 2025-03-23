"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Guest } from "@/lib/types"

interface EventGuestListProps {
  guests: Guest[]
  onAddGuest?: (guest: Omit<Guest, "id">) => void
  onUpdateRsvp?: (guestId: string, rsvp: "attending" | "declined" | "pending") => void
}

export function EventGuestList({ guests = [], onAddGuest, onUpdateRsvp }: EventGuestListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: "", email: "", rsvp: "pending", plusOnes: 0 })

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddGuest = () => {
    if (newGuest.name && newGuest.email) {
      if (onAddGuest) {
        onAddGuest({
          name: newGuest.name,
          email: newGuest.email,
          rsvp: newGuest.rsvp as "attending" | "declined" | "pending",
          plusOnes: Number.parseInt(newGuest.plusOnes.toString(), 10) || 0,
        })
      }

      setNewGuest({ name: "", email: "", rsvp: "pending", plusOnes: 0 })
      setIsAddGuestOpen(false)
    }
  }

  const handleRsvpChange = (guestId: string, newRsvp: string) => {
    if (onUpdateRsvp) {
      onUpdateRsvp(guestId, newRsvp as "attending" | "declined" | "pending")
    }
  }

  const getRsvpBadge = (rsvp: string) => {
    switch (rsvp) {
      case "attending":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
          >
            <CheckCircle className="mr-1 h-3 w-3" /> Attending
          </Badge>
        )
      case "declined":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
          >
            <XCircle className="mr-1 h-3 w-3" /> Declined
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
          >
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
    }
  }

  // Calculate statistics
  const totalGuests = guests.length
  const attending = guests.filter((g) => g.rsvp === "attending").length
  const declined = guests.filter((g) => g.rsvp === "declined").length
  const pending = guests.filter((g) => g.rsvp === "pending").length
  const totalPlusOnes = guests.reduce((sum, guest) => sum + (guest.rsvp === "attending" ? guest.plusOnes : 0), 0)
  const totalAttending = attending + totalPlusOnes

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Total Invited</p>
          <p className="text-3xl font-bold">{totalGuests}</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Attending</p>
          <p className="text-3xl font-bold text-green-600">{totalAttending}</p>
          <p className="text-xs text-gray-500">
            ({attending} guests + {totalPlusOnes} plus ones)
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Declined</p>
          <p className="text-3xl font-bold text-red-600">{declined}</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pending}</p>
        </Card>
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
          <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <UserPlus className="mr-2 h-4 w-4" /> Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-guest-description">
              <DialogHeader>
                <DialogTitle>Add New Guest</DialogTitle>
                <p id="add-guest-description" className="text-sm text-gray-500">
                  Enter the details of the new guest you want to add to your event.
                </p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guest-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="guest-name"
                    className="col-span-3"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guest-email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    className="col-span-3"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="guest-plus-ones" className="text-right">
                    Plus Ones
                  </Label>
                  <Input
                    id="guest-plus-ones"
                    type="number"
                    min="0"
                    className="col-span-3"
                    value={newGuest.plusOnes}
                    onChange={(e) => setNewGuest({ ...newGuest, plusOnes: Number.parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddGuest}>Save Guest</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="w-full md:w-auto">
            <Mail className="mr-2 h-4 w-4" /> Send Invitations
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Plus Ones</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.email}</TableCell>
                    <TableCell>
                      {onUpdateRsvp ? (
                        <Select value={guest.rsvp} onValueChange={(value) => handleRsvpChange(guest.id, value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select RSVP" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attending">Attending</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRsvpBadge(guest.rsvp)
                      )}
                    </TableCell>
                    <TableCell>{guest.plusOnes}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No guests found. Add your first guest to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

