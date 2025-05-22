-- Create personalized_learning_paths table
CREATE TABLE IF NOT EXISTS personalized_learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_path_id UUID REFERENCES learning_paths(id),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create personalized_modules table
CREATE TABLE IF NOT EXISTS personalized_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personalized_path_id UUID NOT NULL REFERENCES personalized_learning_paths(id) ON DELETE CASCADE,
  original_module_id UUID REFERENCES modules(id),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create personalized_sprints table
CREATE TABLE IF NOT EXISTS personalized_sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personalized_module_id UUID NOT NULL REFERENCES personalized_modules(id) ON DELETE CASCADE,
  original_sprint_id UUID REFERENCES sprints(id),
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  content JSONB,
  order_index INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  is_generated BOOLEAN DEFAULT false,
  knowledge_area_focus UUID REFERENCES knowledge_areas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create personalized_quiz_questions table
CREATE TABLE IF NOT EXISTS personalized_quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personalized_sprint_id UUID NOT NULL REFERENCES personalized_sprints(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  knowledge_area_id UUID REFERENCES knowledge_areas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE personalized_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for personalized_learning_paths
CREATE POLICY "Users can view their own personalized paths"
  ON personalized_learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personalized paths"
  ON personalized_learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personalized paths"
  ON personalized_learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personalized paths"
  ON personalized_learning_paths FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for personalized_modules
CREATE POLICY "Users can view modules in their paths"
  ON personalized_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM personalized_learning_paths
    WHERE id = personalized_path_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create modules in their paths"
  ON personalized_modules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM personalized_learning_paths
    WHERE id = personalized_path_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update modules in their paths"
  ON personalized_modules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM personalized_learning_paths
    WHERE id = personalized_path_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete modules in their paths"
  ON personalized_modules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM personalized_learning_paths
    WHERE id = personalized_path_id
    AND user_id = auth.uid()
  ));

-- Create policies for personalized_sprints
CREATE POLICY "Users can view sprints in their modules"
  ON personalized_sprints FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM personalized_modules m
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE m.id = personalized_module_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create sprints in their modules"
  ON personalized_sprints FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM personalized_modules m
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE m.id = personalized_module_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sprints in their modules"
  ON personalized_sprints FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM personalized_modules m
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE m.id = personalized_module_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sprints in their modules"
  ON personalized_sprints FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM personalized_modules m
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE m.id = personalized_module_id
    AND p.user_id = auth.uid()
  ));

-- Create policies for personalized_quiz_questions
CREATE POLICY "Users can view quiz questions in their sprints"
  ON personalized_quiz_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM personalized_sprints s
    JOIN personalized_modules m ON m.id = s.personalized_module_id
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE s.id = personalized_sprint_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create quiz questions in their sprints"
  ON personalized_quiz_questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM personalized_sprints s
    JOIN personalized_modules m ON m.id = s.personalized_module_id
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE s.id = personalized_sprint_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update quiz questions in their sprints"
  ON personalized_quiz_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM personalized_sprints s
    JOIN personalized_modules m ON m.id = s.personalized_module_id
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE s.id = personalized_sprint_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete quiz questions in their sprints"
  ON personalized_quiz_questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM personalized_sprints s
    JOIN personalized_modules m ON m.id = s.personalized_module_id
    JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
    WHERE s.id = personalized_sprint_id
    AND p.user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE TRIGGER update_personalized_learning_paths_updated_at
  BEFORE UPDATE ON personalized_learning_paths
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_personalized_modules_updated_at
  BEFORE UPDATE ON personalized_modules
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_personalized_sprints_updated_at
  BEFORE UPDATE ON personalized_sprints
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_personalized_quiz_questions_updated_at
  BEFORE UPDATE ON personalized_quiz_questions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 