"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useSupabase() {
  const supabase = getSupabaseClient()
  return { supabase }
}

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

