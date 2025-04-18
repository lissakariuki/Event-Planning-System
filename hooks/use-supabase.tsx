"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Create a singleton pattern for the client to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Initialize the Supabase client
const initializeSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are missing")
      throw new Error("Supabase environment variables are missing")
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

/**
 * Hook to use Supabase client in client components
 */
export function useSupabase() {
  const [supabase] = useState(() => initializeSupabase())

  return { supabase }
}

/**
 * Hook to subscribe to Supabase realtime changes
 */
export function useRealtimeSubscription(
  table: string,
  teamId: string | undefined,
  callback: () => void,
  initialFetch: () => Promise<any>,
) {
  const { supabase } = useSupabase()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!teamId) return

    // Initial data fetch
    initialFetch()

    // Set up real-time subscription
    const newChannel = supabase
      .channel(`${table}-changes-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          callback()
        },
      )
      .subscribe()

    setChannel(newChannel)

    // Cleanup
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [teamId, table, supabase, callback, initialFetch])

  return channel
}

