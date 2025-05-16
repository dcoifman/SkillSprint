import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Html,
  Edges,
  Bounds,
  useBounds,
  useHelper,
  PerspectiveCamera,
  Text3D,
  MeshTransmissionMaterial,
  SpotLight,
  ContactShadows,
  useTexture,
  MeshReflectorMaterial,
  PerformanceMonitor,
  AccumulativeShadows,
  RandomizedLight,
  BakeShadows,
  useFBX,
} from '@react-three/drei';
import { Box, VStack, Button, ButtonGroup, Badge, Text, Spinner, useColorModeValue, Flex, Tooltip, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { EffectComposer, Bloom, SSAO, Outline, Selection, DepthOfField, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useSpring, animated, a } from '@react-spring/three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { ChevronDownIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import ErrorBoundary from './ErrorBoundary';
import JSONErrorHandler from './JSONErrorHandler';

// Compatibility shim for three.js color space naming
if (!THREE.sRGBEncoding && THREE.SRGBColorSpace) {
  THREE.sRGBEncoding = THREE.SRGBColorSpace;
}

// Cache for loaded models to improve performance
const modelCache = new Map();

// Model source configurations
const MODELS = {
  skeletal: {
    path: 'https://models.readyplayer.me/64da0df2fcecc1cc28f78c3a.glb',
    scale: 1.8,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  muscular: {
    path: 'https://d1a370nemizbjq.cloudfront.net/test/body.glb',
    scale: 1.8,
    position: [0, -1.7, 0],
    rotation: [0, Math.PI, 0],
  },
  nervous: {
    path: 'https://raw.githubusercontent.com/anatomy-models/human-anatomy/main/nervous-system.glb',
    scale: 1.5,
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  circulatory: {
    path: 'https://raw.githubusercontent.com/anatomy-models/human-anatomy/main/circulatory-system.glb',
    scale: 1.5, 
    position: [0, -1.7, 0],
    rotation: [0, 0, 0],
  },
  respiratory: {
    path: 'https://raw.githubusercontent.com/anatomy-models/human-anatomy/main/respiratory-system.glb',
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

// Helper to load 3D models with caching for performance
function useAnatomyModel(systemType) {
  const { scene, nodes, materials, animations } = useGLTF(MODELS[systemType].path);
  
  // Apply model-specific transformations
  useEffect(() => {
    if (scene) {
      const config = MODELS[systemType];
      scene.scale.set(config.scale, config.scale, config.scale);
      scene.position.set(...config.position);
      scene.rotation.set(...config.rotation);
      
      // Traverse the scene to enable shadows on all meshes
      scene.traverse(object => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          
          // Enhance materials for better visual quality
          if (object.material) {
            object.material.roughness = 0.7;
            object.material.metalness = 0.2;
            
            if (systemType === 'skeletal') {
              object.material.color = new THREE.Color('#f0e6d2');
            } else if (systemType === 'muscular') {
              object.material.color = new THREE.Color('#a83232');
            }
          }
        }
      });
    }
  }, [scene, systemType]);
  
  return { scene: scene.clone(), nodes, materials, animations };
}

// Component to handle model selection and highlighting
function AnatomicalModel({ systemType, onSelectStructure, selectedStructure, hoveredStructure, setHoveredStructure }) {
  const { scene } = useAnatomyModel(systemType);
  const groupRef = useRef();
  const highlightMaterial = useRef(new THREE.MeshStandardMaterial({ 
    color: '#9f7aea',
    emissive: '#9f7aea',
    emissiveIntensity: 0.5,
    roughness: 0.5,
    metalness: 0.3
  }));
  
  // Store original materials for resetting
  const originalMaterials = useRef(new Map());
  
  // Handle clicks on the model
  const handleClick = (event) => {
    // Prevent event from propagating to parent elements
    event.stopPropagation();
    
    // Find the closest named parent in the hierarchy
    let target = event.object;
    while (target && !target.name) {
      target = target.parent;
    }
    
    if (target && target.name) {
      // Reset previous selection if needed
      if (selectedStructure && selectedStructure !== target.name) {
        resetMaterial(selectedStructure);
      }
      
      // Call the selection handler with the structure name
      onSelectStructure(target.name);
    }
  };
  
  // Apply highlight material to selected or hovered structure
  const highlightStructure = (structureName) => {
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
  };
  
  // Reset material to original
  const resetMaterial = (structureName) => {
    scene.traverse((object) => {
      if (object.isMesh && object.name === structureName) {
        if (originalMaterials.current.has(structureName)) {
          object.material = originalMaterials.current.get(structureName);
        }
      }
    });
  };
  
  // Handle hover events
  const handlePointerOver = (event) => {
    // Prevent event from propagating
    event.stopPropagation();
    
    // Find the closest named parent in the hierarchy
    let target = event.object;
    while (target && !target.name) {
      target = target.parent;
    }
    
    if (target && target.name && target.name !== selectedStructure) {
      highlightStructure(target.name);
      setHoveredStructure(target.name);
    }
  };
  
  const handlePointerOut = (event) => {
    // Reset hover state if not the selected structure
    if (hoveredStructure && hoveredStructure !== selectedStructure) {
      resetMaterial(hoveredStructure);
      setHoveredStructure(null);
    }
  };
  
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
  }, [selectedStructure]);
  
  // Animation for breathing or subtle movement
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      
      if (systemType === 'respiratory') {
        // Breathing animation for respiratory system
        groupRef.current.scale.set(
          1 + Math.sin(t * 0.5) * 0.01,
          1 + Math.sin(t * 0.5) * 0.01,
          1 + Math.sin(t * 0.5) * 0.01
        );
      } else {
        // Subtle movement for all other systems
        groupRef.current.position.y = Math.sin(t * 0.2) * 0.02;
        groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.01;
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        onClick={handleClick} 
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
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
    </group>
  );
}

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
}) {
  const controlsRef = useRef();
  const spotLightRef = useRef();
  const { camera, gl } = useThree();
  const [performanceMode, setPerformanceMode] = useState(false);
  
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

  // Debug light helper when in development
  useHelper(process.env.NODE_ENV === 'development' && spotLightRef, THREE.SpotLightHelper, 'cyan');

  return (
    <>
      {/* Performance monitoring */}
      <PerformanceMonitor onDecline={() => setPerformanceMode(true)} onIncline={() => setPerformanceMode(false)} />
      
      {/* Scene environment */}
      <color attach="background" args={['#03080f']} />
      <fog attach="fog" args={['#03080f', 5, 20]} />
      
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.3} />
      
      {/* Key light */}
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
        <Selection>
          <AnatomicalModel 
            systemType={systemType} 
            onSelectStructure={onSelectStructure} 
            selectedStructure={selectedStructure}
            hoveredStructure={hoveredStructure}
            setHoveredStructure={setHoveredStructure}
          />
        </Selection>
      </Bounds>
      
      {/* Advanced ground reflection */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
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
      </mesh>
      
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
          amount={4}
          radius={10}
          intensity={1}
          ambient={0.2}
          position={[5, 5, -5]}
        />
      </AccumulativeShadows>
      
      {/* Environment map for reflections */}
      <Environment preset="city" background={false} />
      
      {/* Shadow optimization */}
      <BakeShadows />
      
      {/* Selection outline effect */}
      <Selection>
        <EffectComposer multisampling={quality === 'high' ? 8 : quality === 'medium' ? 4 : 0} enabled={!performanceMode}>
          <Outline 
            selection={hoveredStructure || selectedStructure ? 1 : 0}
            selectionLayer={1}
            edgeStrength={5}
            visibleEdgeColor="#ffffff"
            hiddenEdgeColor="#ffffff"
            blur={1}
            xRay={xRay}
          />
          
          {/* Medical visualization effects */}
          {quality !== 'low' && (
            <>
              <SSAO
                samples={quality === 'high' ? 31 : 16} 
                radius={0.5} 
                intensity={xRay ? 30 : 20}
                luminanceInfluence={0.6}
                color={xRay ? "#ffffff" : "#000000"}
              />
              
              <DepthOfField
                focusDistance={0} 
                focalLength={0.02}
                bokehScale={2}
                height={480}
              />
              
              <Bloom
                luminanceThreshold={0.8}
                luminanceSmoothing={0.8}
                intensity={xRay ? 1.5 : 0.8}
              />
              
              <ChromaticAberration
                offset={xRay ? [0.002, 0.002] : [0.0005, 0.0005]}
                radialModulation={true}
                modulationOffset={0.5}
              />
              
              <Vignette darkness={0.5} offset={0.5} />
            </>
          )}
          
          {/* X-ray effect */}
          {xRay && (
            <Noise
              premultiply
              blendFunction={BlendFunction.OVERLAY}
              opacity={0.5}
            />
          )}
        </EffectComposer>
      </Selection>
    </>
  );
}

