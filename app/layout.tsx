import type React from "react"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { TeamProvider } from "@/contexts/team-context"
import { EventProvider } from "@/contexts/event-contexts"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { ChatAssistant } from "@/components/chat-assistant"
import "./globals.css"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <TeamProvider>
            <EventProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 overflow-auto pt-16 p-6">{children}</main>
                  <ChatAssistant />
                </div>
              </div>
            </EventProvider>
          </TeamProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

