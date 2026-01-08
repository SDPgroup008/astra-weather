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

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64")

  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  if (!response.ok) {
    console.error("PayPal token error:", data)
    throw new Error(data.error_description || "Failed to get PayPal access token")
  }
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Missing planId or userId" },
        { status: 400 }
      )
    }

    const accessToken = await getPayPalAccessToken()

    // Create subscription using PayPal LIVE API
    const response = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "AstraWeatherz",
          locale: "en-US",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        },
      }),
    })

    const subscription = await response.json()

    if (!response.ok) {
      console.error("PayPal subscription creation error:", subscription)
      throw new Error(subscription.message || "Failed to create subscription")
    }

    // Store PayPal subscription info in Firestore
    await db.collection("users").doc(userId).update({
      paypalSubscriptionId: subscription.id,
      subscriptionStatus: "pending",
      updatedAt: new Date(),
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("PayPal subscription error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 },
    )
  }
}
