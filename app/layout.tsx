import type React from "react"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { ChatAssistant } from "@/components/chat-assistant"
import { TeamProvider } from "@/contexts/team-context"

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
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <TeamProvider>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </div>
            <ChatAssistant />
          </TeamProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
