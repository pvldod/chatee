"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Chatbot } from "@/types/chatbot"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function DemoPage() {
  const searchParams = useSearchParams()
  const chatbotId = searchParams.get("chatbotId")
  const { toast } = useToast()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (chatbotId) {
      fetchChatbot()
    } else {
      setIsLoading(false)
    }
  }, [chatbotId])

  useEffect(() => {
    if (chatbot) {
      console.log("Initializing widget with chatbot:", chatbot)
      // Add the widget script
      const script = document.createElement("script")
      script.innerHTML = `
        window.CHATEE_CHATBOT_ID = "${chatbot.id}";
        window.CHATEE_PRIMARY_COLOR = "${chatbot.appearance.primaryColor}";
        window.CHATEE_TEXT_COLOR = "${chatbot.appearance.textColor}";
        window.CHATEE_WELCOME_MESSAGE = "${chatbot.welcomeMessage}";
      `
      document.head.appendChild(script)

      const widgetScript = document.createElement("script")
      widgetScript.src = "/widget.js"
      widgetScript.async = true
      widgetScript.onload = () => {
        console.log("Widget script loaded successfully")
      }
      widgetScript.onerror = (error) => {
        console.error("Failed to load widget script:", error)
      }
      document.body.appendChild(widgetScript)

      return () => {
        document.head.removeChild(script)
        if (widgetScript.parentNode) {
          widgetScript.parentNode.removeChild(widgetScript)
        }
      }
    }
  }, [chatbot])

  const fetchChatbot = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch chatbot")
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch chatbot")
      }
      setChatbot(data.chatbot)
    } catch (error) {
      console.error("Error fetching chatbot:", error)
      toast({
        title: "Error",
        description: "Failed to load chatbot data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{chatbot ? `${chatbot.name} Demo` : "Chatbot Demo"}</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !chatbotId ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-semibold mb-4">No Chatbot Selected</h2>
              <p className="text-gray-400">Please select a chatbot to view the demo.</p>
            </div>
          ) : !chatbot ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-semibold mb-4">Chatbot Not Found</h2>
              <p className="text-gray-400">
                The chatbot you're looking for doesn't exist or you don't have access to it.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-semibold mb-4">Try The Chat Widget</h2>
              <p className="text-gray-400 mb-6">
                This is a demonstration of how the chat widget would appear on your website. Click the chat button in
                the bottom right corner to open the widget.
              </p>

              <div className="bg-zinc-950 p-8 rounded-lg relative min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  This is your website content. The chat widget is in the bottom right corner.
                </p>
              </div>
            </div>
          )}

          {chatbot && (
            <>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <div className="space-y-6 text-gray-300">
                <p>This demo shows how your AI chatbot will appear on your website. Here's how to implement it:</p>

                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Copy the code</strong> from your dashboard and add it to your website's HTML.
                  </li>
                  <li>
                    <strong>Customize the appearance</strong> to match your brand through the dashboard.
                  </li>
                  <li>
                    <strong>Train your bot</strong> by adding your documentation, FAQs, or knowledge base.
                  </li>
                  <li>
                    <strong>Go live</strong> and let your AI chatbot assist your customers 24/7.
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
