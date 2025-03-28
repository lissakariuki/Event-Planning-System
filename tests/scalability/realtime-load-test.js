import http from "k6/http"
import { check, sleep } from "k6"
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js"

// Test configuration
export const options = {
  stages: [
    { duration: "20s", target: 3 }, // Start with a smaller load for testing
    { duration: "30s", target: 5 }, // Gradually increase
    { duration: "20s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"], // 95% of requests must complete below 1000ms
    http_req_failed: ["rate<0.05"], // Less than 5% of requests can fail
  },
}

// Get a valid team ID from the environment or use a default for testing
const TEST_TEAM_ID = __ENV.TEST_TEAM_ID || "00000000-0000-0000-0000-000000000000"

export default function () {
  // Set up headers with test mode flag for development
  const headers = {
    "Content-Type": "application/json",
    "x-test-mode": "true",
  }

  // 1. Create a new task to trigger realtime updates
  const taskData = {
    title: `Test Task ${randomString(8)}`,
    teamId: TEST_TEAM_ID,
    completed: false,
  }

  const createTaskResponse = http.post("http://localhost:3000/api/tasks", JSON.stringify(taskData), { headers })

  check(createTaskResponse, {
    "create task status is 201": (r) => r.status === 201,
  })

  // 2. Create a new event to trigger realtime updates
  const eventDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000)
  const eventData = {
    title: `Realtime Test Event ${randomString(8)}`,
    date: eventDate.toISOString().split("T")[0],
    time: "18:00",
    location: "Test Location",
    description: "This is a test event created by k6 realtime load test",
    price: Math.floor(Math.random() * 1000),
    teamId: TEST_TEAM_ID,
  }

  const createEventResponse = http.post("http://localhost:3000/api/events", JSON.stringify(eventData), { headers })

  check(createEventResponse, {
    "create event status is 201": (r) => r.status === 201,
  })

  // Skip WebSocket connection test
  console.log("Skipping WebSocket connection test - implement if needed")

  sleep(Math.random() * 2 + 1) // Random sleep between 1-3 seconds
}

