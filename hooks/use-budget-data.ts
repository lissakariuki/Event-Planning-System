"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/hooks/use-supabase"

export function useBudgetData(teamId: string | undefined) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    currentBudget: 0,
    budgetItems: [],
  })

  // Fetch budget data from the budget table
  const fetchBudgetData = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, get the team's base budget information
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("budget_total, budget_current")
        .eq("id", teamId)
        .single()

      if (teamError) {
        console.error("Error fetching team budget data:", teamError)
        setError("Failed to load team budget data")
        setIsLoading(false)
        return
      }

      // Then, get detailed budget items if they exist in a separate table
      const { data: budgetItems, error: budgetItemsError } = await supabase
        .from("budget_items")
        .select("*")
        .eq("team_id", teamId)

      if (budgetItemsError && !budgetItemsError.message.includes("does not exist")) {
        console.error("Error fetching budget items:", budgetItemsError)
        setError("Failed to load budget items")
      }

      // Calculate the accumulated budget from items if available
      let calculatedCurrentBudget = teamData.budget_current || 0

      // If we have budget items, we can calculate a more accurate current budget
      if (budgetItems && budgetItems.length > 0) {
        calculatedCurrentBudget = budgetItems.reduce((total, item) => {
          return total + (item.amount || 0)
        }, 0)
      }

      setBudgetData({
        totalBudget: teamData.budget_total || 0,
        currentBudget: calculatedCurrentBudget,
        budgetItems: budgetItems || [],
      })
    } catch (error) {
      console.error("Error in fetchBudgetData:", error)
      setError("An unexpected error occurred while loading budget data")
    } finally {
      setIsLoading(false)
    }
  }, [teamId, supabase])

  // Set up real-time subscriptions for budget updates
  useEffect(() => {
    if (!teamId) return

    // Initial fetch
    fetchBudgetData()

    // Subscribe to team budget changes
    const teamChannel = supabase
      .channel("team-budget-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teams", filter: `id=eq.${teamId}` }, () => {
        console.log("Team budget updated, refreshing data")
        fetchBudgetData()
      })
      .subscribe()

    // Subscribe to budget items changes if the table exists
    const budgetItemsChannel = supabase
      .channel("budget-items-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budget_items", filter: `team_id=eq.${teamId}` },
        () => {
          console.log("Budget items updated, refreshing data")
          fetchBudgetData()
        },
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(teamChannel)
      supabase.removeChannel(budgetItemsChannel)
    }
  }, [teamId, supabase, fetchBudgetData])

  return {
    budgetData,
    fetchBudgetData,
    isLoading,
    error,
  }
}

