#!/bin/bash

# Fix 3D Anatomy Model Issues
# This script checks model files for JSON/XML errors and replaces broken files with placeholders

echo "Checking and fixing 3D anatomy model files..."

# Function to check if a file is a valid GLB/GLTF file
check_model_file() {
  local file=$1
  local first_bytes=$(head -c 20 "$file" | tr -d '\0')
  
  # Check if file starts with XML/HTML indicators (error responses)
  if [[ "$first_bytes" == *"<?xml"* || "$first_bytes" == *"<!DOCTYPE"* || "$first_bytes" == *"<html"* || "$first_bytes" == *"<e>"* ]]; then
    echo "✗ Error: $file contains XML/HTML content (likely an error response)"
    return 1
  fi
  
  # For JSON-based GLB files, they should start with JSON structure
  if [[ "$first_bytes" == "{"* ]]; then
    echo "✓ Good: $file appears to be valid JSON-based GLB"
    return 0
  fi
  
  # For binary GLB files, check for the magic bytes
  if [[ $(hexdump -n 4 -e '4/1 "%02X"' "$file") == "676C5446" ]]; then
    echo "✓ Good: $file appears to be valid binary GLB"
    return 0
  fi
  
  echo "✗ Error: $file has unknown format"
  return 1
}

# Function to create a placeholder model
create_placeholder() {
  local target_dir=$1
  local filename=$2
  local output_file="$target_dir/$filename"
  
  echo "Creating placeholder for $output_file"
  
  # Create a simple JSON-based placeholder
  echo '{
  "asset": {
    "version": "2.0",
    "generator": "Three.js GLB Placeholder"
  },
  "scene": 0,
  "scenes": [{
    "nodes": [0]
  }],
  "nodes": [{
    "mesh": 0,
    "name": "Placeholder"
  }],
  "meshes": [{
    "primitives": [{
      "attributes": {
        "POSITION": 0
      },
      "mode": 4
    }]
  }],
  "accessors": [{
    "bufferView": 0,
    "componentType": 5126,
    "count": 3,
    "max": [1, 1, 0],
    "min": [-1, -1, 0],
    "type": "VEC3"
  }],
  "bufferViews": [{
    "buffer": 0,
    "byteOffset": 0,
    "byteLength": 36
  }],
  "buffers": [{
    "byteLength": 36,
    "uri": "data:application/octet-stream;base64,AACAPwAAgD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAMAAAABAAAAAwAAAAIAAAAEAAAA"
  }]
}' > "$output_file"
}

# Function to copy a working model to replace a broken one
copy_replacement() {
  local source=$1
  local destination=$2
  
  echo "Replacing broken model with working model from $source"
  cp "$source" "$destination"
}

# Create base directories for models if they don't exist
mkdir -p public/models/anatomy/{skeletal,muscular,nervous,circulatory,respiratory,brain,heart,digestive,reproductive,lymphatic,body_parts,full_body,organs}

# Check anatomical models in each directory
ANATOMY_DIRS=(
  "public/models/anatomy/skeletal"
  "public/models/anatomy/muscular"
  "public/models/anatomy/nervous"
  "public/models/anatomy/circulatory"
  "public/models/anatomy/respiratory"
  "public/models/anatomy/brain"
  "public/models/anatomy/heart"
  "public/models/anatomy/digestive"
  "public/models/anatomy/reproductive"
  "public/models/anatomy/lymphatic"
  "public/models/anatomy/full_body"
  "public/models/anatomy/body_parts"
  "public/models/anatomy/organs"
)

# Known good replacement models
SKELETAL_MODEL="public/models/anatomy/skeletal/skeletal-system-gyozocz.glb"
CIRC_MODEL="public/models/anatomy/circulatory/vascular-system-gyozocz.glb"
DIGESTIVE_MODEL="public/models/anatomy/digestive/abdominal-organs-gyozocz.glb"

# Check each directory
for dir in "${ANATOMY_DIRS[@]}"; do
  echo "Checking models in $dir..."
  
  # Ensure placeholder exists in each directory
  create_placeholder "$dir" "placeholder.glb"
  
  # Check each GLB file
  for model in "$dir"/*.glb; do
    # Skip placeholder files
    if [[ "$(basename "$model")" == "placeholder.glb" ]]; then
      continue
    fi
    
    echo "Checking $model..."
    if ! check_model_file "$model"; then
      # Determine replacement model based on the directory
      if [[ "$dir" == *"circulatory"* || "$dir" == *"heart"* || "$dir" == *"respiratory"* ]]; then
        # Use circulatory model for these systems
        if [[ -f "$CIRC_MODEL" ]] && check_model_file "$CIRC_MODEL"; then
          copy_replacement "$CIRC_MODEL" "$model"
        else
          create_placeholder "$dir" "$(basename "$model")"
        fi
      elif [[ "$dir" == *"digestive"* || "$dir" == *"reproductive"* || "$dir" == *"organs"* ]]; then
        # Use digestive model for these systems
        if [[ -f "$DIGESTIVE_MODEL" ]] && check_model_file "$DIGESTIVE_MODEL"; then
          copy_replacement "$DIGESTIVE_MODEL" "$model"
        else
          create_placeholder "$dir" "$(basename "$model")"
        fi
      else
        # Use skeletal model for all other systems
        if [[ -f "$SKELETAL_MODEL" ]] && check_model_file "$SKELETAL_MODEL"; then
          copy_replacement "$SKELETAL_MODEL" "$model"
        else
          create_placeholder "$dir" "$(basename "$model")"
        fi
      fi
    fi
  done
done

echo "Model check and fix complete!"
echo "You may need to restart your application to see the changes." 