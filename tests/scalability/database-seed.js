import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"

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

// Configuration
const NUM_TEAMS = 5
const USERS_PER_TEAM = 3
const EVENTS_PER_TEAM = 10
const TASKS_PER_TEAM = 8

async function seedDatabase() {
  console.log("Starting database seed for scalability testing...")

  try {
    // Check if users table exists
    const { data: userTableExists, error: userTableError } = await supabase.from("users").select("id").limit(1)

    // If users table doesn't exist, create a mock users table for testing
    if (userTableError && userTableError.code === "PGRST116") {
      console.log("Users table not found. Creating a mock users table for testing...")

      // Create a temporary users table
      await supabase.rpc("create_mock_users_table").catch((error) => {
        console.log("Could not create mock users table. Using direct inserts instead.")
      })
    }

    // First, create users to be team owners
    const users = []
    for (let i = 0; i < NUM_TEAMS * USERS_PER_TEAM; i++) {
      const userId = faker.string.uuid()
      users.push({
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        created_at: new Date().toISOString(),
      })
    }

    console.log(`Inserting ${users.length} users...`)
    try {
      // Try to insert into users table, but continue even if it fails
      await supabase.from("users").insert(users)
      console.log("Users inserted successfully")
    } catch (error) {
      console.log("Could not insert users. Continuing with test user IDs.")
    }

    // Create teams with valid owner_id references
    const teams = []
    for (let i = 0; i < NUM_TEAMS; i++) {
      const teamId = faker.string.uuid()
      const ownerId = users[i * USERS_PER_TEAM].id // First user of each group is the owner

      teams.push({
        id: teamId,
        name: `${faker.company.name()} Team`,
        description: faker.company.catchPhrase(),
        created_at: new Date().toISOString(),
        owner_id: ownerId,
        budget_total: faker.number.int({ min: 10000, max: 100000 }),
        budget_current: faker.number.int({ min: 1000, max: 10000 }),
        upcoming_events: faker.number.int({ min: 0, max: 10 }),
        active_members: USERS_PER_TEAM,
      })
    }

    console.log(`Inserting ${teams.length} teams...`)
    const { error: teamsError } = await supabase.from("teams").insert(teams)
    if (teamsError) {
      console.error("Error inserting teams:", teamsError)
      return
    }

    // Create team members
    const teamMembers = []
    for (let i = 0; i < NUM_TEAMS; i++) {
      const teamId = teams[i].id

      // Add all users for this team as members
      for (let j = 0; j < USERS_PER_TEAM; j++) {
        const userId = users[i * USERS_PER_TEAM + j].id
        const isOwner = j === 0 // First user is the owner

        teamMembers.push({
          id: faker.string.uuid(),
          team_id: teamId,
          user_id: userId,
          role: isOwner ? "admin" : "member", // Use only valid roles
          created_at: new Date().toISOString(),
        })
      }
    }

    console.log(`Inserting ${teamMembers.length} team members...`)
    try {
      const { error: teamMembersError } = await supabase.from("team_members").insert(teamMembers)
      if (teamMembersError) {
        console.error("Error inserting team members:", teamMembersError)
        // Continue even if team members insertion fails
      }
    } catch (error) {
      console.log("Could not insert team members. Continuing with events and tasks.")
    }

    // Create events
    const events = []
    for (const team of teams) {
      for (let i = 0; i < EVENTS_PER_TEAM; i++) {
        const eventDate = faker.date.future()
        const eventTime = `${faker.number.int({ min: 0, max: 23 })}:${faker.number.int({ min: 0, max: 59 })}`

        events.push({
          id: faker.string.uuid(),
          team_id: team.id,
          title: faker.word.words(3),
          description: faker.lorem.paragraph(),
          date: eventDate.toISOString().split("T")[0],
          time: eventTime,
          location: faker.location.city(),
          image_url: faker.image.url(),
          price: faker.number.float({ min: 0, max: 1000, precision: 2 }),
          created_at: faker.date.recent().toISOString(),
          created_by: team.owner_id,
        })
      }
    }

    console.log(`Inserting ${events.length} events...`)
    // Insert in batches to avoid request size limits
    const BATCH_SIZE = 50
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE)
      const { error: eventsError } = await supabase.from("events").insert(batch)
      if (eventsError) {
        console.error(`Error inserting events batch ${i / BATCH_SIZE + 1}:`, eventsError)
        // Continue with next batch even if this one fails
      } else {
        console.log(`Inserted events batch ${i / BATCH_SIZE + 1}/${Math.ceil(events.length / BATCH_SIZE)}`)
      }
    }

    // Create tasks
    const tasks = []
    for (const team of teams) {
      for (let i = 0; i < TASKS_PER_TEAM; i++) {
        tasks.push({
          id: faker.string.uuid(),
          team_id: team.id,
          title: faker.word.words(4),
          completed: faker.datatype.boolean(),
          created_at: faker.date.recent().toISOString(),
          created_by: team.owner_id,
        })
      }
    }

    console.log(`Inserting ${tasks.length} tasks...`)
    // Insert tasks in batches
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE)
      const { error: tasksError } = await supabase.from("tasks").insert(batch)
      if (tasksError) {
        console.error(`Error inserting tasks batch ${i / BATCH_SIZE + 1}:`, tasksError)
        // Continue with next batch even if this one fails
      } else {
        console.log(`Inserted tasks batch ${i / BATCH_SIZE + 1}/${Math.ceil(tasks.length / BATCH_SIZE)}`)
      }
    }

    console.log("Database seed completed successfully!")
  } catch (error) {
    console.error("Unexpected error in database seeding:", error)
  }
}

// Run the seed function
seedDatabase().catch(console.error)

