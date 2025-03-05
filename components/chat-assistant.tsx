"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
  id: string
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help with your event planning today?", id: "1" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.content, id: Date.now().toString() }])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          id: Date.now().toString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 w-96 ${isOpen ? "h-[500px]" : "h-12"} flex flex-col transition-all duration-300 ease-in-out z-40`}
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
            {isLoading && (
              <div className="text-left">
                <span className="inline-block p-2 rounded-lg bg-gray-100">Thinking...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t flex">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 mr-2"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send size={20} />
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}

