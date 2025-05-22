#!/bin/bash

# Script to deploy Supabase Edge Functions

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Ensure we have environment variables
if [ ! -f .env.local ]; then
    echo "Error: No .env.local file found. Please create one with your Supabase credentials."
    exit 1
fi

# Extract environment variables from .env.local
SUPABASE_URL=$(grep REACT_APP_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_KEY=$(grep REACT_APP_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
GEMINI_API_KEY=$(grep REACT_APP_GEMINI_API_KEY .env.local | cut -d '=' -f2)

# Extract project ID from URL
SUPABASE_PROJECT_ID=$(echo $SUPABASE_URL | cut -d '/' -f3 | cut -d '.' -f1)

# Check for required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$GEMINI_API_KEY" ] || [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Error: Missing required environment variables in .env.local"
    echo "Please ensure REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, and REACT_APP_GEMINI_API_KEY are set."
    exit 1
fi

echo "Deploying Supabase Edge Functions..."
echo "Project ID: $SUPABASE_PROJECT_ID"

# Deploy the generate-personalized-path function
echo "Deploying generate-personalized-path function..."
cd supabase/functions
supabase functions deploy generate-personalized-path --project-ref "$SUPABASE_PROJECT_ID" --no-verify-jwt

# Set secrets for the function
echo "Setting function secrets..."
supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref "$SUPABASE_PROJECT_ID"

echo "Deployment complete!" 