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

async function verifyPayPalWebhook(
  body: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  signature: string,
) {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch("https://api.paypal.com/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: "SHA256withRSA",
      transmission_sig: signature,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  })

  const data = await response.json()
  return data.verification_status === "SUCCESS"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const transmissionId = request.headers.get("paypal-transmission-id") || ""
    const transmissionTime = request.headers.get("paypal-transmission-time") || ""
    const certUrl = request.headers.get("paypal-cert-url") || ""
    const signature = request.headers.get("paypal-auth-algo") || ""

    const isValid = await verifyPayPalWebhook(body, transmissionId, transmissionTime, certUrl, signature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle billing.subscription.created
    if (event.event_type === "BILLING.SUBSCRIPTION.CREATED") {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id

      if (customId) {
        await db
          .collection("users")
          .doc(customId)
          .update({
            isPremium: true,
            paypalSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
            subscriptionStart: new Date(),
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            updatedAt: new Date(),
          })
      }
    }

    // Handle billing.subscription.updated
    if (event.event_type === "BILLING.SUBSCRIPTION.UPDATED") {
      const subscriptionId = event.resource.id
      const status = event.resource.status
      const customId = event.resource.custom_id

      if (customId) {
        await db
          .collection("users")
          .doc(customId)
          .update({
            isPremium: status === "ACTIVE",
            subscriptionStatus: status,
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          })
      }
    }

    // Handle billing.subscription.cancelled
    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const customId = event.resource.custom_id

      if (customId) {
        await db.collection("users").doc(customId).update({
          isPremium: false,
          subscriptionStatus: "CANCELLED",
          updatedAt: new Date(),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
