import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Basic health check that doesn't depend on database
    const healthStatus = {
      status: "healthy",
      server: "running",
      database: "unknown",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "development",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    // Try to check database connection, but don't fail if it doesn't work
    try {
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient<Database>(supabaseUrl, supabaseKey)
        const { data, error } = await supabase.from("teams").select("count").limit(1)

        if (error) {
          console.error("Health check - database error:", error)
          healthStatus.database = "error"
          healthStatus.databaseError = error.message
        } else {
          healthStatus.database = "connected"
        }
      } else {
        healthStatus.database = "not_configured"
      }
    } catch (dbError: any) {
      console.error("Health check - database connection failed:", dbError)
      healthStatus.database = "error"
      healthStatus.databaseError = dbError.message
    }

    // Always return 200 status for the health check endpoint
    return NextResponse.json(healthStatus)
  } catch (error: any) {
    console.error("Health check failed:", error)

    // Even on error, return 200 status with error information
    return NextResponse.json({
      status: "error",
      server: "running",
      message: "Health check encountered an error",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

