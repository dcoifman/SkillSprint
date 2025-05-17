-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Users can view their own course generation requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Allow anonymous access to course generation requests" ON public.course_generation_requests;

-- Modify the table to allow null user_id and drop the foreign key constraint
ALTER TABLE public.course_generation_requests
  DROP CONSTRAINT IF EXISTS course_generation_requests_user_id_fkey,
  ALTER COLUMN user_id DROP NOT NULL;

-- Add the foreign key constraint with ON DELETE CASCADE, but allow null values
ALTER TABLE public.course_generation_requests
  ADD CONSTRAINT course_generation_requests_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

-- Create new policies for both authenticated and anonymous access
CREATE POLICY "Allow authenticated users to access their requests"
  ON public.course_generation_requests
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow anonymous access to course generation requests"
  ON public.course_generation_requests
  FOR ALL
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

-- Create the course_generation_requests table first
CREATE TABLE IF NOT EXISTS public.course_generation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  status_message TEXT,
  progress INTEGER DEFAULT 0,
  request_data JSONB NOT NULL,
  course_data JSONB,
  content_generated BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.course_generation_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_generation_user_id ON public.course_generation_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_course_generation_status ON public.course_generation_requests (status);

-- Create notification function and trigger
CREATE OR REPLACE FUNCTION notify_course_generation_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify(
    'course_generation_requests',
    json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'request_data', NEW.request_data
    )::text
  );
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER course_generation_request_trigger
AFTER INSERT ON public.course_generation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_course_generation_request();

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