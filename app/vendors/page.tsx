"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorCard } from "@/components/vendor-card"
import { Search } from "lucide-react"

// Mock data for vendors with Kenyan Shilling prices
const vendors = [
  {
    id: 1,
    name: "Elegant Events Venue",
    type: "Venue",
    rating: 4.8,
    price: 500000,
    capacity: 200,
    location: "Nairobi, Kenya",
  },
  {
    id: 2,
    name: "Gourmet Delights Catering",
    type: "Catering",
    rating: 4.5,
    price: 250000,
    capacity: null,
    location: "Mombasa, Kenya",
  },
  {
    id: 3,
    name: "Floral Fantasy",
    type: "Decor",
    rating: 4.7,
    price: 100000,
    capacity: null,
    location: "Kisumu, Kenya",
  },
  {
    id: 4,
    name: "Sound Masters",
    type: "Entertainment",
    rating: 4.6,
    price: 150000,
    capacity: null,
    location: "Nakuru, Kenya",
  },
  {
    id: 5,
    name: "Luxe Ballroom",
    type: "Venue",
    rating: 4.9,
    price: 750000,
    capacity: 300,
    location: "Nairobi, Kenya",
  },
]

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === "all" || vendor.type === selectedType),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendors</h1>
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Venue">Venue</SelectItem>
              <SelectItem value="Catering">Catering</SelectItem>
              <SelectItem value="Decor">Decor</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  )
}

