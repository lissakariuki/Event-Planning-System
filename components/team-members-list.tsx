"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, ShieldCheck, User } from "lucide-react"
import type { Team } from "@/lib/types"

interface TeamMembersListProps {
  team: Team
}

export function TeamMembersList({ team }: TeamMembersListProps) {
  if (team.members.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No team members yet. Add your first team member to get started.</p>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <ShieldCheck className="h-3 w-3 mr-1 fill-primary" /> Owner
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Shield className="h-3 w-3 mr-1" /> Admin
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            <User className="h-3 w-3 mr-1" /> Member
          </Badge>
        )
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {team.members.map((member) => (
          <TableRow key={member.userId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?text=${member.user.name.charAt(0)}`} />
                  <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{member.user.name}</span>
              </div>
            </TableCell>
            <TableCell>{member.user.email}</TableCell>
            <TableCell>{getRoleBadge(member.role)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Change Role</DropdownMenuItem>
                  {member.role !== "owner" && <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

