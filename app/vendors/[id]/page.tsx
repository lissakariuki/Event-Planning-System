import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users, DollarSign, Phone, Mail, Globe } from "lucide-react"

// Mock data for a single vendor
const vendor = {
  id: 1,
  name: "Elegant Events Venue",
  type: "Venue",
  rating: 4.8,
  price: "$$",
  capacity: 200,
  location: "123 Main St, New York, NY 10001",
  description:
    "Elegant Events Venue is a premier event space located in the heart of New York City. With its stunning architecture and state-of-the-art facilities, it's the perfect location for weddings, corporate events, and other special occasions.",
  amenities: ["On-site catering", "AV equipment", "Parking", "Wheelchair accessible"],
  contactInfo: {
    phone: "+1 (555) 123-4567",
    email: "info@elegantevents.com",
    website: "www.elegantevents.com",
  },
}

export default function VendorProfilePage({ params }: { params: { id: string } }) {
  // In a real application, you would fetch the vendor data based on the ID
  // For this example, we're using the mock data

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{vendor.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <div className="aspect-video bg-gray-200 mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">{vendor.name}</h2>
          <p className="text-gray-600 mb-4">{vendor.description}</p>
          <div className="flex items-center mb-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1">{vendor.rating} Rating</span>
          </div>
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className="ml-1">{vendor.location}</span>
          </div>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="ml-1">Capacity: {vendor.capacity}</span>
          </div>
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <span className="ml-1">Price Range: {vendor.price}</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Amenities</h3>
          <ul className="list-disc list-inside mb-4">
            {vendor.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
          <Button className="w-full">Book Now</Button>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-2" />
              <span>{vendor.contactInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span>{vendor.contactInfo.email}</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-400 mr-2" />
              <span>{vendor.contactInfo.website}</span>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Send a Message</h3>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Type your message here..."
            ></textarea>
            <Button className="w-full mt-2">Send Message</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

