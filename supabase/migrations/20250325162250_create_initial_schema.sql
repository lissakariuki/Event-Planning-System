-- Function to create a mock users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_mock_users_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the users table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Create a temporary users table for testing
    CREATE TABLE public.users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add a comment to indicate this is a temporary table
    COMMENT ON TABLE public.users IS 'Temporary users table created for testing purposes';
  END IF;
END;
$$;

-- Function to count tasks by completion status
CREATE OR REPLACE FUNCTION count_tasks_by_completion(team_id_param UUID)
RETURNS TABLE (
  status TEXT,
  count BIGINT
)
LANGUAGE sql
AS $$
  SELECT 
    CASE WHEN completed THEN 'completed' ELSE 'incomplete' END as status,
    COUNT(*) as count
  FROM 
    tasks
  WHERE 
    team_id = team_id_param
  GROUP BY 
    completed;
$$;

