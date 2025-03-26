"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Type for the Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Create a Supabase client
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Create a React hook for the Supabase client
export const useSupabase = () => {
  const [supabase] = useState(() => createClient())

  return { supabase }
}

// Hook for real-time subscriptions
export function useRealtimeSubscription<T>(
  tableName: keyof Database["public"]["Tables"],
  teamId: string | undefined,
  callback: (data: T[]) => void,
  initialFetch: () => Promise<T[]>,
) {
  const { supabase } = useSupabase()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamId) return

    // Initial data fetch
    const fetchData = async () => {
      try {
        const data = await initialFetch()
        callback(data)
      } catch (error: any) {
        console.error(`Error fetching ${tableName}:`, error)
        setError(error.message || `Failed to fetch ${tableName}`)
      }
    }

    fetchData()

    // Set up real-time listener
    const channelName = `${tableName}-changes-${teamId}`
    const newChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName as string,
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIPTION_ERROR") {
          console.error(`Error subscribing to ${tableName}`)
          setError(`Failed to subscribe to real-time updates for ${tableName}`)
        }
      })

    setChannel(newChannel)

    // Clean up subscription when component unmounts or teamId changes
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [supabase, tableName, teamId, callback, initialFetch])

  return { channel, error }
}

