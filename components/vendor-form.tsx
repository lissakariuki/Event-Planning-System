"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/hooks/use-supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VendorFormProps {
  teamId: string
  vendorId?: string
  initialData?: {
    name: string
    category: string
    contact: string
    email?: string
    phone?: string
    website?: string
    notes?: string
    price?: number
    status: "pending" | "confirmed" | "cancelled"
  }
  onVendorCreated: () => void
  onCancel: () => void
}

export function VendorForm({ teamId, vendorId, initialData, onVendorCreated, onCancel }: VendorFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [contact, setContact] = useState(initialData?.contact || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [website, setWebsite] = useState(initialData?.website || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">(initialData?.status || "pending")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !category.trim() || !contact.trim()) {
      setError("Vendor name, category, and contact are required")
      return
    }

    if (!user) {
      setError("You must be logged in to create a vendor")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Parse price to number if provided
      const priceValue = price ? Number.parseFloat(price) : null

      const vendorData = {
        team_id: teamId,
        name: name.trim(),
        category: category.trim(),
        contact: contact.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        notes: notes.trim() || null,
        price: priceValue,
        status,
      }

      if (vendorId) {
        // Update existing vendor
        const { error: updateError } = await supabase.from("vendors").update(vendorData).eq("id", vendorId)

        if (updateError) throw updateError
      } else {
        // Create new vendor
        const { error: insertError } = await supabase.from("vendors").insert({
          ...vendorData,
          created_by: user.id,
        })

        if (insertError) throw insertError
      }

      onVendorCreated()
    } catch (err: any) {
      console.error("Error saving vendor:", err)
      setError(`Failed to save vendor: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Vendor Name *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter vendor name"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category *
          </label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Catering, Photography"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact" className="block text-sm font-medium mb-1">
            Contact Person *
          </label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Enter contact person name"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">
            Website
          </label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Enter website URL"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price
          </label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            disabled={isSubmitting}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value: "pending" | "confirmed" | "cancelled") => setStatus(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter additional notes"
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (vendorId ? "Updating..." : "Creating...") : vendorId ? "Update Vendor" : "Add Vendor"}
        </Button>
      </div>
    </form>
  )
}

