"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { Chatbot } from "@/types/chatbot"
import { Button } from "@/components/ui/button"
import { ChatbotCard } from "@/components/dashboard/chatbot-card"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchChatbots()
    }
  }, [user])

  // Refresh chatbots when component is focused
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchChatbots()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [user])

  const fetchChatbots = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/chatbots")
      const data = await response.json()
      
      if (!response.ok) {
        console.error("Failed to fetch chatbots:", data)
        throw new Error(data.message || "Failed to fetch chatbots")
      }
      
      setChatbots(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading chatbots:", error)
      toast({
        title: "Error",
        description: "Failed to load chatbots. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChatbot = (id: string) => {
    setChatbots((prev) => prev.filter((chatbot) => chatbot.id !== id))
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Chatbots</h1>
        <Button onClick={() => router.push("/dashboard/chatbots/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create New Chatbot
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : chatbots.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No chatbots yet</h2>
          <p className="text-gray-400 mb-6">Create your first AI chatbot to start helping your customers.</p>
          <Button onClick={() => router.push("/dashboard/chatbots/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create New Chatbot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <ChatbotCard key={chatbot.id} chatbot={chatbot} onDelete={handleDeleteChatbot} />
          ))}
        </div>
      )}
    </div>
  )
}
