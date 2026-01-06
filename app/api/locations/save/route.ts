import { type NextRequest, NextResponse } from "next/server"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
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
    const { userId, name, latitude, longitude } = await request.json()

    if (!userId || !name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const locationId = `${Date.now()}`
    const newLocation = {
      id: locationId,
      name,
      latitude,
      longitude,
      isDefault: false,
      createdAt: new Date(),
    }

    // Use set with merge to avoid errors if the doc doesn't exist
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          savedLocations: FieldValue.arrayUnion(newLocation),
        },
        { merge: true }
      )

    return NextResponse.json(newLocation)
  } catch (error: any) {
    console.error("Error saving location:", error)
    return NextResponse.json({ error: error.message || "Failed to save location" }, { status: 500 })
  }
}
