#!/bin/bash

# Ensure Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit https://supabase.io/docs/guides/cli for installation instructions."
    exit 1
fi

# Set up environment variables
echo "Setting up environment variables..."
source .env.local

# Start Supabase local development
echo "Starting Supabase local development..."
supabase start

# Get database connection string
DB_URL=$(supabase status --output json | jq -r '.db_url')

# Execute SQL script using psql directly
echo "Creating educational paths in the database..."
PGPASSWORD=$DB_PASSWORD psql -h 127.0.0.1 -p 54322 -U postgres -d skill-sprint -f ./create-educational-paths.sql

# Verify insertion
echo "Verifying data insertion..."
PGPASSWORD="${PGPASSWORD}" psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f ./verify-educational-paths.sql

echo "Educational paths have been loaded successfully!" 