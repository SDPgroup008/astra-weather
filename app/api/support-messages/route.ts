import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const messagesRef = collection(db, "support_messages")
    const q = query(messagesRef, where("userId", "==", userId), orderBy("timestamp", "asc"))
    const querySnapshot = await getDocs(q)

    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: data.id,
        sender: data.sender,
        message: data.message,
        timestamp: data.timestamp.toISOString(),
        senderName: data.sender === "user" ? "You" : "Support Team",
      }
    })

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
