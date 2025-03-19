"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users, DollarSign, CheckCircle, Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useEventContext } from "@/contexts/event-contexts"

interface VendorCardProps {
  vendor: {
    id: number
    name: string
    type: string
    rating: number
    price: number
    capacity: number | null
    location: string
    verified: boolean
    featured?: boolean
    images?: string[]
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  const { addActivity } = useEventContext()
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)

    if (!isFavorite) {
      addActivity(`Added ${vendor.name} to favorites`)
    }
  }

  return (
    <Link href={`/vendors/${vendor.id}`}>
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
        <div className="relative">
          <div className="aspect-video bg-gray-200">
            {vendor.images && vendor.images.length > 0 && (
              <img
                src={vendor.images[0] || "/placeholder.svg"}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            onClick={handleFavorite}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
          </Button>
          {vendor.featured && <Badge className="absolute top-2 left-2 bg-blue-500">Featured</Badge>}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{vendor.name}</h3>
            {vendor.verified && (
              <div className="flex items-center text-green-500" title="Verified Vendor">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
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
    </Link>
  )
}

