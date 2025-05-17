-- Add user_id column to instructors table if it doesn't exist
DO $$ 
BEGIN
    RAISE NOTICE 'Checking for user_id column in instructors table...';
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'instructors' 
        AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'Adding user_id column to instructors table...';
        ALTER TABLE public.instructors 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Successfully added user_id column to instructors table';
    ELSE
        RAISE NOTICE 'user_id column already exists in instructors table';
    END IF;
END $$;

-- Create instructors table
DO $$
BEGIN
    RAISE NOTICE 'Creating instructors table...';
    CREATE TABLE IF NOT EXISTS public.instructors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        title TEXT,
        bio TEXT,
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Instructors table created or already exists';
END $$;

-- Create learning_paths table
DO $$
BEGIN
    RAISE NOTICE 'Creating learning_paths table...';
    CREATE TABLE IF NOT EXISTS public.learning_paths (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        level TEXT,
        image TEXT,
        total_sprints INTEGER DEFAULT 0,
        estimated_time TEXT,
        rating DECIMAL(3,2),
        review_count INTEGER DEFAULT 0,
        students_count INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        objectives TEXT[] DEFAULT '{}',
        prerequisites TEXT[] DEFAULT '{}',
        instructor_id UUID REFERENCES instructors(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Learning paths table created or already exists';
END $$;

-- Create modules table
DO $$
BEGIN
    RAISE NOTICE 'Creating modules table...';
    CREATE TABLE IF NOT EXISTS public.modules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Modules table created or already exists';
END $$;

-- Create sprints table
DO $$
BEGIN
    RAISE NOTICE 'Creating sprints table...';
    CREATE TABLE IF NOT EXISTS public.sprints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        time TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Sprints table created or already exists';
END $$;

-- Create user_paths table (for enrollments)
CREATE TABLE user_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, path_id)
);

-- Create user_progress table (for tracking sprint completion)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sprint_id)
);

-- Create RLS policies
DO $$
BEGIN
    RAISE NOTICE 'Setting up Row Level Security policies...';
    
    -- Enable RLS
    ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
    ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
    ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_paths ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Row Level Security enabled for all tables';

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public read access for instructors" ON instructors;
    DROP POLICY IF EXISTS "Allow users to create their own instructor profile" ON instructors;
    DROP POLICY IF EXISTS "Allow instructors to update their own profile" ON instructors;
    DROP POLICY IF EXISTS "Allow public read access for learning_paths" ON learning_paths;
    DROP POLICY IF EXISTS "Allow public read access for modules" ON modules;
    DROP POLICY IF EXISTS "Allow public read access for sprints" ON sprints;
    DROP POLICY IF EXISTS "Users can view their own enrollments" ON user_paths;
    DROP POLICY IF EXISTS "Users can enroll themselves" ON user_paths;
    DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can update their own progress records" ON user_progress;

    -- Create policies
    CREATE POLICY "Allow public read access for instructors" 
        ON instructors FOR SELECT USING (true);

    CREATE POLICY "Allow users to create their own instructor profile"
        ON instructors FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Allow instructors to update their own profile"
        ON instructors FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Allow public read access for learning_paths" 
        ON learning_paths FOR SELECT USING (true);

    CREATE POLICY "Allow public read access for modules" 
        ON modules FOR SELECT USING (true);

    CREATE POLICY "Allow public read access for sprints" 
        ON sprints FOR SELECT USING (true);

    -- User-specific policies
    CREATE POLICY "Users can view their own enrollments" 
        ON user_paths FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can enroll themselves" 
        ON user_paths FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view their own progress" 
        ON user_progress FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own progress" 
        ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own progress records" 
        ON user_progress FOR UPDATE USING (auth.uid() = user_id);
        
    RAISE NOTICE 'All policies created successfully';
END $$;

-- Create a function to update total_sprints count when sprints are added/removed
CREATE OR REPLACE FUNCTION update_path_sprint_count()
RETURNS TRIGGER AS $$
DECLARE
    module_path_id UUID;
    new_count INTEGER;
