import { type NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { getApps, initializeApp, cert } from "firebase-admin/app"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as any),
  })
}

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    const { userId, locationId } = await request.json()

    if (!userId || !locationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const locationExists = (userData.savedLocations || []).some((loc: { id: string }) => loc.id === locationId)

    if (!locationExists) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    await db.collection("users").doc(userId).update({
      defaultLocationId: locationId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting default location:", error)
    return NextResponse.json({ error: "Failed to set default location" }, { status: 500 })
  }
}
