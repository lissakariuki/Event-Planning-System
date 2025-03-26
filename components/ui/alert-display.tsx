import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AlertDisplayProps {
  message: string | null
  variant?: "default" | "destructive"
}

export function AlertDisplay({ message, variant = "destructive" }: AlertDisplayProps) {
  if (!message) return null

  return (
    <Alert variant={variant} className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