BEGIN
    -- Get the path_id from the module
    SELECT path_id INTO module_path_id FROM modules WHERE id = 
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.module_id
            ELSE NEW.module_id
        END;
    
    -- Count total sprints for this path
    SELECT COUNT(*) INTO new_count 
    FROM sprints s
    JOIN modules m ON s.module_id = m.id
    WHERE m.path_id = module_path_id;
    
    -- Update the learning_path
    UPDATE learning_paths
    SET total_sprints = new_count,
        updated_at = NOW()
    WHERE id = module_path_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to maintain total_sprints count
CREATE TRIGGER update_path_sprint_count_insert_update
AFTER INSERT OR UPDATE ON sprints
FOR EACH ROW EXECUTE FUNCTION update_path_sprint_count();

CREATE TRIGGER update_path_sprint_count_delete
AFTER DELETE ON sprints
FOR EACH ROW EXECUTE FUNCTION update_path_sprint_count();

-- Create course_invitations table
CREATE TABLE course_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(path_id, user_id)
);

-- Add RLS policies for course_invitations
ALTER TABLE course_invitations ENABLE ROW LEVEL SECURITY;

-- Allow students to view their own invitations
CREATE POLICY "Students can view their own invitations" 
    ON course_invitations FOR SELECT USING (auth.uid() = user_id);

-- Allow students to update (accept/reject) their own invitations
CREATE POLICY "Students can update their own invitations" 
    ON course_invitations FOR UPDATE USING (auth.uid() = user_id);

-- Allow instructors to create invitations for their own courses
CREATE POLICY "Instructors can create invitations for their own courses" 
    ON course_invitations FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = path_id AND 
                  EXISTS (
                      SELECT 1 FROM instructors i
                      WHERE i.id = lp.instructor_id AND i.user_id = auth.uid()
                  )
        )
    );

-- Create function to auto-enroll student when invitation is accepted
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
        -- Auto-enroll the student
        INSERT INTO user_paths (user_id, path_id)
        VALUES (NEW.user_id, NEW.path_id)
        ON CONFLICT (user_id, path_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation acceptance
CREATE TRIGGER on_invitation_acceptance
AFTER UPDATE ON course_invitations
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted'))
EXECUTE FUNCTION handle_invitation_acceptance();

-- Table for course generation requests
CREATE TABLE IF NOT EXISTS public.course_generation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Grant permissions for authenticated users to access their own requests
ALTER TABLE public.course_generation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course generation requests"
  ON public.course_generation_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course generation requests"
  ON public.course_generation_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups by user and status
CREATE INDEX IF NOT EXISTS idx_course_generation_user_id ON public.course_generation_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_course_generation_status ON public.course_generation_requests (status);

-- Create a function to handle course generation requests via webhook
-- Triggered when a new record is inserted into course_generation_requests
CREATE OR REPLACE FUNCTION notify_course_generation_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify external service about the new request
  -- This allows for real-time updates without polling
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

-- Trigger the notification function when a new course generation request is created
CREATE TRIGGER course_generation_request_trigger
AFTER INSERT ON public.course_generation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_course_generation_request();

-- Modify course_generation_requests table to allow NULL user_id
ALTER TABLE public.course_generation_requests
  ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for course_generation_requests
DROP POLICY IF EXISTS "Allow anonymous access to course generation requests" ON public.course_generation_requests;

CREATE POLICY "Allow anonymous access to course generation requests"
  ON public.course_generation_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create sprint_contents table
CREATE TABLE IF NOT EXISTS public.sprint_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES public.course_generation_requests(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  sprint_index integer NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add RLS policies for sprint_contents
ALTER TABLE public.sprint_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to sprint_contents" ON public.sprint_contents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS sprint_contents_request_id_idx ON public.sprint_contents(request_id);
CREATE UNIQUE INDEX IF NOT EXISTS sprint_contents_request_module_sprint_idx ON public.sprint_contents(request_id, module_index, sprint_index);

-- Final status check
DO $$
BEGIN
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Schema setup completed successfully';
    RAISE NOTICE 'Tables created: instructors, learning_paths, modules, sprints, user_paths, user_progress, course_invitations, course_generation_requests, sprint_contents';
    RAISE NOTICE 'RLS policies applied to all tables';
    RAISE NOTICE 'Triggers and functions created';
    RAISE NOTICE '----------------------------------------';
END $$; 