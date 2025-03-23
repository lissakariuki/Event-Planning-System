"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, ThumbsUp, Reply, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Team, TeamMember } from "@/lib/types"

interface TeamDiscussion {
  id: string
  title: string
  content: string
  createdAt: Date
  createdBy: TeamMember
  replies: TeamDiscussionReply[]
  likes: number
  tags: string[]
}

interface TeamDiscussionReply {
  id: string
  content: string
  createdAt: Date
  createdBy: TeamMember
  likes: number
}

interface TeamDiscussionsProps {
  team: Team
}

export function TeamDiscussions({ team }: TeamDiscussionsProps) {
  const [discussions, setDiscussions] = useState<TeamDiscussion[]>([
    {
      id: "1",
      title: "Venue options for upcoming event",
      content:
        "I've been researching venue options for our next event. I've narrowed it down to three choices: Grand Ballroom, Sunset Gardens, and Beachfront Resort. Each has its pros and cons regarding capacity, pricing, and amenities. What does everyone think?",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdBy: team.members[0],
      replies: [
        {
          id: "1-1",
          content:
            "I think the Grand Ballroom would be perfect for our needs. It has the right capacity and the pricing is within our budget.",
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
          createdBy: team.members.length > 1 ? team.members[1] : team.members[0],
          likes: 2,
        },
        {
          id: "1-2",
          content:
            "Beachfront Resort would provide a unique experience, but it might be a bit over budget. Let's discuss this further in our next meeting.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          createdBy: team.members.length > 2 ? team.members[2] : team.members[0],
          likes: 1,
        },
      ],
      likes: 3,
      tags: ["venue", "planning"],
    },
    {
      id: "2",
      title: "Budget allocation for catering",
      content:
        "We need to decide on the budget allocation for catering. Based on previous events, I suggest we allocate 30% of our total budget for food and beverages. This should cover a quality menu while leaving enough for other expenses.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      createdBy: team.members.length > 1 ? team.members[1] : team.members[0],
      replies: [],
      likes: 1,
      tags: ["budget", "catering"],
    },
  ])

  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "", tags: "" })
  const [replyContent, setReplyContent] = useState("")
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null)

  const handleCreateDiscussion = () => {
    if (newDiscussion.title && newDiscussion.content) {
      const tags = newDiscussion.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const discussion: TeamDiscussion = {
        id: Date.now().toString(),
        title: newDiscussion.title,
        content: newDiscussion.content,
        createdAt: new Date(),
        createdBy: team.members[0], // Assuming the first member is the current user
        replies: [],
        likes: 0,
        tags,
      }

      setDiscussions([discussion, ...discussions])
      setNewDiscussion({ title: "", content: "", tags: "" })
      setIsNewDiscussionOpen(false)
    }
  }

  const handleAddReply = (discussionId: string) => {
    if (replyContent) {
      const updatedDiscussions = discussions.map((discussion) => {
        if (discussion.id === discussionId) {
          const reply: TeamDiscussionReply = {
            id: `${discussionId}-${discussion.replies.length + 1}`,
            content: replyContent,
            createdAt: new Date(),
            createdBy: team.members[0], // Assuming the first member is the current user
            likes: 0,
          }

          return {
            ...discussion,
            replies: [...discussion.replies, reply],
          }
        }
        return discussion
      })

      setDiscussions(updatedDiscussions)
      setReplyContent("")
      setActiveDiscussionId(null)
    }
  }

  const handleLikeDiscussion = (discussionId: string) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          likes: discussion.likes + 1,
        }
      }
      return discussion
    })

    setDiscussions(updatedDiscussions)
  }

  const handleLikeReply = (discussionId: string, replyId: string) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === discussionId) {
        const updatedReplies = discussion.replies.map((reply) => {
          if (reply.id === replyId) {
            return {
              ...reply,
              likes: reply.likes + 1,
            }
          }
          return reply
        })

        return {
          ...discussion,
          replies: updatedReplies,
        }
      }
      return discussion
    })

    setDiscussions(updatedDiscussions)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Discussions</h2>
        <Dialog open={isNewDiscussionOpen} onOpenChange={setIsNewDiscussionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="discussion-title">Title</Label>
                <Input
                  id="discussion-title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  placeholder="Enter a title for your discussion"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discussion-content">Content</Label>
                <Textarea
                  id="discussion-content"
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or ideas with the team"
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discussion-tags">Tags (comma separated)</Label>
                <Input
                  id="discussion-tags"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                  placeholder="e.g. venue, budget, planning"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDiscussionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDiscussion}>Post Discussion</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {discussions.length > 0 ? (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?text=${discussion.createdBy.user.name.charAt(0)}`} />
                  <AvatarFallback>{discussion.createdBy.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{discussion.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="font-medium">{discussion.createdBy.user.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimeAgo(discussion.createdAt)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Pin Discussion</DropdownMenuItem>
                        <DropdownMenuItem>Copy Link</DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 text-gray-700 dark:text-gray-300">
                    <p>{discussion.content}</p>
                  </div>

                  {discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {discussion.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-primary"
                      onClick={() => handleLikeDiscussion(discussion.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" /> {discussion.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-primary"
                      onClick={() => setActiveDiscussionId(activeDiscussionId === discussion.id ? null : discussion.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" /> {discussion.replies.length}
                    </Button>
                  </div>

                  {/* Replies */}
                  {discussion.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                      {discussion.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?text=${reply.createdBy.user.name.charAt(0)}`} />
                            <AvatarFallback>{reply.createdBy.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{reply.createdBy.user.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-primary h-6 px-2"
                                onClick={() => handleLikeReply(discussion.id, reply.id)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" /> {reply.likes}
                              </Button>
                            </div>
                            <p className="text-sm mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {activeDiscussionId === discussion.id && (
                    <div className="mt-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?text=${team.members[0].user.name.charAt(0)}`} />
                          <AvatarFallback>{team.members[0].user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => setActiveDiscussionId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(discussion.id)}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start a new discussion to collaborate with your team members on ideas, questions, and updates.
            </p>
            <Button onClick={() => setIsNewDiscussionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Start a Discussion
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  return date.toLocaleDateString()
}

