import { NextResponse } from "next/server"
import emailjs from "@emailjs/nodejs"

// Initialize EmailJS with your credentials
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { to_email, to_name, from_name, from_email, subject, message, team_name, event_title, role } = body

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email,
      to_name: to_name || to_email,
      from_name,
      from_email,
      subject: subject || `Invitation to join ${team_name || "Event Planning Team"}`,
      message,
      team_name: team_name || "Event Planning Team",
      event_title: event_title || "",
      role: role || "",
      year: new Date().getFullYear(),
    }

    // Check if we're in development mode
    if (process.env.NODE_ENV === "development" && process.env.SKIP_EMAIL_SENDING === "true") {
      // Log the email details but don't actually send
      console.log("Development mode: Email would be sent with these details:", {
        to: to_email,
        subject: templateParams.subject,
        from: `${from_name} <${from_email}>`,
      })

      return NextResponse.json({
        success: true,
        message: `Email would be sent to ${to_email} in production environment`,
      })
    }

    // Send the email using EmailJS
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      templateParams,
    )

    console.log("Email sent:", response.status, response.text)

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      status: response.status,
      text: response.text,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send invitation" },
      { status: 500 },
    )
  }
}

