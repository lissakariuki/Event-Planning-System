"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Clipboard, X } from "lucide-react"

interface ImageUrlInputProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  previewHeight?: number
  previewWidth?: number
  previewClassName?: string
}

export function ImageUrlInput({
  label,
  id,
  value,
  onChange,
  placeholder = "https://example.com/image.png",
  previewHeight = 100,
  previewWidth = 100,
  previewClassName = "",
}: ImageUrlInputProps) {
  const [error, setError] = useState<string | null>(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (
        text.startsWith("http") &&
        (text.includes(".jpg") ||
          text.includes(".png") ||
          text.includes(".jpeg") ||
          text.includes(".gif") ||
          text.includes(".webp"))
      ) {
        onChange(text)
        setError(null)
      } else {
        setError("Clipboard content doesn't appear to be an image URL")
      }
    } catch (err) {
      setError("Failed to read clipboard. Please paste the URL manually.")
    }
  }

  const handleClear = () => {
    onChange("")
    setError(null)
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setError(null)
            }}
            className={error ? "border-red-500 pr-10" : "pr-10"}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button type="button" variant="outline" onClick={handlePaste} title="Paste from clipboard">
          <Clipboard size={16} />
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {value && !error && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Preview:</p>
          <div
            className={`relative overflow-hidden border rounded-md ${previewClassName}`}
            style={{ height: previewHeight, width: previewWidth }}
          >
            <Image
              src={value || "/placeholder.svg"}
              alt="Image preview"
              fill
              className="object-cover"
              onError={() => {
                setError("Failed to load image. Please check the URL.")
                onChange("")
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

