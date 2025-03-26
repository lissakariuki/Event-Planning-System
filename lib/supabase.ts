import { createClient as createClientBrowser } from "@/utils/supabase/client"
import { createServerClient } from "@/utils/supabase/server"

// For client components
export const supabase = createClientBrowser(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// For server components and server actions
export const serverSupabase = createServerClient()

