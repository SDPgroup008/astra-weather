"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Send, HeadsetIcon } from "lucide-react"

interface ChatMessage {
  id: string
  sender: "user" | "support"
  message: string
  timestamp: Date
  senderName?: string
}

export function SupportChat({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const storageKey = `chat_${userId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsedMessages = JSON.parse(saved)
      setMessages(
        parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      )
    } else {
      setMessages([
        {
          id: "1",
          sender: "support",
          message: "Hi! Welcome to AstraWeather premium support. How can we help you today?",
          timestamp: new Date(),
          senderName: "Support Team",
        },
      ])
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`chat_${userId}`, JSON.stringify(messages))
    }
  }, [messages, userId])

  useEffect(() => {
    if (!isOpen || !userId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/support-messages?userId=${userId}`)
        const data = await response.json()

        if (data.messages && data.messages.length > messages.length) {
          const newMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            timestamp: new Date(msg.timestamp),
            senderName: msg.senderName,
          }))
          setMessages(newMessages)
          setHasUnread(true)
        }
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isOpen, userId, messages.length])

  const handleSend = async () => {
    if (!input.trim() || !userId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: input,
      timestamp: new Date(),
      senderName: "You",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)

    try {
      await fetch("/api/support-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: input,
          timestamp: new Date().toISOString(),
        }),
      })

      // Send email notification to support
      await fetch("/api/support-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: input,
          userId,
          timestamp: new Date().toISOString(),
        }),
      })

      // Auto response
      setTimeout(() => {
        const supportMessage: ChatMessage = {
          id: Date.now().toString() + "sup",
          sender: "support",
          message:
            "Thanks for your message! Our support team will respond shortly. We typically respond within 5 minutes during business hours.",
          timestamp: new Date(),
          senderName: "Support Team",
        }
        setMessages((prev) => [...prev, supportMessage])
        setIsSending(false)
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsSending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setHasUnread(false)
        }}
        className="fixed bottom-20 md:bottom-8 right-8 z-40 group"
        title="Open support chat"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">
          <HeadsetIcon className="w-6 h-6" />
          {hasUnread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
        </div>
      </button>
    )
  }

  return (
    <Card className="fixed bottom-20 md:bottom-8 right-8 z-40 w-96 max-w-[calc(100vw-2rem)] bg-background border-white/15 shadow-2xl shadow-primary/20 flex flex-col max-h-96 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm md:text-base">Premium Support</h3>
            <p className="text-xs opacity-90">Response time: ~5 min</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs">
              {msg.sender === "support" && (
                <p className="text-xs text-muted-foreground mb-1 px-3">{msg.senderName || "Support"}</p>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-primary/30 border border-primary/50 text-foreground rounded-br-none"
                    : "bg-muted/50 border border-border text-muted-foreground rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-3">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/40 p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type your message..."
          disabled={isSending}
          className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none disabled:opacity-50"
        />
        <Button
          disabled={isSending || !input.trim()}
          onClick={handleSend}
          size="sm"
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
