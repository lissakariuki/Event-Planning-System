"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { useDocuments, type Document } from "@/hooks/use-documents"
import { FileText, FileImage, FileArchive, File, Download, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DocumentListProps {
  teamId: string
  eventId?: string
}

export function DocumentList({ teamId, eventId }: DocumentListProps) {
  const { documents, isLoading, error, loadDocuments, uploadDocument, deleteDocument } = useDocuments(teamId, eventId)

  useEffect(() => {
    if (teamId) {
      loadDocuments()
    }
  }, [teamId, loadDocuments])

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <FileImage className="h-8 w-8 text-blue-500" />
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />
    } else if (fileType.includes("zip") || fileType.includes("rar")) {
      return <FileArchive className="h-8 w-8 text-yellow-500" />
    } else {
      return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDownload = (document: Document) => {
    window.open(document.url, "_blank")
  }

  const handleDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
      await deleteDocument(document.id, document.filePath)
    }
  }

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
        <FileUpload onUpload={uploadDocument} />
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documents</h3>

        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No documents found</p>
            <p className="text-sm text-gray-400 mt-2">Upload your first document using the form above</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  {getFileIcon(doc.fileType)}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{doc.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="truncate">{formatFileSize(doc.fileSize)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

