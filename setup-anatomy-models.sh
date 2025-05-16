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

# Function to download and extract models
download_model() {
  local system=$1
  local url=$2
  local output_dir="public/models/anatomy/$system"
  
  echo "Downloading $system models..."
  curl -L "$url" -o "$output_dir/models.zip"
  unzip -o "$output_dir/models.zip" -d "$output_dir"
  rm "$output_dir/models.zip"
}

# Download models from reliable sources (replace with actual URLs)
echo "Downloading anatomical models..."

# Basic skeletal system models
download_model "skeletal" "https://example.com/models/skeletal-system.zip"

# Muscular system models
download_model "muscular" "https://example.com/models/muscular-system.zip"

# Nervous system models
download_model "nervous" "https://example.com/models/nervous-system.zip"

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

# Create placeholders for all systems
for system in skeletal muscular nervous circulatory respiratory brain heart digestive reproductive lymphatic body_parts full_body organs; do
  create_placeholder "$system"
done

echo "Setup complete! You can now run your application with the enhanced 3D Anatomy Model."
echo "Note: Some models are using placeholders. Replace them with actual models when available."
echo ""
echo "To publish the project to GitHub, you'll need to:"
echo "1. Create a GitHub repository"
echo "2. Initialize Git in this project: git init"
echo "3. Add files: git add ."
echo "4. Commit: git commit -m 'Enhanced 3D anatomy visualization'"
echo "5. Add remote: git remote add origin <your-github-repo-url>"
echo "6. Push: git push -u origin main" 