import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users, DollarSign } from "lucide-react"

interface VendorCardProps {
  vendor: {
    id: number
    name: string
    type: string
    rating: number
    price: number
    capacity: number | null
    location: string
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price)
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{vendor.name}</h3>
        <p className="text-sm text-gray-500">{vendor.type}</p>
        <div className="flex items-center mt-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm">{vendor.rating}</span>
        </div>
        <div className="flex items-center mt-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="ml-1 text-sm">{vendor.location}</span>
        </div>
        {vendor.capacity && (
          <div className="flex items-center mt-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="ml-1 text-sm">Capacity: {vendor.capacity}</span>
          </div>
        )}
        <div className="flex items-center mt-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="ml-1 text-sm">{formatPrice(vendor.price)}</span>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" className="w-full mr-2">
            View Profile
          </Button>
          <Button className="w-full ml-2">Book Now</Button>
        </div>
      </div>
    </Card>
  )
}
