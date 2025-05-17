-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Users can view their own course generation requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Users can insert their own course generation requests" ON public.course_generation_requests;
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