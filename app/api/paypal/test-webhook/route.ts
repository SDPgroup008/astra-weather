import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { getApps, initializeApp, cert } from "firebase-admin/app"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as any),
  })
}

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    // Simulate webhook event
    console.log("🧪 TEST WEBHOOK - Updating user:", userId)

    await db.collection("users").doc(userId).update({
      isPremium: true,
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    })

    console.log("✅ TEST WEBHOOK - User updated successfully")

    return NextResponse.json({ 
      success: true, 
      message: "Test webhook processed successfully",
      userId 
    })
  } catch (error) {
    console.error("❌ Test webhook error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test webhook failed" },
      { status: 500 },
    )
  }
}
