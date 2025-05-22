#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p public/path-images

# Download an image of Egyptian pyramids 
curl -o public/path-images/ancient-egypt-pyramids.jpg https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3

echo "Ancient Egypt course image downloaded and placed in public/path-images/" 