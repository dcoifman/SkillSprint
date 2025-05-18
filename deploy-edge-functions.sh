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

# Source environment variables
source .env.local

# Check for required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: Missing required environment variables in .env.local"
    echo "Please ensure SUPABASE_URL, SUPABASE_KEY, and GEMINI_API_KEY are set."
    exit 1
fi

echo "Deploying Supabase Edge Functions..."

# Deploy the generate-personalized-path function
echo "Deploying generate-personalized-path function..."
cd supabase/functions
supabase functions deploy generate-personalized-path --project-ref "$SUPABASE_PROJECT_ID" --no-verify-jwt

# Set secrets for the function
echo "Setting function secrets..."
supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref "$SUPABASE_PROJECT_ID"

echo "Deployment complete!" 