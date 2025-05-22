import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Html,
  Bounds,
  PerspectiveCamera,
  SpotLight,
  MeshReflectorMaterial,
  PerformanceMonitor,
  AccumulativeShadows,
  RandomizedLight,
  BakeShadows
} from '@react-three/drei';
import { Group, Mesh, Object3D, AmbientLight } from 'three';
import { Box, VStack, Button, ButtonGroup, Badge, Text, Spinner, useColorModeValue, Flex, Tooltip, IconButton, Menu, MenuButton, MenuList, MenuItem, Image } from '@chakra-ui/react';
import { EffectComposer, Outline, SSAO } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { ChevronDownIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import ErrorBoundary from './ErrorBoundary.js';
import { SRGBColorSpace } from 'three';
import PropTypes from 'prop-types';

// Enable color management
THREE.ColorManagement.enabled = true;

// Cache for loaded models to improve performance
const modelCache = new Map();

// Model source configurations
const MODELS = {
  skeletal: {
    path: '/models/anatomy/skeletal/skeleton-better.glb',
    scale: 1.8,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  skeletal_alt: {
    path: '/models/anatomy/skeletal/skeletal-system-gyozocz.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  skull: {
    path: '/models/anatomy/skeletal/skull.glb',
    scale: 1.2,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  muscular: {
    path: '/models/anatomy/muscular/muscular-better.glb',
    scale: 1.8,
    position: [0, -1.7, 0],
    rotation: [0, Math.PI, 0],
  },
  nervous: {
    path: '/models/anatomy/nervous/nervous-better.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  brain: {
    path: '/models/anatomy/brain/brain-detailed.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  circulatory: {
    path: '/models/anatomy/circulatory/vascular-system-gyozocz.glb',
    scale: 1.5, 
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  heart: {
    path: '/models/anatomy/heart/heart-detailed.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  respiratory: {
    path: '/models/anatomy/respiratory/respiratory-better.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  lungs: {
    path: '/models/anatomy/respiratory/lungs-high-poly.glb',
    scale: 1.2,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  digestive: {
    path: '/models/anatomy/digestive/abdominal-organs-gyozocz.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  male_body: {
    path: '/models/anatomy/body_parts/male_body.glb',
    scale: 1.8,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  full_skeleton: {
    path: '/models/anatomy/full_body/human_skeleton.glb',
    scale: 0.5,
    position: [0, -1.7, 0], 
    rotation: [0, 0, 0],
  },
  reproductive_male: {
    path: '/models/anatomy/reproductive/reproductive-male.glb',
    scale: 1.2,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  reproductive_female: {
    path: '/models/anatomy/reproductive/reproductive-female.glb',
    scale: 1.2,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  lymphatic: {
    path: '/models/anatomy/lymphatic/lymphatic-system.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
};

// Anatomical structure metadata for annotations
const STRUCTURE_DATA = {
  // Skeletal system
  'Cranium': { description: 'Houses and protects the brain', color: '#f0e6d2' },
  'Humerus': { description: 'Upper arm bone connecting shoulder to elbow', color: '#f0e6d2' },
  'Femur': { description: 'Thigh bone, the largest and strongest in the body', color: '#f0e6d2' },
  'Vertebrae': { description: 'Bones that form the spinal column, protecting the spinal cord', color: '#f0e6d2' },
  'Clavicle': { description: 'Collarbone, connecting sternum to shoulder', color: '#f0e6d2' },
  'Radius': { description: 'Forearm bone on the thumb side', color: '#f0e6d2' },
  'Ulna': { description: 'Forearm bone on the pinky side', color: '#f0e6d2' },
  'Sternum': { description: 'Breastbone, connects the ribs', color: '#f0e6d2' },
  'Ribs': { description: 'Curved bones protecting the chest cavity', color: '#f0e6d2' },
  'Pelvis': { description: 'Basin-shaped structure supporting the spinal column', color: '#f0e6d2' },
  
  // Muscular system
  'Biceps Brachii': { description: 'Flexes the elbow and supinates the forearm', color: '#a83232' },
  'Triceps Brachii': { description: 'Extends the elbow joint', color: '#a83232' },
  'Deltoid': { description: 'Shoulder muscle enabling arm abduction', color: '#a83232' },
  'Pectoralis Major': { description: 'Large chest muscle for arm movement', color: '#a83232' },
  'Latissimus Dorsi': { description: 'Large back muscle for arm adduction', color: '#a83232' },
  'Quadriceps': { description: 'Group of four muscles that extend the knee', color: '#a83232' },
  'Hamstrings': { description: 'Posterior thigh muscles that flex the knee', color: '#a83232' },
  'Gastrocnemius': { description: 'Calf muscle for plantar flexion', color: '#a83232' },
  'Trapezius': { description: 'Upper back muscle moving the scapula', color: '#a83232' },
  'Abdominals': { description: 'Core muscles stabilizing the trunk', color: '#a83232' },
};

// Helper to load 3D models with caching and fallback for performance
function useAnatomyModel(systemType) {
  const [modelError, setModelError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  
  // Get model configuration
  const modelConfig = MODELS[systemType];
  const modelPath = modelConfig?.path;
  
  // Define fallback model paths for when the primary model fails
  const fallbackMap = {
    'muscular': '/models/anatomy/male_body/male_body.glb',
    'skull': '/models/anatomy/male_body/male_body.glb',
    'nervous': '/models/anatomy/male_body/male_body.glb',
    'brain': '/models/anatomy/male_body/male_body.glb',
    'heart': '/models/anatomy/male_body/male_body.glb',
    'lungs': '/models/anatomy/male_body/male_body.glb',
    'respiratory': '/models/anatomy/male_body/male_body.glb',
    'reproductive_male': '/models/anatomy/male_body/male_body.glb',
    'reproductive_female': '/models/anatomy/male_body/male_body.glb',
    'lymphatic': '/models/anatomy/male_body/male_body.glb',
    'skeletal': '/models/anatomy/male_body/male_body.glb',
    'skeletal_alt': '/models/anatomy/male_body/male_body.glb',
    'circulatory': '/models/anatomy/male_body/male_body.glb',
    'digestive': '/models/anatomy/male_body/male_body.glb'
  };
  
  // Default placeholder that's known to exist
  const placeholderPath = '/models/anatomy/male_body/male_body.glb';
  const fallbackPath = fallbackMap[systemType] || placeholderPath;

  // Always call useGLTF for both paths (never conditionally)
  let primaryModel, primaryError, fallbackModel, fallbackError;
  try {
    const result = useGLTF(modelPath);
    primaryModel = result;
    primaryError = null;
  } catch (e) {
    primaryModel = null;
    primaryError = e;
  }
  try {
    const result = useGLTF(fallbackPath);
    fallbackModel = result;
    fallbackError = null;
  } catch (e) {
    fallbackModel = null;
    fallbackError = e;
  }

  useEffect(() => {
    setLoadAttempted(true);
    if (primaryError && !fallbackError) {
      setModelError(true);
      setIsPlaceholder(true);
    } else if (primaryError && fallbackError) {
      setModelError(true);
      setIsPlaceholder(true);
    } else {
      setModelError(false);
      setIsPlaceholder(false);
    }
  }, [primaryError, fallbackError]);

  // Select which model to use
  const model = primaryModel || fallbackModel || null;

  // Extract scene, nodes, materials, animations from the model
  const { scene, nodes, materials, animations } = model || {};
  
  // Apply model-specific transformations
  useEffect(() => {
    if (!scene) return;
    const config = MODELS[systemType];
    scene.scale.set(config.scale, config.scale, config.scale);
    scene.position.set(...config.position);
    scene.rotation.set(...config.rotation);
    scene.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        if (object.material) {
          object.material.roughness = 0.7;
          object.material.metalness = 0.2;
          if (systemType === 'skeletal') {
            object.material.color = new THREE.Color('#f0e6d2').convertSRGBToLinear();
          } else if (systemType === 'muscular') {
            object.material.color = new THREE.Color('#a83232').convertSRGBToLinear();
          }
        }
      }
    });
  }, [scene, systemType]);

  return { scene, nodes, materials, animations, modelError, loadAttempted, isPlaceholder };
}

// Component to handle model selection and highlighting
const AnatomicalModel = React.forwardRef(({ 
  systemType, 
  onSelectStructure, 
  selectedStructure, 
  hoveredStructure, 
  setHoveredStructure 
}, ref) => {
  const { scene } = useAnatomyModel(systemType);
  const highlightMaterial = useRef(new THREE.MeshStandardMaterial({ 
    color: new THREE.Color('#9f7aea'),
    emissive: new THREE.Color('#9f7aea'),
    emissiveIntensity: 0.5,
    roughness: 0.5,
    metalness: 0.3
  }));
  
  // Store original materials for resetting
  const originalMaterials = useRef(new Map());
  
  // Handle click event
  const handleClick = (event) => {
    event.stopPropagation();
    if (event.object.name && STRUCTURE_DATA[event.object.name]) {
      onSelectStructure(event.object.name);
    }
  };

  // Handle pointer over event
  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (event.object.name && STRUCTURE_DATA[event.object.name]) {
      setHoveredStructure(event.object.name);
      }
  };

  // Handle pointer out event
  const handlePointerOut = () => {
    setHoveredStructure(null);
  };
  
  // Apply highlight material to selected or hovered structure
  const highlightStructure = React.useCallback((structureName) => {
    if (!scene) return;
    scene.traverse((object) => {
      if (object.isMesh && object.name === structureName) {
        // Store original material if not already saved
        if (!originalMaterials.current.has(structureName)) {
          originalMaterials.current.set(structureName, object.material);
        }
        
        // Apply highlight material
        object.material = highlightMaterial.current;
      }
    });
  }, [scene]);
  
  // Reset material to original
  const resetMaterial = React.useCallback((structureName) => {
    if (!scene) return;
    scene.traverse((object) => {
      if (object.isMesh && object.name === structureName) {
        const originalMaterial = originalMaterials.current.get(structureName);
        if (originalMaterial) {
          object.material = originalMaterial;
        }
      }
    });
  }, [scene]);
  
  // Apply highlight to selected structure
  useEffect(() => {
    if (selectedStructure) {
      highlightStructure(selectedStructure);
    }
    
    return () => {
      if (selectedStructure) {
        resetMaterial(selectedStructure);
      }
    };
  }, [selectedStructure, highlightStructure, resetMaterial]);
  
  // Animation for breathing or subtle movement
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      
      if (systemType === 'respiratory') {
        // Breathing animation for respiratory system
        ref.current.scale.set(
          1 + Math.sin(t * 0.5) * 0.01,
          1 + Math.sin(t * 0.5) * 0.01,
          1 + Math.sin(t * 0.5) * 0.01
        );
      } else {
        // Subtle movement for all other systems
        ref.current.position.y = Math.sin(t * 0.2) * 0.02;
        ref.current.rotation.y = Math.sin(t * 0.1) * 0.01;
      }
    }
  });
  
  return (
    <Mesh ref={ref}>
      {scene && (
        <primitive 
          object={scene} 
          onClick={handleClick} 
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      )}
      
      {/* Labels for selected structures */}
      {(selectedStructure || hoveredStructure) && (
        <Html position={[0, 0.5, 0]} center>
          <Badge 
            colorScheme="purple" 
            px={3} 
            py={1.5} 
            borderRadius="full"
            boxShadow="lg"
            fontSize="md"
          >
            {selectedStructure || hoveredStructure}
          </Badge>
        </Html>
      )}
    </Mesh>
  );
});

// Add display name and prop types
AnatomicalModel.displayName = 'AnatomicalModel';

AnatomicalModel.propTypes = {
  systemType: PropTypes.oneOf(Object.keys(MODELS)).isRequired,
  onSelectStructure: PropTypes.func.isRequired,
  selectedStructure: PropTypes.string,
  hoveredStructure: PropTypes.string,
  setHoveredStructure: PropTypes.func.isRequired,
};

// Enhanced Scene with medical visualization features
function EnhancedScene({ 
  systemType, 
  onSelectStructure, 
  selectedStructure, 
  hoveredStructure, 
  setHoveredStructure, 
  view,
  sliceView,
  quality,
  xRay,
  onLoad,
  onError,
}) {
  const controlsRef = useRef();
  const spotLightRef = useRef();
  const normalPassRef = useRef();
  const { camera, gl } = useThree();
  const [performanceMode, setPerformanceMode] = useState(false);
  const anatomicalModelRef = useRef();
  
  // Set camera position based on view
  useEffect(() => {
    if (view === 'anterior') {
      camera.position.set(0, 0, 4);
    } else if (view === 'posterior') {
      camera.position.set(0, 0, -4);
    } else if (view === 'lateral') {
      camera.position.set(4, 0, 0);
    } else if (view === 'superior') {
      camera.position.set(0, 4, 0);
    } else if (view === 'inferior') {
      camera.position.set(0, -4, 0);
    }
    
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [view, camera]);

  useEffect(() => {
    gl.physicallyCorrectLights = true;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  useEffect(() => {
    if (scene) {
      scene.fog = new THREE.Fog('#03080f', 5, 20);
    }
  }, [scene]);

  return (
    <>
      {/* Performance monitoring */}
      <PerformanceMonitor onDecline={() => setPerformanceMode(true)} onIncline={() => setPerformanceMode(false)} />
      
      {/* Scene environment */}
      <AmbientLight intensity={0.5} />
      
      {/* Enhanced lighting setup */}
      <SpotLight 
        ref={spotLightRef}
        position={[5, 5, 5]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={1.5} 
        distance={10}
        castShadow 
        shadow-mapSize={1024}
        color="#ffffff"
      />
      
      {/* Fill light */}
      <SpotLight 
        position={[-3, 2, 3]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={0.8} 
        distance={10}
        castShadow={false}
        color="#b3ccff"
      />
      
      {/* Rim light for edge definition */}
      <SpotLight 
        position={[0, 3, -5]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={0.7} 
        distance={10}
        castShadow={false}
        color="#ffcca3"
      />
      
      {/* Camera setup */}
      <PerspectiveCamera makeDefault fov={30} position={[0, 0, 4]} near={0.1} far={100} />
      <OrbitControls 
        ref={controlsRef} 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        minDistance={2}
        maxDistance={10}
        dampingFactor={0.05}
        rotateSpeed={0.8}
        zoomSpeed={0.8}
      />
      
      {/* Model container with bounds for auto-fitting */}
      <Bounds fit clip observe damping={0.2} margin={1.2}>
          <AnatomicalModel 
            ref={anatomicalModelRef}
            systemType={systemType} 
            onSelectStructure={onSelectStructure} 
            selectedStructure={selectedStructure}
            hoveredStructure={hoveredStructure}
            setHoveredStructure={setHoveredStructure}
          />
      </Bounds>
      
      {/* Advanced ground reflection */}
      <Mesh rotation-x={-Math.PI / 2} position={[0, -2, 0]} receiveShadow>
        <Primitive object={new THREE.PlaneGeometry(30, 30)} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#030303"
          metalness={0.8}
          mirror={0.5}
        />
      </Mesh>
      
      {/* Accumulated shadows for realism */}
      <AccumulativeShadows 
        temporal
        frames={performanceMode ? 1 : 30}
        alphaTest={0.8}
        scale={12}
        position={[0, -1.99, 0]}
        opacity={0.8}
      >
        <RandomizedLight 
          amount={8}
          radius={10}
          intensity={0.8}
          ambient={0.5}
          position={[5, 5, -10]}
        />
      </AccumulativeShadows>
      
      {/* Environment map for reflections */}
      <Environment preset="city" />
      
      {/* Shadow optimization */}
      <BakeShadows />
      
      {/* Post-processing effects */}
        <EffectComposer multisampling={quality === 'high' ? 8 : quality === 'medium' ? 4 : 0} enabled={!performanceMode}>
          <Outline 
            selection={hoveredStructure || selectedStructure ? 1 : 0}
            selectionLayer={1}
          visibleEdgeColor={hoveredStructure ? 0x4a9eff : 0x9f7aea}
          hiddenEdgeColor={hoveredStructure ? 0x4a9eff : 0x9f7aea}
          blur={2}
          />
              <SSAO
          radius={0.4}
          intensity={30}
          luminanceInfluence={0.5}
          bias={0.5}
        />
        </EffectComposer>
    </>
  );
}

// Main component
const ThreeDAnatomyModel = ({ 
  systemType = 'skeletal',
  initialView = 'anterior',
  onSelectStructure,
  selectedStructure,
  onError = () => {},
  fallbackImage,
}) => {
  const [view, setView] = useState(initialView);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [quality] = useState('high');
  const [xRay] = useState(false);
  const [hoveredStructure, setHoveredStructure] = useState(null);
  const [sliceView] = useState('none');
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentSystem, setCurrentSystem] = useState(systemType);
  const [error, setError] = useState(null);
  
  // UI styling
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Handle WebGL context loss
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWebGLContextLost = (event) => {
      event.preventDefault();
      setError(new Error('WebGL context lost. Please refresh the page.'));
      onError(new Error('WebGL context lost'));
    };

    const handleWebGLContextRestored = () => {
      setError(null);
      setLoading(true);
      // Trigger model reload
      setCurrentSystem(prev => prev);
    };

    canvas.addEventListener('webglcontextlost', handleWebGLContextLost);
    canvas.addEventListener('webglcontextrestored', handleWebGLContextRestored);
    
    return () => {
    if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleWebGLContextLost);
        canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestored);
    }
  };
  }, [canvasRef, onError]);

  // Handle model changes
  const handleModelChange = (newModelType) => {
    setLoading(true);
    setError(null);
    setCurrentSystem(newModelType);
  };

  // Handle model load error
  const handleModelError = (err) => {
    setError(err);
    setLoading(false);
    onError(err);
  };

  // Handle model load success
  const handleModelLoad = () => {
    setLoading(false);
    setError(null);
  };

  // Get display name for model type
  const getModelName = (modelType) => {
    return modelType.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error && fallbackImage) {
    return (
      <Box
        position="relative"
        width="100%" 
        height="600px"
        bg={bgColor}
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4} justify="center" align="center" h="100%">
          <Image 
            src={fallbackImage} 
            alt={`${currentSystem} system fallback`}
            maxH="80%"
            objectFit="contain"
          />
          <Text color="red.500">{error.message}</Text>
          <Button
            colorScheme="purple"
            size="sm"
            onClick={() => handleModelChange(currentSystem)}
          >
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box position="relative" width="100%" height="100%" minHeight="400px">
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 5], fov: 50 }}
          onCreated={({ gl }) => {
            gl.physicallyCorrectLights = true;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Suspense fallback={<Html center><Spinner size="xl" /></Html>}>
            <EnhancedScene 
              systemType={currentSystem} 
              onSelectStructure={onSelectStructure} 
              selectedStructure={selectedStructure}
              hoveredStructure={hoveredStructure}
              setHoveredStructure={setHoveredStructure}
              view={view}
              sliceView={sliceView}
              quality={quality}
              xRay={xRay}
              onLoad={handleModelLoad}
              onError={handleModelError}
            />
          </Suspense>
        </Canvas>
      </Box>
      </ErrorBoundary>
  );
};

ThreeDAnatomyModel.propTypes = {
  systemType: PropTypes.oneOf(Object.keys(MODELS)),
  initialView: PropTypes.oneOf(['anterior', 'posterior', 'lateral', 'superior', 'inferior']),
  onSelectStructure: PropTypes.func.isRequired,
  selectedStructure: PropTypes.string,
  onError: PropTypes.func,
  fallbackImage: PropTypes.string,
};

// Preload all models to improve subsequent performance
// --- THIS GLOBAL PRELOADING LOOP IS REMOVED DUE TO PERFORMANCE CONCERNS ---
// Object.keys(MODELS).forEach(type => {
//   const loader = new GLTFLoader();
//   const dracoLoader = new DRACOLoader();
//   dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
//   loader.setDRACOLoader(dracoLoader);
  
//   // For initial preloading, prioritize the male_body model as it's our reliable fallback
//   const modelToLoad = type === 'male_body' 
//     ? MODELS[type].path 
//     : modelCache.has('male_body') // Only try loading others if we have a fallback cached
//       ? MODELS[type].path
//       : MODELS['male_body'].path;
  
//   loader.load(
//     modelToLoad,
//     (gltf) => {
//       if (gltf && gltf.scene) {
//         modelCache.set(type, gltf);
//         console.log(`Preloaded ${type} model`);
//       } else {
//         console.error(`Invalid model format for ${type}`);
//       }
//     },
//     undefined,
//     (error) => {
//       console.error(`Error preloading ${type} model:`, error);
//       // Don't try to cache failed models
//     }
//   );
// });

export default ThreeDAnatomyModel; 