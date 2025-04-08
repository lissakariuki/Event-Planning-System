"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useSupabase } from "@/hooks/use-supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Send,
  Mic,
  MicOff,
  Paperclip,
  ImageIcon,
  Play,
  Pause,
  X,
  MoreVertical,
  RefreshCw,
  Check,
  CheckCheck,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  team_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  attachment_url?: string
  attachment_type?: string
  audio_url?: string
  created_at: string
  read_by?: string[]
  status?: "sending" | "sent" | "delivered" | "read" | "error"
}

interface TypingUser {
  id: string
  name: string
  timestamp: number
}

interface TeamChatProps {
  teamId: string
}

export type Database = {
    public: {
      Tables: {
        team_messages: {
          Row: {
            id: string
            team_id: string
            user_id: string
            user_name: string
            user_avatar?: string
            content: string
            attachment_url?: string
            attachment_type?: string
            audio_url?: string
            created_at: string
            read_by?: string[]
          }
          Insert: {
            id?: string
            team_id: string
            user_id: string
            user_name: string
            user_avatar?: string
            content: string
            attachment_url?: string
            attachment_type?: string
            audio_url?: string
            created_at?: string
            read_by?: string[]
          }
          Update: {
            read_by?: string[]
          }
        }
    }}
}

export function TeamChat({ teamId }: TeamChatProps) {
  const { user } = useUser()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastReadTimestamp, setLastReadTimestamp] = useState<Date>(new Date())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Load messages
  const loadMessages = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const { data, error } = await supabase
          .from("team_messages")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: true })

        if (error) throw error

        // Add status to messages
        const messagesWithStatus =
          data?.map((msg) => ({
            ...msg,
            status: "delivered" as const,
            read_by: msg.read_by || [],
          })) || []

        setMessages(messagesWithStatus)

        // Check for unread messages (messages created after lastReadTimestamp)
        const newUnreadCount = messagesWithStatus.filter(
          (msg) => new Date(msg.created_at) > lastReadTimestamp && msg.user_id !== user?.id,
        ).length

        setUnreadMessages(newUnreadCount)

        // Mark messages as read
        if (newUnreadCount > 0) {
          const unreadMessageIds = messagesWithStatus
            .filter((msg) => new Date(msg.created_at) > lastReadTimestamp && msg.user_id !== user?.id)
            .map((msg) => msg.id)

          // Update read_by field for each unread message
          for (const msgId of unreadMessageIds) {
            if (user?.id) {
              await supabase
                .from("team_messages")
                .update({
                  read_by: supabase.sql`array_append(read_by, ${user.id})`
                })
                .eq("id", msgId)
            }
          }

          // Update last read timestamp
          setLastReadTimestamp(new Date())
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        toast({
          title: "Error loading messages",
          description: "Could not load chat messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [supabase, teamId, toast, lastReadTimestamp, user?.id],
  )

  // Initial load and subscription setup
  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Only increment unread count if message is from someone else
          if (newMessage.user_id !== user?.id) {
            setUnreadMessages((prev) => prev + 1)

            // Show toast notification for new message
            toast({
              title: `New message from ${newMessage.user_name}`,
              description:
                newMessage.content.length > 30 ? newMessage.content.substring(0, 30) + "..." : newMessage.content,
            })
          }

          setMessages((prev) => [
            ...prev,
            {
              ...newMessage,
              status: "delivered",
              read_by: newMessage.read_by || [],
            },
          ])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? { ...updatedMessage, status: "read", read_by: updatedMessage.read_by || [] }
                : msg,
            ),
          )
        },
      )
      .on("presence", { event: "sync" }, () => {
        // Handle presence sync
        const state = channel.presenceState()
        const typingUsersList: TypingUser[] = []

        Object.keys(state).forEach((presenceId) => {
          const presence = state[presenceId] as any[]
          presence.forEach((p) => {
            if (p.isTyping && p.user_id !== user?.id) {
              typingUsersList.push({
                id: p.user_id,
                name: p.user_name,
                timestamp: p.timestamp,
              })
            }
          })
        })

        setTypingUsers(typingUsersList)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({
            user_id: user.id,
            user_name: user.fullName || user.username || "User",
            isTyping: false,
            timestamp: Date.now(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, teamId, user, toast, loadMessages])

  // Mark messages as read when chat is visible
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user?.id) return

      // Get unread messages not from current user
      const unreadMessages = messages.filter((msg) => !msg.read_by?.includes(user.id) && msg.user_id !== user.id)

      if (unreadMessages.length === 0) return

    // Update read_by field for each unread message
    for (const message of unreadMessages) {
      const { data: messageData } = await supabase
        .from("team_messages")
        .select("read_by")
        .eq("id", message.id)
        .single()

      if (messageData) {
        await supabase
          .from("team_messages")
          .update({
            read_by: [...(messageData.read_by || []), user.id]
          })
          .eq("id", message.id)
      }
    }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          unreadMessages.some((unread) => unread.id === msg.id)
            ? { ...msg, read_by: [...(msg.read_by || []), user.id], status: "read" }
            : msg,
        ),
      )

      // Reset unread count
      setUnreadMessages(0)
      setLastReadTimestamp(new Date())
    }

    // Mark as read when component mounts and whenever messages change
    markMessagesAsRead()
  }, [messages, supabase, user?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Clean up typing users who haven't updated their status in 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setTypingUsers((prev) => prev.filter((user) => now - user.timestamp < 3000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle typing indicator
  const handleTyping = async () => {
    if (!user) return

    if (!isTyping) {
      setIsTyping(true)

      const channel = supabase.channel(`team-chat-${teamId}`)
      await channel.track({
        user_id: user.id,
        user_name: user.fullName || user.username || "User",
        isTyping: true,
        timestamp: Date.now(),
      })
    }

    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    // Set new timer to stop typing indicator after 2 seconds of inactivity
    typingTimerRef.current = setTimeout(async () => {
      setIsTyping(false)

      const channel = supabase.channel(`team-chat-${teamId}`)
      await channel.track({
        user_id: user.id,
        user_name: user.fullName || user.username || "User",
        isTyping: false,
        timestamp: Date.now(),
      })
    }, 2000)
  }

  // Send a text message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    // Create a temporary ID for optimistic UI update
    const tempId = `temp-${Date.now()}`

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      team_id: teamId,
      user_id: user.id,
      user_name: user.fullName || user.username || "User",
      user_avatar: user.imageUrl,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      status: "sending",
      read_by: [user.id],
    }

    // Add to messages immediately for optimistic UI
    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")

    try {
      // Send to server
      const { data, error } = await supabase
        .from("team_messages")
        .insert({
          team_id: teamId,
          user_id: user.id,
          user_name: user.fullName || user.username || "User",
          user_avatar: user.imageUrl,
          content: optimisticMessage.content,
          created_at: new Date().toISOString(),
          read_by: [user.id],
        })
        .select()

      if (error) throw error

      // Update the message with the real ID and status
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...data[0], status: "sent" } : msg)))

      // Show toast notification
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })

      // Clear typing indicator
      setIsTyping(false)
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }

      const channel = supabase.channel(`team-chat-${teamId}`)
      await channel.track({
        user_id: user.id,
        user_name: user.fullName || user.username || "User",
        isTyping: false,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Update the message with error status
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "error" } : msg)))

      // Show error toast
      toast({
        title: "Error sending message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())

        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          setRecordingTime(0)
        }

        // Show toast notification
        toast({
          title: "Recording complete",
          description: "Your voice message is ready to send.",
        })
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start recording timer
      setRecordingTime(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Show toast notification
      toast({
        title: "Recording started",
        description: "Recording your voice message...",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      })
    }
  }

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioBlob(null)

      toast({
        title: "Recording cancelled",
        description: "Voice message recording was cancelled.",
      })
    }
  }

  // Send audio message
  const sendAudioMessage = async () => {
    if (!audioBlob || !user) return

    // Create a temporary ID for optimistic UI update
    const tempId = `temp-${Date.now()}`

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      team_id: teamId,
      user_id: user.id,
      user_name: user.fullName || user.username || "User",
      user_avatar: user.imageUrl,
      content: "🎤 Voice message",
      created_at: new Date().toISOString(),
      status: "sending",
      read_by: [user.id],
    }

    // Add to messages immediately for optimistic UI
    setMessages((prev) => [...prev, optimisticMessage])
    setUploadingFile(true)

    try {
      // Upload audio to storage
      const fileName = `audio-${uuidv4()}.webm`
      const filePath = `team-messages/${teamId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("chat-attachments").upload(filePath, audioBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(filePath)

      // Save message with audio URL
      const { data, error } = await supabase
        .from("team_messages")
        .insert({
          team_id: teamId,
          user_id: user.id,
          user_name: user.fullName || user.username || "User",
          user_avatar: user.imageUrl,
          content: "🎤 Voice message",
          audio_url: urlData.publicUrl,
          created_at: new Date().toISOString(),
          read_by: [user.id],
        })
        .select()

      if (error) throw error

      // Update the message with the real ID and status
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...data[0], status: "sent", audio_url: urlData.publicUrl } : msg)),
      )

      // Show toast notification
      toast({
        title: "Voice message sent",
        description: "Your voice message has been sent successfully.",
      })

      // Reset audio state
      setAudioBlob(null)
    } catch (error) {
      console.error("Error sending audio message:", error)

      // Update the message with error status
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "error" } : msg)))

      // Show error toast
      toast({
        title: "Error sending voice message",
        description: "Your voice message could not be sent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Create a temporary ID for optimistic UI update
    const tempId = `temp-${Date.now()}`

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      team_id: teamId,
      user_id: user.id,
      user_name: user.fullName || user.username || "User",
      user_avatar: user.imageUrl,
      content: `📎 ${file.name}`,
      created_at: new Date().toISOString(),
      status: "sending",
      read_by: [user.id],
    }

    // Add to messages immediately for optimistic UI
    setMessages((prev) => [...prev, optimisticMessage])
    setUploadingFile(true)

    try {
      // Upload file to storage
      const fileName = `file-${uuidv4()}-${file.name}`
      const filePath = `team-messages/${teamId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("chat-attachments").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(filePath)

      // Save message with file URL
      const { data, error } = await supabase
        .from("team_messages")
        .insert({
          team_id: teamId,
          user_id: user.id,
          user_name: user.fullName || user.username || "User",
          user_avatar: user.imageUrl,
          content: `📎 ${file.name}`,
          attachment_url: urlData.publicUrl,
          attachment_type: file.type,
          created_at: new Date().toISOString(),
          read_by: [user.id],
        })
        .select()

      if (error) throw error

      // Update the message with the real ID and status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...data[0],
                status: "sent",
                attachment_url: urlData.publicUrl,
                attachment_type: file.type,
              }
            : msg,
        ),
      )

      // Show toast notification
      toast({
        title: "File uploaded",
        description: `Your file "${file.name}" has been sent successfully.`,
      })

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (imageInputRef.current) imageInputRef.current.value = ""
    } catch (error) {
      console.error("Error uploading file:", error)

      // Update the message with error status
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "error" } : msg)))

      // Show error toast
      toast({
        title: "Error uploading file",
        description: "Your file could not be uploaded. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  // Play/pause audio
  const toggleAudio = (messageId: string, audioUrl: string) => {
    if (!audioRefs.current[messageId]) {
      audioRefs.current[messageId] = new Audio(audioUrl)

      audioRefs.current[messageId].addEventListener("ended", () => {
        setIsPlaying(null)
      })
    }

    if (isPlaying === messageId) {
      audioRefs.current[messageId].pause()
      setIsPlaying(null)
    } else {
      // Pause any currently playing audio
      if (isPlaying && audioRefs.current[isPlaying]) {
        audioRefs.current[isPlaying].pause()
      }

      audioRefs.current[messageId].play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          title: "Playback error",
          description: "Could not play the voice message. Please try again.",
          variant: "destructive",
        })
      })
      setIsPlaying(messageId)
    }
  }

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle manual refresh
  const handleRefresh = () => {
    loadMessages(false)
  }

  // Render message status indicator
  const renderMessageStatus = (message: Message) => {
    if (message.user_id !== user?.id) return null

    switch (message.status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400 ml-1" />
      case "sent":
        return <Check className="h-3 w-3 text-gray-400 ml-1" />
      case "delivered":
        return <Check className="h-3 w-3 text-gray-400 ml-1" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500 ml-1" />
      case "error":
        return <X className="h-3 w-3 text-red-500 ml-1" />
      default:
        return null
    }
  }

  // Render file attachment
  const renderAttachment = (message: Message) => {
    if (message.audio_url) {
      return (
        <div className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleAudio(message.id, message.audio_url!)}
          >
            {isPlaying === message.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div
              className={cn(
                "h-1 bg-primary rounded-full transition-all",
                isPlaying === message.id ? "animate-progress" : "",
              )}
              style={{
                width: isPlaying === message.id ? "100%" : "0%",
                animation: isPlaying === message.id ? "progress 10s linear forwards" : "none",
              }}
            />
          </div>
        </div>
      )
    }

    if (message.attachment_url) {
      if (message.attachment_type?.startsWith("image/")) {
        return (
          <div className="mt-2">
            <img
              src={message.attachment_url || "/placeholder.svg"}
              alt="Attachment"
              className="max-w-[300px] max-h-[200px] rounded-md object-contain"
            />
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm truncate max-w-[200px]"
          >
            {message.content.replace("📎 ", "")}
          </a>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="flex flex-col h-[500px] mb-6" ref={chatContainerRef}>
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="font-semibold">Team Chat</h3>
          {unreadMessages > 0 && (
            <Badge
              variant="outline"
              className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 animate-pulse"
            >
              {unreadMessages} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={isRefreshing ? "animate-spin" : ""}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation by sending a message to your team.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user_avatar} />
                  <AvatarFallback>{message.user_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{message.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {renderMessageStatus(message)}
                  </div>
                  <p className="text-sm mt-1">{message.content}</p>
                  {renderAttachment(message)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0].name} is typing...</span>
          ) : (
            <span>{typingUsers.map((u) => u.name).join(", ")} are typing...</span>
          )}
        </div>
      )}

      <div className="p-4 border-t">
        {audioBlob ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleAudio("preview", URL.createObjectURL(audioBlob))}
              >
                {isPlaying === "preview" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="ml-2 text-sm">Audio message ready to send</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setAudioBlob(null)}>
              <X className="h-4 w-4" />
            </Button>
            <Button disabled={uploadingFile} onClick={sendAudioMessage}>
              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-md flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2" />
              <div className="text-sm">Recording... {formatRecordingTime(recordingTime)}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelRecording}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={stopRecording}>
              <MicOff className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording || uploadingFile}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isRecording || uploadingFile}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={startRecording} disabled={isRecording || uploadingFile}>
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Record voice message</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="flex-1 min-h-[40px] max-h-[120px]"
            disabled={isRecording || uploadingFile}
          />

          <Button onClick={sendMessage} disabled={!newMessage.trim() || isRecording || uploadingFile}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        />

        <input type="file" ref={imageInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      </div>
    </Card>
  )
}
