"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Mail, MessageSquare } from "lucide-react"

interface TeamMemberProps {
  member: {
    id: number
    name: string
    email: string
    role: string
    avatar: string
  }
}

export function TeamMember({ member }: TeamMemberProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [role, setRole] = useState(member.role)

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={role === "Admin" ? "default" : "outline"}>{role}</Badge>
        <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manage Team Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="role" className="text-right">
                  Role
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button variant="destructive">Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

