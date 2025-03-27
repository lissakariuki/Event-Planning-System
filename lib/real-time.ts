"use client"

import type { RealtimeChannel } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { useSupabase } from "@/hooks/use-supabase"

// Types for subscription handlers
type SubscriptionCallback = (payload: any) => void
type SubscriptionHandlers = {
  [key: string]: {
    onInsert?: SubscriptionCallback
    onUpdate?: SubscriptionCallback
    onDelete?: SubscriptionCallback
  }
}

export function useRealtimeSubscription(table: string, teamId: string | null, handlers: SubscriptionHandlers) {
  const { supabase } = useSupabase()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!teamId) return

    // Create a new subscription channel
    const newChannel = supabase
      .channel(`${table}_changes_${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log(`New ${table} inserted:`, payload)
          handlers.onInsert?.(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table,
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log(`${table} updated:`, payload)
          handlers.onUpdate?.(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table,
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log(`${table} deleted:`, payload)
          handlers.onDelete?.(payload)
        },
      )
      .subscribe()

    setChannel(newChannel)

    // Cleanup function
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel)
      }
    }
  }, [supabase, table, teamId, handlers])

  return channel
}

