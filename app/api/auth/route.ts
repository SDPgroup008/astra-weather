import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { initializeApp, getApps, cert } from "firebase-admin/app"

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}

if (!getApps().length) {
  initializeApp({
    credential: cert(firebaseAdminConfig as any),
  })
}

const auth = getAuth()
const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    const { action, idToken, userId } = await request.json()

    if (action === "verify") {
      const decodedToken = await auth.verifyIdToken(idToken)
      return NextResponse.json({ verified: true, uid: decodedToken.uid })
    }

    if (action === "getUserData") {
      const userDoc = await db.collection("users").doc(userId).get()
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json(userDoc.data())
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json({ error: "Auth error" }, { status: 500 })
  }
}
