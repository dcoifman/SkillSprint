#!/bin/bash

# Start Supabase containers
docker-compose up -d

# Wait for Supabase to be ready
echo "Waiting for Supabase to be ready..."
sleep 10

# Run migrations
docker-compose exec supabase psql -U postgres -f /supabase/migrations/20240321000000_create_learning_paths.sql

# Run seed data
docker-compose exec supabase psql -U postgres -f /docker-entrypoint-initdb.d/seed.sql

# Run the course schema creation SQL
echo "Creating course tables..."
docker-compose exec supabase psql -U postgres -f /docker-entrypoint-initdb.d/create-course-tables.sql

# Run the educational paths schema creation SQL
echo "Creating educational paths..."
docker-compose exec supabase psql -U postgres -f /docker-entrypoint-initdb.d/create-educational-paths.sql

# Run the user performance schema creation SQL
echo "Creating user performance schema..."
docker-compose exec supabase psql -U postgres -f /docker-entrypoint-initdb.d/create-user-performance-schema.sql

echo "Supabase setup complete!" 