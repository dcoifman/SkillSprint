-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration TEXT,
  modules INTEGER,
  difficulty TEXT,
  rating DECIMAL(3,2),
  reviews INTEGER,
  image_url TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  instructor_name TEXT,
  instructor_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_paths
CREATE POLICY "Everyone can view learning paths"
  ON learning_paths FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create learning paths"
  ON learning_paths FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update learning paths"
  ON learning_paths FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 