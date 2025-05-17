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

echo "Supabase setup complete!" 