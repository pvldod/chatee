"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, X, Minimize2, Maximize2 } from "lucide-react"

export default function WidgetDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([{ role: "system", content: "Hi there! How can I help you today?" }])
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: inputValue }])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Thanks for your message! This is a demo response. In the real implementation, this would be powered by your AI model trained on your documentation.",
        },
      ])
    }, 1000)

    setInputValue("")
  }

  return (
    <div className="relative">
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#d0ff00] text-black rounded-full p-4 shadow-lg hover:bg-opacity-90 transition z-50"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-zinc-900 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-300 ease-in-out ${
            isMinimized ? "w-64 h-12" : "w-80 sm:w-96 h-[500px]"
          }`}
        >
          {/* Header */}
          <div className="bg-zinc-800 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#d0ff00] rounded-full flex items-center justify-center text-black mr-2">
                <MessageSquare size={16} />
              </div>
              <span className="font-medium">Support Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white transition"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <>
              <div className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" ? "bg-[#d0ff00] text-black" : "bg-zinc-800 text-white"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-900">
                <div className="flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-zinc-800 border border-zinc-700 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#d0ff00]"
                  />
                  <button
                    type="submit"
                    className="bg-[#d0ff00] text-black px-4 py-2 rounded-r-lg hover:bg-opacity-90 transition"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
