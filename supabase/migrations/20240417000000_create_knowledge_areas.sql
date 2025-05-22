-- Create knowledge_areas table
CREATE TABLE IF NOT EXISTS knowledge_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES knowledge_areas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_knowledge_proficiency table
CREATE TABLE IF NOT EXISTS user_knowledge_proficiency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_area_id UUID NOT NULL REFERENCES knowledge_areas(id) ON DELETE CASCADE,
  proficiency_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  confidence_level DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  last_assessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, knowledge_area_id)
);

-- Enable Row Level Security
ALTER TABLE knowledge_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_knowledge_proficiency ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_areas
CREATE POLICY "Everyone can view knowledge areas"
  ON knowledge_areas FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create knowledge areas"
  ON knowledge_areas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update knowledge areas"
  ON knowledge_areas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for user_knowledge_proficiency
CREATE POLICY "Users can view their own proficiency"
  ON user_knowledge_proficiency FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proficiency"
  ON user_knowledge_proficiency FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proficiency"
  ON user_knowledge_proficiency FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proficiency"
  ON user_knowledge_proficiency FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_knowledge_areas_updated_at
  BEFORE UPDATE ON knowledge_areas
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_knowledge_proficiency_updated_at
  BEFORE UPDATE ON user_knowledge_proficiency
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert default knowledge areas
INSERT INTO knowledge_areas (name, description) VALUES
  ('Anatomical Terminology', 'Terms used to describe body positions, regions, and directional terms.'),
  ('Skeletal System', 'Bones, cartilage, and joints of the human body.'),
  ('Muscular System', 'Muscles and associated tissues that control movement.'),
  ('Nervous System', 'Brain, spinal cord, nerves, and associated structures.'),
  ('Cardiovascular System', 'Heart, blood vessels, and blood circulation.')
ON CONFLICT DO NOTHING; 