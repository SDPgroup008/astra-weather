import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { messageId, userId, response, adminEmail } = await request.json()

    if (!messageId || !userId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const messagesRef = collection(db, "support_messages")
    const responseDoc = {
      id: Date.now().toString(),
      userId,
      sender: "support",
      message: response,
      timestamp: new Date(),
      resolved: true,
      adminEmail,
    }

    await addDoc(messagesRef, responseDoc)

    // Mark original message as having a response
    const originalRef = doc(db, "support_messages", messageId)
    await updateDoc(originalRef, {
      hasAdminResponse: true,
      respondedAt: new Date(),
    })

    return NextResponse.json({ success: true, responseId: responseDoc.id }, { status: 200 })
  } catch (error) {
    console.error("Error storing admin response:", error)
    return NextResponse.json({ error: "Failed to store response" }, { status: 500 })
  }
}
