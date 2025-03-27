"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Loader2, ExternalLink, Phone, Mail } from "lucide-react"
import { useSupabase } from "@/hooks/use-supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VendorForm } from "./vendor-form"
import { Badge } from "@/components/ui/badge"

interface Vendor {
  id: string
  name: string
  category: string
  contact: string
  email?: string
  phone?: string
  website?: string
  notes?: string
  price?: number
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
  created_by: string
}

interface VendorListProps {
  teamId: string
}

export function VendorList({ teamId }: VendorListProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useUser()
  const { supabase } = useSupabase()

  // Load vendors for the team
  useEffect(() => {
    async function loadVendors() {
      if (!teamId) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from("vendors")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setVendors(data || [])
      } catch (err: any) {
        console.error("Error loading vendors:", err)
        setError(`Failed to load vendors: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadVendors()
  }, [teamId, supabase])

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setIsDialogOpen(true)
  }

  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return
    }

    try {
      // Optimistically update UI
      setVendors(vendors.filter((vendor) => vendor.id !== vendorId))

      // Delete from database
      const { error: deleteError } = await supabase.from("vendors").delete().eq("id", vendorId)

      if (deleteError) {
        throw deleteError
      }
    } catch (err: any) {
      console.error("Error deleting vendor:", err)

      // Reload vendors to revert optimistic update
      const { data } = await supabase
        .from("vendors")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })

      setVendors(data || [])

      setError(`Failed to delete vendor: ${err.message}`)
    }
  }

  const handleVendorUpdated = () => {
    setIsDialogOpen(false)
    setEditingVendor(null)

    // Reload vendors
    supabase
      .from("vendors")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setVendors(data)
        }
      })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {vendors.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No vendors found</p>
          <p className="text-sm text-gray-400 mt-2">Add your first vendor using the button above</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{vendor.name}</h3>
                  <Badge className={getStatusColor(vendor.status)}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">{vendor.category}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Contact:</span> {vendor.contact}
                  </p>

                  {vendor.email && (
                    <p className="text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                        {vendor.email}
                      </a>
                    </p>
                  )}

                  {vendor.phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                        {vendor.phone}
                      </a>
                    </p>
                  )}

                  {vendor.website && (
                    <p className="text-sm flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1 text-gray-500" />
                      <a
                        href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </p>
                  )}

                  {vendor.price !== null && vendor.price !== undefined && (
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> ${vendor.price.toLocaleString()}
                    </p>
                  )}
                </div>

                {vendor.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditVendor(vendor)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteVendor(vendor.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <VendorForm
              teamId={teamId}
              vendorId={editingVendor.id}
              initialData={{
                name: editingVendor.name,
                category: editingVendor.category,
                contact: editingVendor.contact,
                email: editingVendor.email,
                phone: editingVendor.phone,
                website: editingVendor.website,
                notes: editingVendor.notes,
                price: editingVendor.price,
                status: editingVendor.status,
              }}
              onVendorCreated={handleVendorUpdated}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

