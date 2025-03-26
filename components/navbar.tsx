"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, useClerk, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"

export function Navbar() {
  const { isSignedIn, user } = useUser()
  const { openSignIn } = useClerk()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  // Set initial theme based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            EPS
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </Button>

          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Welcome back, {user.fullName || user.username}</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <Button onClick={() => openSignIn({ modalMode: true })}>Sign In</Button>
          )}
        </div>
      </div>
    </div>
  )
}