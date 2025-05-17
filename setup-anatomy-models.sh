#!/bin/bash

# Script to set up dependencies for the enhanced 3D anatomy viewer

echo "Installing required dependencies for 3D Anatomy Model Visualization..."

# Install core React Three Fiber dependencies
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing

# Install animation and physics libraries
npm install @react-spring/three @react-spring/web zustand

# Install model loaders and utilities
npm install three-stdlib draco3d gltfjsx 

# Install necessary Chakra UI icons
npm install @chakra-ui/icons

echo "Creating anatomical model repository structure..."

# Create base directories for models
mkdir -p public/models/anatomy/{skeletal,muscular,nervous,circulatory,respiratory,brain,heart,digestive,reproductive,lymphatic,body_parts,full_body,organs}

# Create placeholder models for missing files
create_placeholder() {
  local system=$1
  local output_dir="public/models/anatomy/$system"
  
  if [ ! -f "$output_dir/placeholder.glb" ]; then
    echo "Creating placeholder for $system..."
    # Create a simple cube placeholder using Three.js
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
      "buffers": [{
        "byteLength": 36,
        "uri": "data:application/octet-stream;base64,AAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAACAPwAAgD8="
      }]
    }' > "$output_dir/placeholder.glb"
  fi
}

# Check if running in CI environment
if [ -n "$CI" ]; then
  echo "Running in CI environment - using placeholders for all models"
  SYSTEMS=(skeletal muscular nervous circulatory respiratory brain heart digestive reproductive lymphatic)
  for system in "${SYSTEMS[@]}"; do
    create_placeholder "$system"
  done
else
  # Function to download and extract models with error handling
  download_model() {
    local system=$1
    local url=$2
    local output_dir="public/models/anatomy/$system"
    local max_retries=3
    local retry_count=0
    
    echo "Downloading $system models..."
    
    while [ $retry_count -lt $max_retries ]; do
      if curl -L --fail "$url" -o "$output_dir/models.zip"; then
        if unzip -o "$output_dir/models.zip" -d "$output_dir"; then
          rm "$output_dir/models.zip"
          echo "Successfully downloaded and extracted $system models"
          return 0
        else
          echo "Failed to extract $system models"
        fi
      else
        echo "Failed to download $system models (attempt $((retry_count + 1)))"
      fi
      
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt $max_retries ]; then
        echo "Retrying in 5 seconds..."
        sleep 5
      fi
    done
    
    echo "Failed to download $system models after $max_retries attempts"
    return 1
  }

  # Download models from reliable sources
  echo "Downloading anatomical models..."

  # Model URLs (replace with actual URLs from your storage)
  MODELS=(
    "skeletal:https://storage.example.com/models/skeletal-system.zip"
    "muscular:https://storage.example.com/models/muscular-system.zip"
    "nervous:https://storage.example.com/models/nervous-system.zip"
    "circulatory:https://storage.example.com/models/circulatory-system.zip"
    "respiratory:https://storage.example.com/models/respiratory-system.zip"
    "brain:https://storage.example.com/models/brain-system.zip"
    "heart:https://storage.example.com/models/heart-system.zip"
    "digestive:https://storage.example.com/models/digestive-system.zip"
    "reproductive:https://storage.example.com/models/reproductive-system.zip"
    "lymphatic:https://storage.example.com/models/lymphatic-system.zip"
  )

  # Download each model
  for model in "${MODELS[@]}"; do
    IFS=':' read -r system url <<< "$model"
    if ! download_model "$system" "$url"; then
      echo "Creating placeholder for $system due to download failure"
      create_placeholder "$system"
    fi
  done
fi

echo "Setup complete! You can now run your application with the enhanced 3D Anatomy Model."
if [ -n "$CI" ]; then
  echo "Note: Running in CI environment - all models are placeholders"
else
  echo "Note: Some models may be using placeholders. Replace them with actual models when available."
  echo ""
  echo "Important: You need to update the model URLs in this script with actual URLs to your model files."
  echo "The current URLs are placeholders and will not work."
fi

echo ""
echo "To publish the project to GitHub, you'll need to:"
echo "1. Create a GitHub repository"
echo "2. Initialize Git in this project: git init"
echo "3. Add files: git add ."
echo "4. Commit: git commit -m 'Enhanced 3D anatomy visualization'"
echo "5. Add remote: git remote add origin <your-github-repo-url>"
echo "6. Push: git push -u origin main" 