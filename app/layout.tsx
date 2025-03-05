import type React from "react"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { ChatAssistant } from "@/components/chat-assistant"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Event Planning System",
  description: "AI-driven event planning and management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <div className="flex h-screen bg-gray-100 dark:bg-gray-950 pt-16">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
            <ChatAssistant />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}

