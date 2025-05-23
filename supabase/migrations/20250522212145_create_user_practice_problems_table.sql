-- Create user_practice_problems table
CREATE TABLE IF NOT EXISTS public.user_practice_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  problems_data JSONB NOT NULL, -- Store practice problems as JSONB
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, sprint_id) -- Ensure only one entry per user and sprint
);

-- Enable Row Level Security
ALTER TABLE public.user_practice_problems ENABLE ROW LEVEL SECURITY;

-- Create policies for user_practice_problems
CREATE POLICY "Users can view their own practice problems"
  ON public.user_practice_problems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice problems"
  ON public.user_practice_problems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice problems"
  ON public.user_practice_problems FOR UPDATE
  USING (auth.uid() = user_id);
