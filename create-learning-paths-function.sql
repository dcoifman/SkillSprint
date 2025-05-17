-- Create a function to create the learning_paths table
CREATE OR REPLACE FUNCTION create_learning_paths_table()
RETURNS void AS $$
BEGIN
  -- Create the table if it doesn't exist
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

  -- Create policies if they don't exist
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'learning_paths' AND policyname = 'Enable read access for all users'
    ) THEN
      CREATE POLICY "Enable read access for all users" ON learning_paths
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'learning_paths' AND policyname = 'Enable insert for authenticated users only'
    ) THEN
      CREATE POLICY "Enable insert for authenticated users only" ON learning_paths
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'learning_paths' AND policyname = 'Enable update for authenticated users only'
    ) THEN
      CREATE POLICY "Enable update for authenticated users only" ON learning_paths
        FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
  END $$;

  -- Create trigger for updated_at if it doesn't exist
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
  CREATE TRIGGER update_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
END;
$$ LANGUAGE plpgsql; 