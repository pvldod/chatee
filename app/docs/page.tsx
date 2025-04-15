"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Book, Code, Palette, Settings } from "lucide-react"

interface Section {
  title: string
  content: React.ReactNode
}

interface Sections {
  [key: string]: Section
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("getting-started")

  const sections: Sections = {
    "getting-started": {
      title: "Getting Started",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Getting Started with Chatee</h2>
          <p>Welcome to Chatee documentation! Here you'll learn how to start using our chatbot.</p>
          
          <h3 className="text-xl font-semibold mt-6">Quick Start</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your account</li>
            <li>Create a new chatbot by clicking the "Create New Chatbot" button</li>
            <li>Set up basic information like name and welcome message</li>
            <li>Customize the chatbot's appearance to match your needs</li>
            <li>Insert the installation code into your website</li>
          </ol>
        </div>
      ),
    },
    "integration": {
      title: "Integration",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Chatbot Integration</h2>
          <p>Learn how to integrate the chatbot into your website.</p>
          
          <h3 className="text-xl font-semibold mt-6">Installation Code</h3>
          <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto">
            {`<script>
  (function(c,h,a,t,e,e_,i,o) {
    c[e]=c[e]||function(){(c[e].q=c[e].q||[]).push(arguments)};
    o=h.createElement(a),i=h.getElementsByTagName(a)[0];
    o.async=1;o.src=t;i.parentNode.insertBefore(o,i)
  })(window,document,'script','https://cdn.chatee.io/widget.js','chatee');
  
  chatee('init', 'YOUR_CHATBOT_ID');
</script>`}
          </pre>
        </div>
      ),
    },
    "appearance": {
      title: "Appearance",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Appearance Customization</h2>
          <p>Learn how to customize the chatbot's appearance to match your brand.</p>
          
          <h3 className="text-xl font-semibold mt-6">Available Options</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Primary Color - used for buttons and user messages</li>
            <li>Text Color - used for chatbot messages and UI elements</li>
            <li>Font - choose from several preset fonts</li>
            <li>Logo - option to add your custom logo to the chat header</li>
          </ul>
        </div>
      ),
    },
    "settings": {
      title: "Settings",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Chatbot Settings</h2>
          <p>Explore all the configuration options for your chatbot.</p>
          
          <h3 className="text-xl font-semibold mt-6">Available Features</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Enable Attachments - allow users to upload files</li>
            <li>Conversation History - store and display chat history</li>
            <li>Feedback - allow users to rate responses</li>
            <li>Transcripts - option to export conversations</li>
          </ul>
        </div>
      ),
    },
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-400">Documentation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold mb-4">Documentation</h1>
            {Object.entries(sections).map(([key, section]) => (
              <Button
                key={key}
                variant={activeSection === key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(key)}
              >
                {key === "getting-started" && <Book className="h-4 w-4 mr-2" />}
                {key === "integration" && <Code className="h-4 w-4 mr-2" />}
                {key === "appearance" && <Palette className="h-4 w-4 mr-2" />}
                {key === "settings" && <Settings className="h-4 w-4 mr-2" />}
                {section.title}
              </Button>
            ))}
          </div>

          <div className="md:col-span-3 bg-zinc-900 rounded-lg p-6">
            {sections[activeSection].content}
          </div>
        </div>
      </div>
    </div>
  )
} 