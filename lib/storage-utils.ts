import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Storage bucket name
const DOCUMENTS_BUCKET = "documents"

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  file: File,
  teamId: string,
  eventId?: string,
  userId?: string,
): Promise<{ path: string; error: Error | null }> {
  try {
    // Create a unique file path
    const timestamp = new Date().getTime()
    const fileExt = file.name.split(".").pop()
    const fileName = `${timestamp}_${file.name.replace(/\.[^/.]+$/, "")}`
    const filePath = `${teamId}${eventId ? `/${eventId}` : ""}/${fileName}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Return the file path
    return { path: data.path, error: null }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { path: "", error: error as Error }
  }
}

/**
 * Get a public URL for a file
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath])

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { error: error as Error }
  }
}

/**
 * List files in a directory
 */
export async function listFiles(teamId: string, eventId?: string): Promise<{ files: any[]; error: Error | null }> {
  try {
    const path = eventId ? `${teamId}/${eventId}` : teamId

    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).list(path)

    if (error) throw error
    return { files: data || [], error: null }
  } catch (error) {
    console.error("Error listing files:", error)
    return { files: [], error: error as Error }
  }
}

/**
 * Save document metadata to the database
 */
export async function saveDocumentMetadata(
  teamId: string,
  filePath: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  uploadedBy: string,
  eventId?: string,
): Promise<{ id: string; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        team_id: teamId,
        event_id: eventId || null,
        name: fileName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: uploadedBy,
      })
      .select("id")
      .single()

    if (error) throw error
    return { id: data.id, error: null }
  } catch (error) {
    console.error("Error saving document metadata:", error)
    return { id: "", error: error as Error }
  }
}

/**
 * Get document metadata from the database
 */
export async function getDocuments(
  teamId: string,
  eventId?: string,
): Promise<{ documents: any[]; error: Error | null }> {
  try {
    let query = supabase.from("documents").select("*").eq("team_id", teamId)

    if (eventId) {
      query = query.eq("event_id", eventId)
    }

    const { data, error } = await query

    if (error) throw error
    return { documents: data || [], error: null }
  } catch (error) {
    console.error("Error getting documents:", error)
    return { documents: [], error: error as Error }
  }
}

/**
 * Delete document metadata from the database
 */
export async function deleteDocumentMetadata(documentId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from("documents").delete().eq("id", documentId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error deleting document metadata:", error)
    return { error: error as Error }
  }
}

