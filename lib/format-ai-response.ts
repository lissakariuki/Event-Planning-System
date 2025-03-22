/**
 * Formats AI responses to improve readability and clarity
 * - Adds proper spacing between paragraphs
 * - Formats lists with proper bullets
 * - Highlights important information
 * - Structures numbered points
 */
export function formatAIResponse(text: string): string {
    if (!text) return text
  
    let formattedText = text
  
    // Replace multiple consecutive newlines with just two newlines
    formattedText = formattedText.replace(/\n{3,}/g, "\n\n")
  
    // Format numbered lists (e.g., "1. Item" or "1) Item")
    formattedText = formattedText.replace(/(\d+[.)]) ([^\n]+)/g, "<strong>$1</strong> $2")
  
    // Format bullet points
    formattedText = formattedText.replace(/\n\s*[-•*]\s+([^\n]+)/g, "\n• $1")
  
    // Highlight section headers (text followed by colon)
    formattedText = formattedText.replace(/([A-Z][^:]+):/g, "<strong>$1:</strong>")
  
    // Add paragraph spacing
    formattedText = formattedText.replace(/\n\n/g, "</p><p>")
    formattedText = `<p>${formattedText}</p>`
    formattedText = formattedText.replace(/<p><\/p>/g, "")
  
    // Format questions to stand out
    formattedText = formattedText.replace(/\?([^\w]|$)/g, "?</em>$1")
    formattedText = formattedText.replace(/([^\w]|^)([^.!?]+\?)/g, "$1<em>$2")
  
    return formattedText
  }
  
  /**
   * Categorizes the response content to provide context
   * Returns an object with the message and its context/category
   */
  export function categorizeResponse(text: string): {
    message: string
    context?: string
  } {
    // Detect what type of response this is
    const lowerText = text.toLowerCase()
  
    if (lowerText.includes("wedding") && (lowerText.includes("plan") || lowerText.includes("organiz"))) {
      return { message: text, context: "Wedding Planning" }
    }
  
    if (lowerText.includes("budget") && lowerText.includes("event")) {
      return { message: text, context: "Budget Management" }
    }
  
    if (lowerText.includes("venue") || lowerText.includes("location")) {
      return { message: text, context: "Venue Selection" }
    }
  
    if (lowerText.includes("guest") && lowerText.includes("list")) {
      return { message: text, context: "Guest Management" }
    }
  
    if (lowerText.includes("vendor") || lowerText.includes("catering") || lowerText.includes("photographer")) {
      return { message: text, context: "Vendor Management" }
    }
  
    // Default case - no specific context detected
    return { message: text }
  }
  
  