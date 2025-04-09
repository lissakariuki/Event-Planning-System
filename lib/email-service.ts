import emailjs from "@emailjs/browser"

// EmailJS configuration
const SERVICE_ID = "service_7wig8aa"
const TEMPLATE_ID = "template_s1ggkhq"
const PUBLIC_KEY = "TtuP_lCm09hExM7On"

// Initialize EmailJS
emailjs.init(PUBLIC_KEY)

interface EmailParams {
  to_email: string
  to_name?: string
  from_name: string
  from_email: string
  subject?: string
  message: string
  team_name?: string
  event_title?: string
  role?: string
  team_id?: string
}

/**
 * Send an email invitation using EmailJS
 */
export async function sendInvitationEmail({
  to_email,
  from_name,
  from_email,
  subject,
  message,
  team_name,
  role,
  team_id,
}: {
  to_email: string
  to_name?: string
  from_name: string
  from_email: string
  subject?: string
  message: string
  team_name: string
  role: string
  team_id: string
}): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure the from_name and from_email are not overridden here
    console.log("Sending Email From:", from_name, from_email)

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

    // Generate the team-specific invitation link using the dedicated invitation route
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invitations/${team_id}?email=${encodeURIComponent(to_email)}`

    // Prepare template parameters to match the template variables
    const templateParams = {
      name: from_name,
      email: from_email,
      time: formattedTime,
      message: message,
      to_email: to_email,
      subject: subject || "New Invite from EPS",
      team_name: team_name || "",
      role: role || "",
      invited_by: from_email,
      invitation_link: invitationLink,
    }

    console.log("Sending email with params:", templateParams)

    // Send the email
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)

    console.log("Email sent successfully:", result.text)
    return { success: true, message: "Invitation sent successfully" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: error instanceof Error ? error.message : "Failed to send invitation" }
  }
}
