"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GuestsPage() {
  const [guests, setGuests] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", rsvp: "Attending" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", rsvp: "Not Attending" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com", rsvp: "Pending" },
    { id: 4, name: "Bob Williams", email: "bob@example.com", rsvp: "Attending" },
    { id: 5, name: "Emma Brown", email: "emma@example.com", rsvp: "Pending" },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: "", email: "", rsvp: "Pending" })
  const [isSendInvitationOpen, setIsSendInvitationOpen] = useState(false)
  const [selectedGuests, setSelectedGuests] = useState<number[]>([])

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddGuest = () => {
    setGuests([...guests, { ...newGuest, id: guests.length + 1 }])
    setIsAddGuestOpen(false)
    setNewGuest({ name: "", email: "", rsvp: "Pending" })
  }

  const handleSendInvitation = () => {
    // Here you would implement the logic to send invitations
    console.log("Sending invitations to:", selectedGuests)
    setIsSendInvitationOpen(false)
    setSelectedGuests([])
  }

  const handleRSVPChange = (id: number, newRSVP: string) => {
    setGuests(guests.map((guest) => (guest.id === id ? { ...guest, rsvp: newRSVP } : guest)))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Guest List</h1>
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
              </div>
              <Button onClick={handleAddGuest}>Save Guest</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={isSendInvitationOpen} onOpenChange={setIsSendInvitationOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Mail className="mr-2 h-4 w-4" /> Send Invitations
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="send-invitations-description">
              <DialogHeader>
                <DialogTitle>Send Invitations</DialogTitle>
                <p id="send-invitations-description" className="text-sm text-gray-500">
                  Select the guests you want to send invitations to for your event.
                </p>
              </DialogHeader>
              <div className="py-4">
                <p>Select guests to send invitations:</p>
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center mt-2">
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
                    <label htmlFor={`guest-${guest.id}`}>{guest.name}</label>
                  </div>
                ))}
              </div>
              <Button onClick={handleSendInvitation}>Send Invitations</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>
                    <Select value={guest.rsvp} onValueChange={(value) => handleRSVPChange(guest.id, value)}>
                      <SelectTrigger className="w-[180px]">
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
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

