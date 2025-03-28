"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Define the shape of the user object
interface User {
  id: string
  name: string
  email: string
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing user on mount
  useEffect(() => {
    const checkUser = () => {
      try {
        // Check if we're in a test environment
        const isCypressTest = typeof window !== "undefined" && window.Cypress

        // Check for mock user in localStorage (for Cypress tests)
        const mockUser = localStorage.getItem("mockUser")
        if (mockUser) {
          setUser(JSON.parse(mockUser))
          setIsLoading(false)
          return
        }

        // In a real app, you would check for an authenticated session here
        // For now, we'll just set a null user
        setUser(null)
        setIsLoading(false)
      } catch (err) {
        console.error("Error checking authentication:", err)
        setError("Failed to authenticate")
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you would authenticate with a backend here
      // For now, we'll just set a mock user
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: "Test User",
        email,
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      // In a real app, you would sign out with a backend here
      // For now, we'll just clear the user
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("mockUser")
    } catch (err: any) {
      setError(err.message || "Failed to logout")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

