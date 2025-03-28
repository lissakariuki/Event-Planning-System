import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Required environment variables are missing.")
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
  console.error("You can set them by running:")
  console.error("export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url")
  console.error("export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test queries
async function testDatabasePerformance() {
  console.log("Starting database performance tests...")

  try {
    // First, get a valid team ID from the database
    const { data: teamData, error: teamError } = await supabase.from("teams").select("id").limit(1).single()

    if (teamError) {
      console.error("Error fetching team ID:", teamError)
      console.log("Using default team ID for tests")
      const defaultTeamId = "00000000-0000-0000-0000-000000000000"
      await runTestsWithTeamId(defaultTeamId)
      return
    }

    const teamId = teamData.id
    console.log(`Using team ID: ${teamId} for tests`)
    await runTestsWithTeamId(teamId)
  } catch (error) {
    console.error("Unexpected error in database tests:", error)
  }
}

async function runTestsWithTeamId(teamId) {
  try {
    // Test 1: Get all events for a team with pagination
    console.log("\nTest 1: Events pagination query")
    console.time("Events pagination query")
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("team_id", teamId)
      .order("date", { ascending: false })
      .range(0, 9)
    console.timeEnd("Events pagination query")

    if (eventsError) {
      console.error("Error in events query:", eventsError)
    } else {
      console.log(`Retrieved ${events?.length || 0} events`)
    }

    // Test 2: Complex join query - Get all tasks with team details
    console.log("\nTest 2: Complex join query")
    console.time("Complex join query")
    const { data: tasksWithDetails, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        teams!tasks_team_id_fkey (id, name, description)
      `)
      .eq("team_id", teamId)
      .limit(20)
    console.timeEnd("Complex join query")

    if (tasksError) {
      console.error("Error in complex join query:", tasksError)
    } else {
      console.log(`Retrieved ${tasksWithDetails?.length || 0} tasks with details`)
    }

    // Test 3: Full-text search
    console.log("\nTest 3: Full-text search query")
    const searchTerm = "meeting"
    console.time("Full-text search query")
    const { data: searchResults, error: searchError } = await supabase
      .from("events")
      .select("*")
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(20)
    console.timeEnd("Full-text search query")

    if (searchError) {
      console.error("Error in search query:", searchError)
    } else {
      console.log(`Found ${searchResults?.length || 0} results for search term "${searchTerm}"`)
    }

    // Test 4: Aggregation query - Count tasks by completion status
    console.log("\nTest 4: Aggregation query")
    console.time("Aggregation query")

    try {
      // Direct query to count tasks by completion status
      const { data: completedTasks, error: completedError } = await supabase
        .from("tasks")
        .select("id")
        .eq("team_id", teamId)
        .eq("completed", true)

      const { data: incompleteTasks, error: incompleteError } = await supabase
        .from("tasks")
        .select("id")
        .eq("team_id", teamId)
        .eq("completed", false)

      if (completedError || incompleteError) {
        console.error("Error in task count query:", completedError || incompleteError)
      } else {
        const taskStats = {
          completed: completedTasks.length,
          incomplete: incompleteTasks.length,
          total: completedTasks.length + incompleteTasks.length,
        }
        console.log("Task statistics by completion status:", taskStats)
      }
    } catch (error) {
      console.error("Error in aggregation query:", error)
    }

    console.timeEnd("Aggregation query")

    // Test 5: Team budget query
    console.log("\nTest 5: Team budget query")
    console.time("Team budget query")

    try {
      const { data: budgetData, error: budgetError } = await supabase
        .from("teams")
        .select("budget_current, budget_total")
        .eq("id", teamId)
        .single()

      if (budgetError) {
        console.error("Error in team budget query:", budgetError)
      } else {
        console.log(`Team budget: $${budgetData.budget_current.toFixed(2)} of $${budgetData.budget_total.toFixed(2)}`)
        const percentUsed = (budgetData.budget_current / budgetData.budget_total) * 100
        console.log(`Budget utilization: ${percentUsed.toFixed(2)}%`)
      }
    } catch (error) {
      console.error("Error in budget calculation:", error)
    }

    console.timeEnd("Team budget query")

    console.log("\nDatabase performance tests completed!")
  } catch (error) {
    console.error("Error running tests with team ID:", error)
  }
}

// Run the test function
testDatabasePerformance().catch(console.error)

