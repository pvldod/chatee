"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Edit, Trash2, Copy, Power } from "lucide-react"
import type { Chatbot } from "@/types/chatbot"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ChatbotCardProps {
  chatbot: Chatbot
  onDelete: (id: string) => void
}

export function ChatbotCard({ chatbot, onDelete }: ChatbotCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleStatus = async () => {
    setIsUpdating(true)
    try {
      const newStatus = chatbot.status === "active" ? "inactive" : "active"
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update chatbot status")
      }

      const updatedChatbot = await response.json()
      
      // Update the chatbot in the parent component
      onDelete(chatbot.id) // Remove old version
      router.refresh() // Refresh to get new version

      toast({
        title: "Success",
        description: `Chatbot has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chatbot status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCopyScript = () => {
    const script = `<script>
  window.CHATEE_CHATBOT_ID = "${chatbot.id}";
  window.CHATEE_PRIMARY_COLOR = "${chatbot.appearance.primaryColor}";
  window.CHATEE_TEXT_COLOR = "${chatbot.appearance.textColor}";
  window.CHATEE_WELCOME_MESSAGE = "${chatbot.welcomeMessage}";
</script>
<script src="https://cdn.chatee.io/widget.js" async></script>`

    navigator.clipboard.writeText(script)
    toast({
      title: "Success",
      description: "The script has been copied to clipboard. Paste it into your website's HTML to add the chatbot.",
    })
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete chatbot")
      }

      toast({
        title: "Success",
        description: "Chatbot has been successfully deleted.",
      })
      onDelete(chatbot.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chatbot. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "training":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{chatbot.name}</CardTitle>
              <CardDescription className="mt-1">{chatbot.description || "No description"}</CardDescription>
            </div>
            <Badge className={`${getStatusColor(chatbot.status)} text-white`}>
              {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MessageSquare size={16} />
            <span>Welcome message: {chatbot.welcomeMessage}</span>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: chatbot.appearance.primaryColor }}></div>
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: chatbot.appearance.textColor }}
            ></div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}`)}>
              <Edit size={16} className="mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyScript}>
              <Copy size={16} className="mr-1" /> Get Code
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chatbot.status === "active" ? "outline" : "default"}
              size="sm"
              onClick={handleToggleStatus}
              disabled={isUpdating}
            >
              <Power size={16} className="mr-1" />
              {isUpdating ? "Updating..." : chatbot.status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isUpdating}
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chatbot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chatbot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
