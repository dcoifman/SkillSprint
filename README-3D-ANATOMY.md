# Advanced 3D Anatomy Visualization

![3D Anatomy Visualization](https://i.imgur.com/JZkXsfw.jpg)

A professional-grade interactive 3D anatomy visualization component built with React Three Fiber. This component provides high-quality anatomical models with medical-grade visualization techniques for educational purposes.

## Features

- **High-quality anatomical models** - Detailed 3D models of different body systems
- **Interactive exploration** - Select and examine individual anatomical structures
- **Multiple viewing modes**:
  - Standard anatomical views (anterior, posterior, lateral, etc.)
  - X-ray visualization
  - Performance-optimized quality settings
- **Professional medical visualization techniques**:
  - Ambient occlusion for depth perception
  - Subsurface scattering for realistic tissue
  - Structure highlighting and selection
  - Anatomical annotations
- **Educational tools**:
  - Structure information panels
  - Screenshot capability for study materials
  - Performance optimization for all devices

## Systems Available

- **Skeletal System** - Detailed bone structure visualization
- **Muscular System** - Comprehensive muscle visualization
- **Nervous System** - Central and peripheral nervous system
- **Circulatory System** - Heart and major blood vessels
- **Respiratory System** - Lungs and airways with breathing animation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/3d-anatomy-visualization.git

# Change to the project directory
cd 3d-anatomy-visualization

# Run the setup script to install dependencies
./setup-anatomy-models.sh

# Start the development server
npm start
```

## Usage

```jsx
import React, { useState } from 'react';
import ThreeDAnatomyModel from './components/ThreeDAnatomyModel';

function AnatomyViewer() {
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [systemType, setSystemType] = useState('skeletal');
  
  return (
    <div>
      <h1>Interactive Anatomy Explorer</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setSystemType('skeletal')}>Skeletal</button>
        <button onClick={() => setSystemType('muscular')}>Muscular</button>
        <button onClick={() => setSystemType('nervous')}>Nervous</button>
        <button onClick={() => setSystemType('circulatory')}>Circulatory</button>
        <button onClick={() => setSystemType('respiratory')}>Respiratory</button>
      </div>
      
      <ThreeDAnatomyModel
        systemType={systemType}
        initialView="anterior"
        onSelectStructure={setSelectedStructure}
        selectedStructure={selectedStructure}
      />
      
      {selectedStructure && (
        <div>
          <h2>Selected Structure: {selectedStructure}</h2>
          {/* Structure details would go here */}
        </div>
      )}
    </div>
  );
}

export default AnatomyViewer;
```

## Component API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `systemType` | string | `'skeletal'` | Type of anatomical system to display. Options: `'skeletal'`, `'muscular'`, `'nervous'`, `'circulatory'`, `'respiratory'` |
| `initialView` | string | `'anterior'` | Initial viewing angle. Options: `'anterior'`, `'posterior'`, `'lateral'`, `'superior'`, `'inferior'` |
| `onSelectStructure` | function | - | Callback function when a structure is selected. Receives structure name as parameter. |
| `selectedStructure` | string | `null` | Currently selected structure name. Set to `null` to clear selection. |

## Technologies Used

- **React** - UI framework
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **React-Spring** - Animation library
- **PostProcessing** - Advanced visual effects
- **Chakra UI** - UI components

## Performance Optimization

The component includes several performance optimizations:

1. **Quality settings** - Adjust rendering quality based on device capabilities
2. **Model caching** - Pre-load and cache models for faster switching
3. **Adaptive rendering** - Automatically reduces effects on lower-end devices
4. **Shadow optimization** - Baked shadows for better performance
5. **Suspense and lazy loading** - Only load what's needed

## Customization

### Adding Custom Models

You can add your own anatomical models by placing them in the `public/models/anatomy/` directory and updating the `MODELS` configuration in the component:

```jsx
const MODELS = {
  custom: {
    path: '/models/anatomy/custom/my-model.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  // ... existing models
};
```

### Structure Metadata

Add information about anatomical structures by updating the `STRUCTURE_DATA` object:

```jsx
const STRUCTURE_DATA = {
  'My Structure': { 
    description: 'Description of the structure and its function', 
    color: '#f0e6d2' 
  },
  // ... existing structures
};
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Anatomical models from [BioDigital Human](https://www.biodigital.com/)
- Textures and materials from [drei-assets](https://github.com/pmndrs/drei-assets)
- Educational content reviewed by medical professionals

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 