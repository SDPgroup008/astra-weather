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
    const { userId, locationId } = await request.json()

    if (!userId || !locationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedLocations = (userData.savedLocations || []).filter((loc: { id: string }) => loc.id !== locationId)

    const updateData: any = {
      savedLocations: updatedLocations,
    }

    // If deleted location was default, set a new default
    if (userData.defaultLocationId === locationId && updatedLocations.length > 0) {
      updateData.defaultLocationId = updatedLocations[0].id
    } else if (updatedLocations.length === 0) {
      updateData.defaultLocationId = null
    }

    await db.collection("users").doc(userId).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
