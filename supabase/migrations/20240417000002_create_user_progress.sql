-- Create user_quiz_results table
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  time_spent_seconds INTEGER,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_sprint_progress table
CREATE TABLE IF NOT EXISTS user_sprint_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  score DECIMAL(5,2),
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sprint_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_quiz_results
CREATE POLICY "Users can view their own quiz results"
  ON user_quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz results"
  ON user_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results"
  ON user_quiz_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for user_sprint_progress
CREATE POLICY "Users can view their own sprint progress"
  ON user_sprint_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sprint progress"
  ON user_sprint_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sprint progress"
  ON user_sprint_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_user_quiz_results_updated_at
  BEFORE UPDATE ON user_quiz_results
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_sprint_progress_updated_at
  BEFORE UPDATE ON user_sprint_progress
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 