"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Calendar,
  CheckCircle,
  Heart,
  Share2,
  ArrowLeft,
  MessageSquare,
  Clock,
} from "lucide-react"
import { useEventContext } from "@/contexts/event-contexts"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function VendorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { vendors, addActivity } = useEventContext()

  // Find the vendor by ID
  const vendor = vendors.find((v) => v.id === Number.parseInt(params.id))

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)

  // Form states
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    guests: "1",
    notes: "",
  })

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  })

  // If vendor not found
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Vendor Not Found</h1>
        <p className="text-gray-500 mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/vendors")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
        </Button>
      </div>
    )
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price)
  }

  // Calculate average rating
  const averageRating =
    vendor.reviews && vendor.reviews.length > 0
      ? vendor.reviews.reduce((sum, review) => sum + review.rating, 0) / vendor.reviews.length
      : vendor.rating

  // Handle booking submission
  const handleBooking = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    } else {
      // Submit booking
      setIsBookingOpen(false)
      setBookingStep(1)

      addActivity(`Booked ${vendor.name} for ${bookingForm.date}`)

      toast({
        title: "Booking Confirmed",
        description: `Your booking with ${vendor.name} has been confirmed for ${bookingForm.date}.`,
      })

      // Reset form
      setBookingForm({
        date: "",
        time: "",
        guests: "1",
        notes: "",
      })
    }
  }

  // Handle contact form submission
  const handleContact = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsContactOpen(false)

    addActivity(`Contacted ${vendor.name}`)

    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${vendor.name}. They will contact you shortly.`,
    })

    // Reset form
    setContactForm({
      name: "",
      email: "",
      message: "",
    })
  }

  // Handle review submission
  const handleReview = () => {
    if (!reviewForm.comment) {
      toast({
        title: "Missing Information",
        description: "Please provide a comment for your review.",
        variant: "destructive",
      })
      return
    }

    setIsReviewOpen(false)

    addActivity(`Reviewed ${vendor.name}`)

    toast({
      title: "Review Submitted",
      description: `Your review for ${vendor.name} has been submitted. Thank you for your feedback!`,
    })

    // Reset form
    setReviewForm({
      rating: 5,
      comment: "",
    })
  }

  // Toggle favorite
  const handleFavorite = () => {
    setIsFavorite(!isFavorite)

    if (!isFavorite) {
      addActivity(`Added ${vendor.name} to favorites`)

      toast({
        title: "Added to Favorites",
        description: `${vendor.name} has been added to your favorites.`,
      })
    }
  }

  // Handle share
  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.href)

    toast({
      title: "Link Copied",
      description: "Vendor link has been copied to clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/vendors")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{vendor.name}</h1>
          {vendor.verified && (
            <Badge className="ml-2 bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" /> Verified
            </Badge>
          )}
          {vendor.featured && <Badge className="ml-2 bg-blue-500">Featured</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-hidden">
          <div className="relative aspect-video">
            {vendor.images && vendor.images.length > 0 ? (
              <img
                src={vendor.images[0] || "/placeholder.svg"}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">{vendor.name}</h2>
                <p className="text-gray-600 mb-4">{vendor.description || "No description available."}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1">{averageRating.toFixed(1)} Rating</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="ml-1">{vendor.location}</span>
                  </div>
                  {vendor.capacity && (
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="ml-1">Capacity: {vendor.capacity}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="ml-1">Price: {formatPrice(vendor.price)}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" /> Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {bookingStep === 1
                            ? "Select Date & Time"
                            : bookingStep === 2
                              ? "Event Details"
                              : "Confirm Booking"}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="py-4">
                        {/* Step indicator */}
                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs">Date & Time</span>
                            <span className="text-xs">Details</span>
                            <span className="text-xs">Confirmation</span>
                          </div>
                          <Progress value={bookingStep * 33.33} className="h-2" />
                        </div>

                        {bookingStep === 1 && (
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="booking-date">Date</Label>
                              <Input
                                id="booking-date"
                                type="date"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="booking-time">Time</Label>
                              <Input
                                id="booking-time"
                                type="time"
                                value={bookingForm.time}
                                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {bookingStep === 2 && (
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="booking-guests">Number of Guests</Label>
                              <Input
                                id="booking-guests"
                                type="number"
                                min="1"
                                value={bookingForm.guests}
                                onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="booking-notes">Special Requirements</Label>
                              <Textarea
                                id="booking-notes"
                                placeholder="Any special requirements or notes for the vendor"
                                value={bookingForm.notes}
                                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {bookingStep === 3 && (
                          <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                              <h4 className="font-medium mb-2">Booking Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Vendor:</span>
                                  <span>{vendor.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Date:</span>
                                  <span>{bookingForm.date}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Time:</span>
                                  <span>{bookingForm.time}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Guests:</span>
                                  <span>{bookingForm.guests}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-medium">
                                  <span>Total:</span>
                                  <span>{formatPrice(vendor.price)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-gray-500">
                              <p>By confirming this booking, you agree to the vendor's terms and conditions.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        {bookingStep > 1 && (
                          <Button variant="outline" onClick={() => setBookingStep(bookingStep - 1)}>
                            Back
                          </Button>
                        )}
                        <Button onClick={handleBooking}>{bookingStep === 3 ? "Confirm Booking" : "Continue"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="mr-2 h-4 w-4" /> Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {vendor.name}</DialogTitle>
                      </DialogHeader>

                      <div className="py-4 space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="contact-name">Your Name</Label>
                          <Input
                            id="contact-name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contact-email">Your Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contact-message">Message</Label>
                          <Textarea
                            id="contact-message"
                            rows={5}
                            placeholder="Type your message here..."
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContactOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleContact}>Send Message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Amenities & Services</h3>
                {vendor.amenities && vendor.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {vendor.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No amenities information available.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Reviews & Ratings</h3>
                  <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Write a Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>

                      <div className="py-4 space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="review-rating">Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="review-comment">Your Review</Label>
                          <Textarea
                            id="review-comment"
                            rows={5}
                            placeholder="Share your experience with this vendor..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleReview}>Submit Review</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {vendor.reviews && vendor.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{review.user}</div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this vendor!</p>
                    <Button size="sm" onClick={() => setIsReviewOpen(true)}>
                      Write a Review
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Pricing</h3>
            <div className="text-3xl font-bold mb-2">{formatPrice(vendor.price)}</div>
            <p className="text-sm text-gray-500 mb-4">{vendor.type === "Venue" ? "Per event" : "Starting price"}</p>

            <Button className="w-full mb-2" onClick={() => setIsBookingOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" /> Book Now
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsContactOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Contact Vendor
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              {vendor.contactInfo?.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{vendor.contactInfo.phone}</span>
                </div>
              )}
              {vendor.contactInfo?.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{vendor.contactInfo.email}</span>
                </div>
              )}
              {vendor.contactInfo?.website && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-400 mr-2" />
                  <a
                    href={
                      vendor.contactInfo.website.startsWith("http")
                        ? vendor.contactInfo.website
                        : `https://${vendor.contactInfo.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {vendor.contactInfo.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Availability</h3>
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span>Contact vendor for availability</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsContactOpen(true)}>
              Check Availability
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

