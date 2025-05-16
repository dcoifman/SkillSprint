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

# Create directories for models if they don't exist
mkdir -p public/models/anatomy/{skeletal,muscular,nervous,circulatory,respiratory}

echo "Setup complete! You can now run your application with the enhanced 3D Anatomy Model."
echo "To publish the project to GitHub, you'll need to:"
echo "1. Create a GitHub repository"
echo "2. Initialize Git in this project: git init"
echo "3. Add files: git add ."
echo "4. Commit: git commit -m 'Enhanced 3D anatomy visualization'"
echo "5. Add remote: git remote add origin <your-github-repo-url>"
echo "6. Push: git push -u origin main" 