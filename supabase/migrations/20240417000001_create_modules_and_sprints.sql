-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  content JSONB,
  order_index INTEGER NOT NULL,
  knowledge_area_id UUID REFERENCES knowledge_areas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

-- Create policies for modules
CREATE POLICY "Everyone can view modules"
  ON modules FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create modules"
  ON modules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update modules"
  ON modules FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policies for sprints
CREATE POLICY "Everyone can view sprints"
  ON sprints FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create sprints"
  ON sprints FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update sprints"
  ON sprints FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create updated_at triggers
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 