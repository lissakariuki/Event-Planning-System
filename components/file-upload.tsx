"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onUpload: (file: File) => Promise<any>
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({ onUpload, accept = "*", maxSize = 10, className = "" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        return newProgress >= 90 ? 90 : newProgress
      })
    }, 300)

    try {
      await onUpload(selectedFile)
      setUploadProgress(100)
      setSelectedFile(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
      setUploadProgress(0)
    } finally {
      clearInterval(interval)
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setError(null)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex-1 flex items-center justify-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          {selectedFile ? selectedFile.name : "Choose a file"}
        </label>

        {selectedFile && (
          <Button variant="ghost" size="icon" onClick={clearSelection} className="text-gray-500">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {selectedFile && !isUploading && (
        <Button onClick={handleUpload} className="w-full">
          Upload File
        </Button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-gray-500">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  )
}

