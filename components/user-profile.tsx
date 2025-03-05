"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface UserProfileProps {
  onClose?: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  // Show loading state if Clerk is not yet loaded
  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              if (onClose) onClose()
              router.push("/sign-in")
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (onClose) onClose()
              router.push("/sign-up")
            }}
          >
            Create Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
          <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-lg font-medium">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (onClose) onClose()
            router.push("/user-settings")
          }}
        >
          Settings
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            signOut()
            if (onClose) onClose()
          }}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  )
}

