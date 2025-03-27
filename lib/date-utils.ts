import { format, formatDistanceToNow } from "date-fns"

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return format(date, "PPP") // e.g., "April 29, 2023"
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

/**
 * Format a date string to a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return dateString
  }
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return format(date, "PPp") // e.g., "April 29, 2023, 3:30 PM"
  } catch (error) {
    console.error("Error formatting date and time:", error)
    return dateString
  }
}

