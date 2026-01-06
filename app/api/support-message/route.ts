import { type NextRequest, NextResponse } from "next/server"
import { doc, setDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { userId, message, timestamp } = await request.json()

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const messagesRef = collection(db, "support_messages")
    const messageDoc = {
      id: Date.now().toString(),
      userId,
      sender: "user",
      message,
      timestamp: new Date(timestamp),
      resolved: false,
      adminResponse: null,
    }

    await setDoc(doc(messagesRef, messageDoc.id), messageDoc)

    return NextResponse.json({ success: true, messageId: messageDoc.id }, { status: 200 })
  } catch (error) {
    console.error("Error storing message:", error)
    return NextResponse.json({ error: "Failed to store message" }, { status: 500 })
  }
}
