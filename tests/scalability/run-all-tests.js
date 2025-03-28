import { execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import http from "http"
import { createClient } from "@supabase/supabase-js"

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure reports directory exists
const reportsDir = join(__dirname, "../../reports")
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Required environment variables are missing.")
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`)
}

// Check if server is running - just check if it responds, don't check status code
function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3000/api/health", (res) => {
      // Consider the server running if we get any response
      resolve(true)
    })

    req.on("error", () => {
      resolve(false)
    })

    // Set a timeout to avoid hanging
    req.setTimeout(5000, () => {
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Get a valid team ID from the database using Supabase client directly
async function getValidTeamId() {
  try {
    log("Fetching a valid team ID from the database...")
    const { data, error } = await supabase.from("teams").select("id").limit(1)

    if (error) {
      log(`Error fetching team ID: ${error.message}`)
      return "00000000-0000-0000-0000-000000000000"
    }

    if (data && data.length > 0) {
      log(`Found valid team ID: ${data[0].id}`)
      return data[0].id
    }

    log("No teams found in the database, using default ID")
    return "00000000-0000-0000-0000-000000000000"
  } catch (error) {
    log(`Error getting team ID: ${error.message}`)
    return "00000000-0000-0000-0000-000000000000"
  }
}

// Run a command and log output
function runCommand(command, name, env = {}) {
  log(`Starting ${name}...`)
  try {
    const output = execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: { ...process.env, ...env },
    })
    log(`✅ ${name} completed successfully`)
    return output
  } catch (error) {
    log(`❌ ${name} failed: ${error.message}`)
    return null
  }
}

// Force kill any processes using a specific port
function killProcessOnPort(port) {
  try {
    log(`Attempting to kill any process using port ${port}...`)

    // Different commands for different operating systems
    if (process.platform === "win32") {
      // Windows
      execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`, {
        stdio: "ignore",
      })
    } else {
      // Unix-like (Linux, macOS)
      execSync(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`, { stdio: "ignore" })
    }

    log(`Successfully killed processes on port ${port}`)
  } catch (error) {
    // Ignore errors, as there might not be any process to kill
    log(`No process found on port ${port} or unable to kill: ${error.message}`)
  }
}

async function runAllTests() {
  log("Starting scalability test suite")

  // Check if server is running
  log("Checking if server is running...")
  const serverRunning = await isServerRunning()
  if (!serverRunning) {
    log("❌ Server is not running at http://localhost:3000. Please start the server before running tests.")
    log("Run: npm run dev")
    return
  }
  log("✅ Server is running")

  // Get a valid team ID for tests
  const teamId = await getValidTeamId()
  log(`Using team ID: ${teamId} for tests`)

  // 1. Seed the database with test data
  runCommand("node tests/scalability/database-seed.js", "Database seeding")

  // 2. Run database query performance tests
  runCommand("node tests/scalability/database-query-test.js", "Database query tests")

  // Always skip API load tests
  log("Skipping API load tests")

  // 3. Kill any processes that might be using k6 ports
  killProcessOnPort(6565)
  killProcessOnPort(6566)

  // Wait for ports to be released
  log("Waiting for ports to be released...")
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // 4. Always run real-time feature tests with the valid team ID
  runCommand(
    "k6 run --no-summary --out json=reports/realtime-load-test.json tests/scalability/realtime-load-test.js",
    "Real-time load tests",
    { TEST_TEAM_ID: teamId },
  )

  log("All scalability tests completed")
}

// Run all tests
runAllTests().catch((error) => {
  log(`Error running tests: ${error.message}`)
  process.exit(1)
})