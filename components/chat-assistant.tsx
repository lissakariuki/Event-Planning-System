"use client"

import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export function ChatAssistant() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  })
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      className={`fixed bottom-4 right-4 w-96 ${isOpen ? "h-[500px]" : "h-12"} flex flex-col transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 bg-blue-500 text-white font-semibold cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        Chat Assistant {isOpen ? "▼" : "▲"}
      </div>
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`${message.role === "user" ? "text-right" : "text-left"}`}>
                <span
                  className={`inline-block p-2 rounded-lg ${message.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}
                >
                  {message.content}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t flex">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 mr-2"
            />
            <Button type="submit">
              <Send size={20} />
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}

