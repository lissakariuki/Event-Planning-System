import { NextResponse } from "next/server"
import emailjs from "@emailjs/browser"

// EmailJS configuration
const SERVICE_ID = "service_3qip0f4"
const TEMPLATE_ID = "template_34mxs58"
const PUBLIC_KEY = "TtuP_lCm09hExM7On"

// Initialize EmailJS
emailjs.init(PUBLIC_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { to_email, to_name, from_name, from_email, subject, message, team_name, event_title, role } = body

    // Format current time
    const now = new Date()
    const formattedTime = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    // Prepare template parameters to match the template variables
    const templateParams = {
      name: from_name,
      time: formattedTime,
      message: message,
      to_email: to_email,
      subject: subject || "New Invite from EPS",
    }

    console.log("Sending email with params:", templateParams)

    // Send the email
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)

    console.log("Email sent successfully:", result.text)
    return NextResponse.json({ success: true, message: "Invitation sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send invitation" },
      { status: 500 },
    )
  }
}

