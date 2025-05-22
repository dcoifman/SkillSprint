-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own personalized paths" ON personalized_learning_paths;
DROP POLICY IF EXISTS "Users can create modules in their paths" ON personalized_modules;
DROP POLICY IF EXISTS "Users can create sprints in their modules" ON personalized_sprints;
DROP POLICY IF EXISTS "Users can create quiz questions in their sprints" ON personalized_quiz_questions;

-- Create updated policies that allow service role access
CREATE POLICY "Allow service role and users to create personalized paths"
  ON personalized_learning_paths FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.uid() = user_id
  );

CREATE POLICY "Allow service role and users to create modules"
  ON personalized_modules FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM personalized_learning_paths
      WHERE id = personalized_path_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow service role and users to create sprints"
  ON personalized_sprints FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM personalized_modules m
      JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
      WHERE m.id = personalized_module_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow service role and users to create quiz questions"
  ON personalized_quiz_questions FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM personalized_sprints s
      JOIN personalized_modules m ON m.id = s.personalized_module_id
      JOIN personalized_learning_paths p ON p.id = m.personalized_path_id
      WHERE s.id = personalized_sprint_id
      AND p.user_id = auth.uid()
    )
  ); 