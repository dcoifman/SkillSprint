#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  source .env.local
fi

# Check if SUPABASE_URL is set
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
  echo "Error: REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY is not set."
  echo "Please set these environment variables and try again."
  exit 1
fi

echo "Testing Edge Function: test-api"
echo "URL: $REACT_APP_SUPABASE_URL/functions/v1/test-api"

# Make the request
curl -X POST "$REACT_APP_SUPABASE_URL/functions/v1/test-api" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REACT_APP_SUPABASE_ANON_KEY" \
  --data "{}" \
  | jq

# Check if the request was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to make request to Edge Function."
  exit 1
fi

echo "Request completed." 