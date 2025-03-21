"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { useUser } from "@clerk/nextjs"

interface Message {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: Date
}

export function TeamDiscussion() {
  const { currentTeam } = useTeam()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "I've updated the guest list with the latest RSVPs.",
      userId: "user2",
      userName: "Sarah Johnson",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      content: "The venue has confirmed our booking for December 24th.",
      userId: "user1",
      userName: "John Smith",
      timestamp: new Date(Date.now() - 1800000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !currentTeam) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      userId: user.id,
      userName: user.fullName || user.username || "User",
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  if (!currentTeam) {
    return null
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Team Discussion</h2>
      <div className="h-64 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.userName}</span>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

