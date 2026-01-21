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

async function verifyPayPalWebhook(
  body: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  signature: string,
) {
  // Skip verification in development if SKIP_WEBHOOK_VERIFICATION is set
  if (process.env.SKIP_WEBHOOK_VERIFICATION === "true") {
    console.log("⚠️ SKIPPING WEBHOOK VERIFICATION (development mode)")
    return true
  }

  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch("https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: signature,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  })

  const data = await response.json()
  console.log("Webhook verification response:", data)
  return data.verification_status === "SUCCESS"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const transmissionId = request.headers.get("paypal-transmission-id") || ""
    const transmissionTime = request.headers.get("paypal-transmission-time") || ""
    const certUrl = request.headers.get("paypal-cert-url") || ""
    const authAlgo = request.headers.get("paypal-auth-algo") || ""
    const signature = request.headers.get("paypal-transmission-sig") || ""

    console.log("🎯 WEBHOOK RECEIVED")
    console.log("Webhook headers:", {
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      signature,
      webhookIdConfigured: !!process.env.PAYPAL_WEBHOOK_ID,
    })
    console.log("Raw body:", body)

    const isValid = await verifyPayPalWebhook(body, transmissionId, transmissionTime, certUrl, authAlgo, signature)

    console.log("Webhook signature valid?", isValid)
    if (!isValid) {
      console.warn("❌ Webhook signature invalid")
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log("Webhook event type:", event.event_type)
    console.log("Webhook event resource status:", event.resource?.status)
    console.log("Webhook event custom_id:", event.resource?.custom_id)

    // Handle billing.subscription.created
    if (event.event_type === "BILLING.SUBSCRIPTION.CREATED") {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id
      console.log("✅ Handling SUBSCRIPTION.CREATED for:", customId, subscriptionId)

      if (customId) {
        await db.collection("users").doc(customId).update({
          isPremium: true, // immediately mark as premium
          paypalSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        console.log("✅ Firestore updated: isPremium true, status active")
      } else {
        console.warn("⚠️ SUBSCRIPTION.CREATED: No custom_id found")
      }
    }

    // Handle billing.subscription.activated
    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id
      console.log("✅ Handling SUBSCRIPTION.ACTIVATED for:", customId, subscriptionId)

      if (customId) {
        await db.collection("users").doc(customId).update({
          isPremium: true,
          paypalSubscriptionId: subscriptionId,
          subscriptionStatus: "ACTIVE",
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        console.log("✅ Firestore updated: isPremium true, status ACTIVE")
      } else {
        console.warn("⚠️ SUBSCRIPTION.ACTIVATED: No custom_id found")
      }
    }

    // Handle billing.subscription.updated
    if (event.event_type === "BILLING.SUBSCRIPTION.UPDATED") {
      const subscriptionId = event.resource.id
      const status = event.resource.status
      const customId = event.resource.custom_id
      console.log("✅ Handling SUBSCRIPTION.UPDATED for:", customId, subscriptionId, "status:", status)

      if (customId) {
        await db.collection("users").doc(customId).update({
          isPremium: status === "ACTIVE",
          subscriptionStatus: status,
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        console.log("✅ Firestore updated: status", status, "isPremium", status === "ACTIVE")
      } else {
        console.warn("⚠️ SUBSCRIPTION.UPDATED: No custom_id found")
      }
    }

    // Handle billing.subscription.cancelled
    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const customId = event.resource.custom_id
      console.log("✅ Handling SUBSCRIPTION.CANCELLED for:", customId)

      if (customId) {
        await db.collection("users").doc(customId).update({
          isPremium: false,
          subscriptionStatus: "CANCELLED",
          updatedAt: new Date(),
        })
        console.log("✅ Firestore updated: isPremium false, status CANCELLED")
      } else {
        console.warn("⚠️ SUBSCRIPTION.CANCELLED: No custom_id found")
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
