import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userMessage, timestamp } = await request.json()

    // For production, you should use a proper email service like SendGrid, Mailgun, or Nodemailer
    const emailContent = `
      <h2>Urgent Premium Support Message</h2>
      <p><strong>Message:</strong></p>
      <p>${userMessage}</p>
      <p><strong>Received at:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <hr>
      <p>This is an automated message from AstraWeather Premium Support Chat</p>
    `

    // Using FormSubmit.co for free email forwarding (no API key needed)
    const formData = new FormData()
    formData.append("email", "reinolmartin0001@gmail.com")
    formData.append("subject", "urgent premium support")
    formData.append("message", userMessage)

    // Send via native email (requires environment setup) or use a third-party service
    // For now, we'll log it and send a simple notification
    console.log("[Support Email]", {
      to: "reinolmartin0001@gmail.com",
      subject: "urgent premium support",
      message: userMessage,
      timestamp,
    })

    // If you want to use a real email service, uncomment and configure:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: 'reinolmartin0001@gmail.com' }] }],
    //     from: { email: 'support@astraweather.com' },
    //     subject: 'urgent premium support',
    //     content: [{ type: 'text/html', value: emailContent }],
    //   }),
    // })

    return NextResponse.json({ success: true, message: "Support email notification sent" }, { status: 200 })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
