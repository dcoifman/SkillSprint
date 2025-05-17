-- First completely recreate the course_generation_requests table
DROP TABLE IF EXISTS public.sprint_contents;
DROP TABLE IF EXISTS public.course_generation_requests;

-- Create the course_generation_requests table from scratch
CREATE TABLE public.course_generation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL, -- Allow NULL user_id with no foreign key constraint
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

-- Create the sprint_contents table
CREATE TABLE public.sprint_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.course_generation_requests(id) ON DELETE CASCADE,
  module_index INTEGER NOT NULL,
  sprint_index INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE public.course_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own course generation requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Users can insert their own course generation requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Allow authenticated users to access their requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Allow anonymous access to course generation requests" ON public.course_generation_requests;
DROP POLICY IF EXISTS "Allow inserts with null user_id" ON public.course_generation_requests;

DROP POLICY IF EXISTS "Allow anonymous access to sprint_contents" ON public.sprint_contents;

-- Create simple permissive policies for both tables
CREATE POLICY "Full access to course_generation_requests" 
  ON public.course_generation_requests
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full access to sprint_contents" 
  ON public.sprint_contents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_generation_user_id ON public.course_generation_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_course_generation_status ON public.course_generation_requests (status);
CREATE INDEX IF NOT EXISTS sprint_contents_request_id_idx ON public.sprint_contents (request_id);
CREATE UNIQUE INDEX IF NOT EXISTS sprint_contents_request_module_sprint_idx ON public.sprint_contents (request_id, module_index, sprint_index); 