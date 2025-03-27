"use client"

import { useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  saveDocumentMetadata,
  getDocuments,
  deleteDocumentMetadata,
} from "@/lib/storage-utils"

export interface Document {
  id: string
  name: string
  filePath: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  url: string
}

export function useDocuments(teamId: string, eventId?: string) {
  const { user } = useUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!teamId) return

    setIsLoading(true)
    setError(null)

    try {
      const { documents, error } = await getDocuments(teamId, eventId)

      if (error) {
        throw error
      }

      // Transform and add URLs
      const docsWithUrls = documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        filePath: doc.file_path,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        uploadedBy: doc.uploaded_by,
        uploadedAt: doc.uploaded_at,
        url: getFileUrl(doc.file_path),
      }))

      setDocuments(docsWithUrls)
    } catch (err) {
      console.error("Error loading documents:", err)
      setError("Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }, [teamId, eventId])

  // Upload a document
  const uploadDocument = useCallback(
    async (file: File) => {
      if (!teamId || !user) {
        setError("Missing team ID or user")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        // Upload file to storage
        const { path, error: uploadError } = await uploadFile(file, teamId, eventId, user.id)

        if (uploadError) {
          throw uploadError
        }

        // Save metadata to database
        const { id, error: metadataError } = await saveDocumentMetadata(
          teamId,
          path,
          file.name,
          file.type,
          file.size,
          user.id,
          eventId,
        )

        if (metadataError) {
          throw metadataError
        }

        // Add to local state
        const newDoc: Document = {
          id,
          name: file.name,
          filePath: path,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          url: getFileUrl(path),
        }

        setDocuments((prev) => [...prev, newDoc])
        return newDoc
      } catch (err: any) {
        console.error("Error uploading document:", err)
        setError(`Failed to upload document: ${err.message}`)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [teamId, eventId, user],
  )

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string, filePath: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Delete file from storage
      const { error: deleteFileError } = await deleteFile(filePath)

      if (deleteFileError) {
        throw deleteFileError
      }

      // Delete metadata from database
      const { error: deleteMetadataError } = await deleteDocumentMetadata(documentId)

      if (deleteMetadataError) {
        throw deleteMetadataError
      }

      // Update local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      return true
    } catch (err: any) {
      console.error("Error deleting document:", err)
      setError(`Failed to delete document: ${err.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
  }
}

