import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for server client")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  })
}

