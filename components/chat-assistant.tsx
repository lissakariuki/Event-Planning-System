"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Maximize2, Minimize2, Info, Trash2 } from "lucide-react"
import { formatAIResponse, categorizeResponse } from "@/lib/format-ai-response"

type Message = {
  role: "user" | "assistant"
  content: string
  formattedContent?: string
  context?: string
  id: string
}

export function ChatAssistant() {
  // Update the useState for messages to use localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to get messages from localStorage
    const savedMessages = typeof window !== "undefined" ? localStorage.getItem("chatMessages") : null

    if (savedMessages) {
      try {
        return JSON.parse(savedMessages)
      } catch (e) {
        console.error("Failed to parse saved messages", e)
      }
    }

    // Default initial message
    return [
      {
        role: "assistant",
        content: "Hello! How can I help with your event planning today?",
        formattedContent: "<p>Hello! How can I help with your event planning today?</p>",
        id: "1",
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasInteracted, setHasInteracted] = useState(messages.length > 1)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Add useEffect to save messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
      // Also update hasInteracted based on messages length
      setHasInteracted(messages.length > 1)
    }
  }, [messages])

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      const initialMessage: Message = {
        role: "assistant" as const,
        content: "Hello! How can I help with your event planning today?",
        formattedContent: "<p>Hello! How can I help with your event planning today?</p>",
        id: Date.now().toString(),
      }
      setMessages([initialMessage])
      setHasInteracted(false)

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("chatMessages", JSON.stringify([initialMessage]))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Set hasInteracted to true when user sends a message
    setHasInteracted(true)

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

      // Process and format the AI response
      const { message, context } = categorizeResponse(data.content)
      const formattedContent = formatAIResponse(message)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          formattedContent,
          context,
          id: Date.now().toString(),
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          formattedContent: "<p>Sorry, I encountered an error. Please try again.</p>",
          id: Date.now().toString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`fixed ${isExpanded ? "inset-4" : "bottom-4 right-4 w-96"} ${
        isOpen ? (isExpanded ? "h-[calc(100vh-32px)]" : "h-[500px]") : "h-12"
      } flex flex-col transition-all duration-300 ease-in-out z-40 shadow-lg`}
    >
      <div className="p-3 bg-blue-500 text-white font-semibold flex items-center justify-between">
        <div className="cursor-pointer flex items-center" onClick={() => setIsOpen(!isOpen)}>
          <span>Chat Assistant</span>
          {!isOpen && hasInteracted && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          <span className="ml-2">{isOpen ? "▼" : "▲"}</span>
        </div>
        {isOpen && (
          <div className="flex items-center space-x-2">
            <button onClick={clearChat} className="text-white hover:bg-blue-600 p-1 rounded" title="Clear chat history">
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 p-1 rounded"
              title="Minimize chat"
            >
              <Minimize2 size={16} />
            </button>
            {/* <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-blue-600 p-1 rounded"
              title={isExpanded ? "Reduce size" : "Expand to full screen"}
            > 
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>*/}
          </div>
        )}
      </div>
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`${message.role === "user" ? "text-right" : "text-left"} mb-4`}>
                {message.role === "assistant" && message.context && (
                  <div className="flex items-center mb-1 text-xs text-gray-500">
                    <Info size={12} className="mr-1" />
                    <span>Context: {message.context}</span>
                  </div>
                )}
                <div
                  className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {message.role === "assistant" && message.formattedContent ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.formattedContent }}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
              <Send size={18} />
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}

