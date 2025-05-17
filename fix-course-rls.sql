-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own course generation requests" ON public.course_generation_requests;

-- Create a more permissive policy that allows null user_id
CREATE POLICY "Allow inserts with null user_id" 
ON public.course_generation_requests 
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

-- Make sure the anonymous access policy exists and is correct
DROP POLICY IF EXISTS "Allow anonymous access to course generation requests" ON public.course_generation_requests;

CREATE POLICY "Allow anonymous access to course generation requests"
ON public.course_generation_requests
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure service role has access to all functions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Add any missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.sprint_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES public.course_generation_requests(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  sprint_index integer NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Make sure RLS is configured correctly
ALTER TABLE public.sprint_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous access to sprint_contents" ON public.sprint_contents;
CREATE POLICY "Allow anonymous access to sprint_contents" 
ON public.sprint_contents
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress records" ON user_progress;
DROP POLICY IF EXISTS "Allow anonymous access to sprint_contents" ON sprint_contents;

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_contents ENABLE ROW LEVEL SECURITY;

-- Create new policies for user_progress
CREATE POLICY "Enable read access for authenticated users"
ON user_progress FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Create new policies for sprint_contents
CREATE POLICY "Enable read access for all users"
ON sprint_contents FOR SELECT
USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_sprint_id ON user_progress(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_contents_request_id ON sprint_contents(request_id); 