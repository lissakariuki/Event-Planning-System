import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Team Access</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-center">Loading invitation details...</p>
        </CardContent>
      </Card>
    </div>
  )
}
