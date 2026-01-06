export function initializePayPalScript() {
  if (typeof document === "undefined") return

  // Check if script already exists
  if (document.querySelector('script[src*="paypal"]')) {
    return
  }

  const script = document.createElement("script")
  script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&intent=subscription&vault=true`
  script.async = true
  script.defer = true
  document.body.appendChild(script)
}

export async function createPayPalSubscription(planId: string, userId: string) {
  const response = await fetch("/api/paypal/create-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId, userId }),
  })

  if (!response.ok) {
    throw new Error("Failed to create PayPal subscription")
  }

  return response.json()
}
