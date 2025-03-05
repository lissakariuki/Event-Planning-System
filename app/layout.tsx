import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
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
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
          <ChatAssistant />
        </div>
      </body>
    </html>
  )
}

