-- Create instructors table
CREATE TABLE instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_paths table
CREATE TABLE learning_paths (
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

-- Create modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sprints table
CREATE TABLE sprints (
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
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for instructors, learning_paths, modules, sprints
CREATE POLICY "Allow public read access for instructors" 
    ON instructors FOR SELECT USING (true);

CREATE POLICY "Allow public read access for learning_paths" 
    ON learning_paths FOR SELECT USING (true);

CREATE POLICY "Allow public read access for modules" 
    ON modules FOR SELECT USING (true);

CREATE POLICY "Allow public read access for sprints" 
    ON sprints FOR SELECT USING (true);

-- User-specific policies for user_paths and user_progress
CREATE POLICY "Users can view their own enrollments" 
    ON user_paths FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves" 
    ON user_paths FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" 
    ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
    ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
    ON user_progress FOR UPDATE USING (auth.uid() = user_id);

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