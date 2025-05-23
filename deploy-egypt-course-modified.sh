#!/bin/bash

# Check for required environment variables
if [ ! -f .env.local ]; then
  echo "Error: .env.local file not found"
  echo "Please create a .env.local file with your Supabase credentials:"
  echo "REACT_APP_SUPABASE_URL=your_supabase_url"
  echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
  echo ""
  echo "You can find the service role key in your Supabase dashboard:"
  echo "1. Go to https://app.supabase.com"
  echo "2. Click on your project"
  echo "3. Go to Project Settings > API"
  echo "4. Copy the 'service_role' key (not the 'anon' key)"
  exit 1
fi

# First download the course image
./setup-egypt-course-image.sh

# Make sure npm dependencies are installed
npm install @supabase/supabase-js dotenv

# Execute the deployment script
echo "Deploying Ancient Egypt course to production Supabase..."
node push-egypt-course-modified.js

echo "Deployment complete!" 