#!/bin/bash

# First download the course image
./setup-egypt-course-image.sh

# Make sure npm dependencies are installed
npm install @supabase/supabase-js dotenv

# Check if Supabase is running
if ! docker-compose ps | grep -q "supabase"; then
  echo "Starting Supabase containers..."
  docker-compose up -d
  
  # Wait for Supabase to be ready
  echo "Waiting for Supabase to be ready..."
  sleep 10
fi

# Execute the deployment script
echo "Deploying Ancient Egypt course to Supabase..."
node push-egypt-course.js

echo "Deployment complete!" 