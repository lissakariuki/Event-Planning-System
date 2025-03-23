import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" disabled>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teams
      </Button>

      {/* Team Header */}
      <div className="relative">
        <Skeleton className="h-48 w-full rounded-xl" />

        <div className="absolute -bottom-12 left-6 flex items-end">
          <Skeleton className="h-24 w-24 rounded-xl" />
          <div className="ml-4 mb-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>

        <div className="absolute bottom-4 right-6 flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Team Navigation */}
      <div className="pt-14">
        <div className="border-b">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

