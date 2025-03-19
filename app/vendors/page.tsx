"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorCard } from "@/components/vendor-card"
import { Search, Plus, Filter, SlidersHorizontal, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEventContext } from "@/contexts/event-contexts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function VendorsPage() {
  const { vendors, setVendors, addActivity } = useEventContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [isVerifyVendorOpen, setIsVerifyVendorOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<(typeof vendors)[0] | null>(null)
  const [sortOption, setSortOption] = useState("rating")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: "",
    type: "Venue",
    price: "",
    capacity: "",
    location: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    contactWebsite: "",
    amenities: "",
  })

  // Filter and sort vendors
  const filteredVendors = vendors
    .filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || vendor.type === selectedType
      const matchesVerification = !showVerifiedOnly || vendor.verified
      const matchesPrice = vendor.price >= priceRange[0] && vendor.price <= priceRange[1]

      return matchesSearch && matchesType && matchesVerification && matchesPrice
    })
    .sort((a, b) => {
      if (sortOption === "rating") return b.rating - a.rating
      if (sortOption === "price_low") return a.price - b.price
      if (sortOption === "price_high") return b.price - a.price
      return 0
    })

  // Handle adding a new vendor
  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.type || !newVendor.price || !newVendor.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(0, ...vendors.map((v) => v.id)) + 1
    const amenitiesArray = newVendor.amenities
      ? newVendor.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    const vendorToAdd = {
      id: newId,
      name: newVendor.name,
      type: newVendor.type,
      rating: 0,
      price: Number(newVendor.price),
      capacity: newVendor.capacity ? Number(newVendor.capacity) : null,
      location: newVendor.location,
      verified: false,
      description: newVendor.description,
      contactInfo: {
        phone: newVendor.contactPhone,
        email: newVendor.contactEmail,
        website: newVendor.contactWebsite,
      },
      amenities: amenitiesArray,
      images: ["/placeholder.svg?height=400&width=600"],
    }

    setVendors([...vendors, vendorToAdd])
    setIsAddVendorOpen(false)

    // Reset form
    setNewVendor({
      name: "",
      type: "Venue",
      price: "",
      capacity: "",
      location: "",
      description: "",
      contactPhone: "",
      contactEmail: "",
      contactWebsite: "",
      amenities: "",
    })

    addActivity(`New vendor registered: ${newVendor.name}`)

    toast({
      title: "Vendor Registered",
      description: "The vendor has been registered and is pending verification.",
    })
  }

  // Handle verifying a vendor
  const handleVerifyVendor = () => {
    if (!selectedVendor) return

    const updatedVendors = vendors.map((vendor) =>
      vendor.id === selectedVendor.id ? { ...vendor, verified: true } : vendor,
    )

    setVendors(updatedVendors)
    setIsVerifyVendorOpen(false)
    setSelectedVendor(null)

    addActivity(`Vendor verified: ${selectedVendor.name}`)

    toast({
      title: "Vendor Verified",
      description: `${selectedVendor.name} has been verified and is now available to all users.`,
    })
  }

  // Open verify dialog
  const openVerifyDialog = (vendor: (typeof vendors)[0]) => {
    setSelectedVendor(vendor)
    setIsVerifyVendorOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <div className="flex gap-2">
          <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Register Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Vendor</DialogTitle>
                <DialogDescription>
                  Add a new vendor to the system. They will need to be verified before being visible to all users.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendor-name">
                        Vendor Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="vendor-name"
                        value={newVendor.name}
                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vendor-type">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newVendor.type}
                        onValueChange={(value) => setNewVendor({ ...newVendor, type: value })}
                      >
                        <SelectTrigger id="vendor-type">
                          <SelectValue placeholder="Select vendor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Venue">Venue</SelectItem>
                          <SelectItem value="Catering">Catering</SelectItem>
                          <SelectItem value="Decor">Decor</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Photography">Photography</SelectItem>
                          <SelectItem value="Transportation">Transportation</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendor-price">
                        Price (KES) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="vendor-price"
                        type="number"
                        value={newVendor.price}
                        onChange={(e) => setNewVendor({ ...newVendor, price: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vendor-capacity">Capacity (if applicable)</Label>
                      <Input
                        id="vendor-capacity"
                        type="number"
                        value={newVendor.capacity}
                        onChange={(e) => setNewVendor({ ...newVendor, capacity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vendor-location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendor-location"
                      value={newVendor.location}
                      onChange={(e) => setNewVendor({ ...newVendor, location: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vendor-email">Email Address</Label>
                    <Input
                      id="vendor-email"
                      type="email"
                      value={newVendor.contactEmail}
                      onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vendor-phone">Phone Number</Label>
                    <Input
                      id="vendor-phone"
                      value={newVendor.contactPhone}
                      onChange={(e) => setNewVendor({ ...newVendor, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vendor-website">Website</Label>
                    <Input
                      id="vendor-website"
                      value={newVendor.contactWebsite}
                      onChange={(e) => setNewVendor({ ...newVendor, contactWebsite: e.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vendor-description">Description</Label>
                    <Textarea
                      id="vendor-description"
                      value={newVendor.description}
                      onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vendor-amenities">Amenities (comma separated)</Label>
                    <Textarea
                      id="vendor-amenities"
                      value={newVendor.amenities}
                      onChange={(e) => setNewVendor({ ...newVendor, amenities: e.target.value })}
                      placeholder="e.g. Parking, WiFi, Catering, etc."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddVendor}>Register Vendor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Advanced Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Vendors</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified-only">Show Verified Vendors Only</Label>
                  <Switch id="verified-only" checked={showVerifiedOnly} onCheckedChange={setShowVerifiedOnly} />
                </div>

                <div className="grid gap-2">
                  <Label>Price Range (KES)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      placeholder="Min"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger id="sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerifiedOnly(false)
                    setPriceRange([0, 1000000])
                    setSortOption("rating")
                  }}
                >
                  Reset Filters
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
              <SelectItem value="Photography">Photography</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Verification section for admin */}
      <Card className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-blue-500" />
          Vendor Verification
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The following vendors are pending verification. Review their details and verify them to make them available to
          all users.
        </p>

        {vendors.filter((v) => !v.verified).length === 0 ? (
          <p className="text-sm text-gray-500 italic">No vendors pending verification</p>
        ) : (
          <div className="space-y-3">
            {vendors
              .filter((v) => !v.verified)
              .map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                >
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-500">
                      {vendor.type} • {vendor.location}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => openVerifyDialog(vendor)}>
                    Verify
                  </Button>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Vendor listings */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {filteredVendors.length} {filteredVendors.length === 1 ? "Vendor" : "Vendors"} Found
          </h2>
          <div className="flex items-center gap-2">
            <Badge
              variant={showVerifiedOnly ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            >
              <CheckCircle className="mr-1 h-3 w-3" /> Verified Only
            </Badge>
            <Badge
              variant={sortOption === "rating" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSortOption("rating")}
            >
              <Star className="mr-1 h-3 w-3" /> Top Rated
            </Badge>
          </div>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedType("all")
                setShowVerifiedOnly(false)
                setPriceRange([0, 1000000])
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>

      {/* Verify Vendor Dialog */}
      <Dialog open={isVerifyVendorOpen} onOpenChange={setIsVerifyVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Vendor</DialogTitle>
            <DialogDescription>
              Verifying a vendor will make them visible to all users and mark them as trusted.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="py-4">
              <div className="space-y-2 mb-4">
                <h3 className="font-medium">{selectedVendor.name}</h3>
                <div className="text-sm text-gray-500">
                  {selectedVendor.type} • {selectedVendor.location}
                </div>
                <div className="text-sm">
                  Price:{" "}
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(selectedVendor.price)}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="text-sm space-y-1">
                  {selectedVendor.contactInfo?.email && <div>Email: {selectedVendor.contactInfo.email}</div>}
                  {selectedVendor.contactInfo?.phone && <div>Phone: {selectedVendor.contactInfo.phone}</div>}
                  {selectedVendor.contactInfo?.website && <div>Website: {selectedVendor.contactInfo.website}</div>}
                </div>
              </div>

              {selectedVendor.description && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedVendor.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyVendorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyVendor}>Verify Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

