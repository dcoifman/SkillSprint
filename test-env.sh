#!/bin/bash

# This script sets temporary environment variables for testing the login page
# Replace these with your actual Supabase project values before running

echo "Setting temporary Supabase environment variables for testing..."

# Set environment variables (these will only be available for the duration of this script)
export REACT_APP_SUPABASE_URL="https://your-actual-project-id.supabase.co"
export REACT_APP_SUPABASE_ANON_KEY="your-actual-anon-key"

# Echo the environment variables to confirm they're set
echo "REACT_APP_SUPABASE_URL: $REACT_APP_SUPABASE_URL"
echo "REACT_APP_SUPABASE_ANON_KEY: $REACT_APP_SUPABASE_ANON_KEY"

echo "Starting the application with Supabase environment variables..."

# Run the application with the environment variables set
npm start

# Note: These environment variables will only be available during the execution of this script
# For permanent configuration, add them to your .env.local file 