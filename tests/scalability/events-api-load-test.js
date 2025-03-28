import http from "k6/http"
import { check, sleep } from "k6"
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js"

// Test configuration
export const options = {
  stages: [
    { duration: "10s", target: 2 }, // Start with a very small load for testing
    { duration: "20s", target: 5 }, // Gradually increase
    { duration: "10s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests must complete below 2000ms
    http_req_failed: ["rate<0.10"], // Less than 10% of requests can fail
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

  try {
    // 1. List events (GET request)
    const listResponse = http.get(`http://localhost:3000/api/events?teamId=${TEST_TEAM_ID}`, { headers })

    // Log the response for debugging
    if (listResponse.status !== 200) {
      console.log(`List events failed with status ${listResponse.status}: ${listResponse.body}`)
    }

    check(listResponse, {
      "list events status is 200": (r) => r.status === 200,
      "list events response time < 2000ms": (r) => r.timings.duration < 2000,
    })

    sleep(1)

    // 2. Create a new event (POST request)
    const eventDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000)
    const eventData = {
      title: `Test Event ${randomString(8)}`,
      date: eventDate.toISOString().split("T")[0],
      time: "18:00",
      location: "Test Location",
      description: "This is a test event created by k6 load test",
      price: Math.floor(Math.random() * 1000),
      teamId: TEST_TEAM_ID,
    }

    const createResponse = http.post("http://localhost:3000/api/events", JSON.stringify(eventData), { headers })

    // Log the response for debugging
    if (createResponse.status !== 201) {
      console.log(`Create event failed with status ${createResponse.status}: ${createResponse.body}`)
    }

    check(createResponse, {
      "create event status is 201": (r) => r.status === 201,
      "create event response time < 2000ms": (r) => r.timings.duration < 2000,
    })

    // Only proceed with event details, update, and delete if we have a valid event ID
    let eventId
    try {
      if (createResponse.status === 201) {
        const responseBody = JSON.parse(createResponse.body)
        eventId = responseBody.id

        check(createResponse, {
          "create event returns id": (r) => eventId !== undefined,
        })

        if (eventId) {
          // 3. Get event details (GET request)
          const detailResponse = http.get(`http://localhost:3000/api/events/${eventId}`, { headers })

          check(detailResponse, {
            "get event details status is 200": (r) => r.status === 200,
            "get event details response time < 2000ms": (r) => r.timings.duration < 2000,
          })

          // 4. Update the event (PUT request)
          const updateData = {
            title: `Updated Event ${randomString(8)}`,
            date: eventData.date,
            time: "19:30",
            location: "Updated Location",
            description: "This event was updated by k6 load test",
            price: Math.floor(Math.random() * 1000),
          }

          const updateResponse = http.put(`http://localhost:3000/api/events/${eventId}`, JSON.stringify(updateData), {
            headers,
          })

          check(updateResponse, {
            "update event status is 200": (r) => r.status === 200,
            "update event response time < 2000ms": (r) => r.timings.duration < 2000,
          })

          // 5. Delete the event (DELETE request)
          // Only delete some events to keep data for other tests
          if (Math.random() < 0.3) {
            const deleteResponse = http.del(`http://localhost:3000/api/events/${eventId}`, null, { headers })

            check(deleteResponse, {
              "delete event status is 200": (r) => r.status === 200,
              "delete event response time < 2000ms": (r) => r.timings.duration < 2000,
            })
          }
        }
      }
    } catch (e) {
      console.log(`Failed to parse create response: ${e.message}`)
    }
  } catch (e) {
    console.log(`Test iteration failed: ${e.message}`)
  }

  sleep(Math.random() * 2 + 1) // Random sleep between 1-3 seconds
}