// Main component
const ThreeDAnatomyModel = ({ 
  systemType = 'skeletal',
  initialView = 'anterior',
  onSelectStructure,
  selectedStructure
}) => {
  const [view, setView] = useState(initialView);
  const [hoveredStructure, setHoveredStructure] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [quality, setQuality] = useState("high");
  const [xRay, setXRay] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [sliceView, setSliceView] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // UI styling
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const controlBg = useColorModeValue('white', 'gray.800');
  const controlText = useColorModeValue('gray.700', 'gray.200');
  
  // Show structure information
  const structureInfo = selectedStructure && STRUCTURE_DATA[selectedStructure] 
    ? STRUCTURE_DATA[selectedStructure].description 
    : hoveredStructure && STRUCTURE_DATA[hoveredStructure]
    ? STRUCTURE_DATA[hoveredStructure].description
    : null;
  
  // Handle model loading
  useEffect(() => {
    // Preload the model
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
    
    if (MODELS[systemType]) {
      setLoading(true);
      loader.load(
        MODELS[systemType].path,
        () => setLoading(false),
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          setErrorType('model');
          setHasError(true);
        }
      );
    }
  }, [systemType]);
  
  // Handle WebGL context lost errors
  useEffect(() => {
    const handleWebGLContextLost = () => {
      console.log('WebGL context lost detected');
      setErrorType('webgl');
      setHasError(true);
    };

    window.addEventListener('webglcontextlost', handleWebGLContextLost);
    
    return () => {
      window.removeEventListener('webglcontextlost', handleWebGLContextLost);
    };
  }, []);
  
  // Handle taking screenshots
  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `anatomy-${systemType}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (hasError) {
    return (
      <JSONErrorHandler 
        errorType={errorType || 'unknown'} 
        message={
          errorType === 'webgl' 
            ? 'WebGL context lost' 
            : errorType === 'model'
            ? 'Failed to load 3D model'
            : 'An error occurred in the 3D component'
        } 
      />
    );
  }

  return (
    <Box width="100%" height="600px" borderRadius="lg" overflow="hidden" position="relative" bg={bgColor} boxShadow="xl">
      {/* Loading indicator */}
      {loading && (
        <Flex 
          position="absolute" 
          top="0" 
          left="0" 
          width="100%" 
          height="100%" 
          alignItems="center" 
          justifyContent="center" 
          bg="rgba(0,0,0,0.5)" 
          zIndex="20"
          flexDirection="column"
        >
          <Spinner size="xl" color="white" mb={4} />
          <Text color="white" fontSize="lg">Loading {systemType} model...</Text>
        </Flex>
      )}
      
      {/* Top controls */}
      <Flex 
        position="absolute" 
        top={2} 
        left={2} 
        right={2}
        zIndex={10} 
        justifyContent="space-between"
      >
        {/* View controls */}
        <Box bg={controlBg} borderRadius="md" p={2} boxShadow="md">
          <ButtonGroup size="sm" isAttached variant="solid" colorScheme="purple">
            <Button onClick={() => setView('anterior')} isActive={view === 'anterior'}>Anterior</Button>
            <Button onClick={() => setView('lateral')} isActive={view === 'lateral'}>Lateral</Button>
            <Button onClick={() => setView('posterior')} isActive={view === 'posterior'}>Posterior</Button>
            <Button onClick={() => setView('superior')} isActive={view === 'superior'}>Superior</Button>
            <Button onClick={() => setView('inferior')} isActive={view === 'inferior'}>Inferior</Button>
          </ButtonGroup>
        </Box>
        
        {/* System selector */}
        <Box bg={controlBg} borderRadius="md" p={2} boxShadow="md">
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" size="sm">
              {systemType.charAt(0).toUpperCase() + systemType.slice(1)} System
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => onSelectStructure('')}>Skeletal</MenuItem>
              <MenuItem onClick={() => onSelectStructure('')}>Muscular</MenuItem>
              <MenuItem onClick={() => onSelectStructure('')}>Nervous</MenuItem>
              <MenuItem onClick={() => onSelectStructure('')}>Circulatory</MenuItem>
              <MenuItem onClick={() => onSelectStructure('')}>Respiratory</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      
      {/* Left controls */}
      <VStack 
        position="absolute" 
        top="50%" 
        left={2} 
        transform="translateY(-50%)"
        zIndex={10} 
        align="flex-start" 
        spacing={2}
      >
        {/* Visualization modes */}
        <Tooltip label="X-Ray View" placement="right">
          <IconButton
            icon={<ViewIcon />}
            colorScheme={xRay ? "yellow" : "gray"}
            onClick={() => setXRay(!xRay)}
            aria-label="X-Ray View"
            size="md"
            isRound
          />
        </Tooltip>
        
        {/* Quality settings */}
        <Box bg={controlBg} borderRadius="md" p={2} boxShadow="md">
          <ButtonGroup size="sm" isAttached variant="solid" colorScheme="blue" orientation="vertical">
            <Button onClick={() => setQuality("low")} isActive={quality === "low"}>Low</Button>
            <Button onClick={() => setQuality("medium")} isActive={quality === "medium"}>Medium</Button>
            <Button onClick={() => setQuality("high")} isActive={quality === "high"}>High</Button>
          </ButtonGroup>
        </Box>
        
        {/* Screenshot button */}
        <Tooltip label="Take Screenshot" placement="right">
          <IconButton
            icon={<DownloadIcon />}
            colorScheme="teal"
            onClick={handleScreenshot}
            aria-label="Take Screenshot"
            size="md"
            isRound
          />
        </Tooltip>
      </VStack>
      
      {/* Main 3D canvas */}
      <ErrorBoundary>
        <Canvas 
          shadows 
          dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.5] : [1, 2]} 
          gl={{ 
            antialias: quality !== "low",
            alpha: true,
            powerPreference: "high-performance"
          }}
          camera={{ position: [0, 0, 4], fov: 30 }}
        >
          <Suspense fallback={null}>
            <EnhancedScene 
              systemType={systemType} 
              onSelectStructure={onSelectStructure} 
              selectedStructure={selectedStructure}
              hoveredStructure={hoveredStructure}
              setHoveredStructure={setHoveredStructure}
              view={view}
              sliceView={sliceView}
              quality={quality}
              xRay={xRay}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* Bottom information panel */}
      <Box 
        position="absolute" 
        bottom={2} 
        left={2} 
        right={2} 
        bg={controlBg} 
        borderRadius="md" 
        p={3} 
        textAlign="center"
        opacity={0.9}
        _hover={{ opacity: 1 }}
        transition="opacity 0.3s"
        boxShadow="md"
      >
        {structureInfo ? (
          <Text fontSize="md" color={controlText} fontWeight="medium">
            {hoveredStructure || selectedStructure}: {structureInfo}
          </Text>
        ) : (
          <Text fontSize="sm" color={controlText}>
            Click on any structure to view details | Drag to rotate | Scroll to zoom
          </Text>
        )}
      </Box>
    </Box>
  );
};

// Preload all models to improve subsequent performance
Object.keys(MODELS).forEach(type => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);
  
  loader.load(
    MODELS[type].path,
    (gltf) => {
      modelCache.set(type, gltf);
      console.log(`Preloaded ${type} model`);
    },
    undefined,
    (error) => console.error(`Error preloading ${type} model:`, error)
  );
});

export default ThreeDAnatomyModel; 