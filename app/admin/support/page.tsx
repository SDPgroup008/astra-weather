"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, addDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"

interface SupportTicket {
  id: string
  userId: string
  message: string
  timestamp: Date
  resolved: boolean
  responses: AdminResponse[]
}

interface AdminResponse {
  id: string
  adminEmail: string
  response: string
  timestamp: Date
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [responseInput, setResponseInput] = useState("")
  const [adminEmail, setAdminEmail] = useState("support@astraweather.com")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const messagesRef = collection(db, "support_messages")
      const q = query(messagesRef, orderBy("timestamp", "desc"))
      const querySnapshot = await getDocs(q)

      const ticketsMap = new Map<string, SupportTicket>()

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const userId = data.userId

        if (!ticketsMap.has(userId)) {
          ticketsMap.set(userId, {
            id: userId,
            userId,
            message: data.sender === "user" ? data.message : "",
            timestamp: data.timestamp.toDate(),
            resolved: data.resolved || false,
            responses: [],
          })
        }

        if (data.sender === "support") {
          const ticket = ticketsMap.get(userId)!
          ticket.responses.push({
            id: doc.id,
            adminEmail: data.adminEmail || "system",
            response: data.message,
            timestamp: data.timestamp.toDate(),
          })
        }
      })

      setTickets(Array.from(ticketsMap.values()))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      setLoading(false)
    }
  }

  const handleSendResponse = async () => {
    if (!selectedTicketId || !responseInput.trim()) return

    try {
      const messagesRef = collection(db, "support_messages")
      await addDoc(messagesRef, {
        id: Date.now().toString(),
        userId: selectedTicketId,
        sender: "support",
        message: responseInput,
        timestamp: new Date(),
        resolved: false,
        adminEmail,
        senderName: "Support Team",
      })

      setResponseInput("")
      fetchTickets()
    } catch (error) {
      console.error("Error sending response:", error)
    }
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId)

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto pb-8">
        <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-border/40 px-8 py-4">
          <h2 className="text-3xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage premium user support requests</p>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-6">
              <h3 className="font-bold mb-4">Tickets ({tickets.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No support tickets yet</p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedTicketId === ticket.id
                          ? "bg-primary/30 border border-primary/50"
                          : "bg-white/5 border border-white/15 hover:border-white/30"
                      }`}
                    >
                      <p className="font-semibold text-sm truncate">{ticket.userId}</p>
                      <p className="text-xs text-muted-foreground truncate">{ticket.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${ticket.resolved ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}
                        >
                          {ticket.resolved ? "Resolved" : "Open"}
                        </span>
                        {ticket.responses.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {ticket.responses.length} response{ticket.responses.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-6 space-y-4">
                <div>
                  <h3 className="font-bold mb-2">User ID: {selectedTicket.userId}</h3>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm">{selectedTicket.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedTicket.timestamp.toLocaleString()}</p>
                  </div>
                </div>

                {selectedTicket.responses.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Responses ({selectedTicket.responses.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTicket.responses.map((resp) => (
                        <div key={resp.id} className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-1">{resp.adminEmail}</p>
                          <p className="text-sm">{resp.response}</p>
                          <p className="text-xs text-muted-foreground mt-2">{resp.timestamp.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border/40 space-y-3">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                  <textarea
                    value={responseInput}
                    onChange={(e) => setResponseInput(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none"
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={!responseInput.trim()}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                  >
                    Send Response
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/15 p-12 text-center">
                <p className="text-muted-foreground">Select a ticket to view details and respond</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
