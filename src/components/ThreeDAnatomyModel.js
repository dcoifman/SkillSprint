import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Html, 
  useGLTF, 
  Environment, 
  ContactShadows,
  Text,
  useTexture,
  Sphere,
  Cylinder,
  PerspectiveCamera
} from '@react-three/drei';
import { Flex, Box, Spinner, Text as ChakraText, Button, ButtonGroup, HStack, VStack, Badge } from '@chakra-ui/react';
import * as THREE from 'three';

// Simple anatomical structures for demonstration
// In a real-world scenario, you would use detailed GLTF models
const Bone = ({ position, rotation, scale = [0.1, 1, 0.1], color = '#f0e6d2', name, onClick, isSelected }) => {
  const meshRef = useRef();
  
  return (
    <group position={position} rotation={rotation} onClick={(e) => {
      e.stopPropagation();
      onClick(name);
    }}>
      <Cylinder args={[0.15, 0.1, 2, 8]} scale={scale} castShadow>
        <meshStandardMaterial color={isSelected ? '#9f7aea' : color} roughness={0.5} />
      </Cylinder>
      {isSelected && (
        <Html position={[0, 0, 0.2]} center>
          <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
            {name}
          </Badge>
        </Html>
      )}
    </group>
  );
};

const Muscle = ({ position, rotation, scale = [0.15, 0.3, 0.15], color = '#cc6666', name, onClick, isSelected }) => {
  return (
    <group position={position} rotation={rotation} onClick={(e) => {
      e.stopPropagation();
      onClick(name);
    }}>
      <Sphere args={[1, 16, 8]} scale={scale} castShadow>
        <meshStandardMaterial color={isSelected ? '#9f7aea' : color} roughness={0.3} />
      </Sphere>
      {isSelected && (
        <Html position={[0, 0, 0.2]} center>
          <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
            {name}
          </Badge>
        </Html>
      )}
    </group>
  );
};

// Anatomical models
const SkeletalSystem = ({ onSelectStructure, selectedStructure }) => {
  const bones = [
    { name: 'Humerus', position: [0.7, 0, 0], rotation: [0, 0, Math.PI / 6], scale: [0.1, 0.8, 0.1] },
    { name: 'Femur', position: [0.3, -1.2, 0], rotation: [0, 0, Math.PI / 12], scale: [0.12, 1.2, 0.12] },
    { name: 'Vertebrae', position: [0, 0, -0.2], rotation: [Math.PI / 2, 0, 0], scale: [0.1, 0.1, 0.1] },
    { name: 'Clavicle', position: [0.5, 0.8, 0], rotation: [0, 0, Math.PI / 3], scale: [0.08, 0.5, 0.08] },
  ];

  return (
    <group>
      {bones.map((bone, index) => (
        <Bone 
          key={index} 
          position={bone.position} 
          rotation={bone.rotation} 
          scale={bone.scale} 
          name={bone.name} 
          onClick={onSelectStructure}
          isSelected={selectedStructure === bone.name}
        />
      ))}
    </group>
  );
};

const MuscularSystem = ({ onSelectStructure, selectedStructure }) => {
  const muscles = [
    { name: 'Biceps Brachii', position: [0.7, 0, 0.15], rotation: [0, 0, Math.PI / 6], scale: [0.12, 0.3, 0.12] },
    { name: 'Quadriceps', position: [0.3, -1.2, 0.15], rotation: [0, 0, Math.PI / 12], scale: [0.15, 0.4, 0.15] },
    { name: 'Latissimus Dorsi', position: [0.2, 0.2, -0.2], rotation: [0, 0, 0], scale: [0.25, 0.15, 0.1] },
    { name: 'Pectoralis Major', position: [0.4, 0.5, 0.15], rotation: [0, 0, Math.PI / 4], scale: [0.2, 0.15, 0.1] },
  ];

  return (
    <group>
      {muscles.map((muscle, index) => (
        <Muscle 
          key={index} 
          position={muscle.position} 
          rotation={muscle.rotation} 
          scale={muscle.scale} 
          name={muscle.name} 
          onClick={onSelectStructure}
          isSelected={selectedStructure === muscle.name}
        />
      ))}
    </group>
  );
};

// Scene setup with camera controls
const Scene = ({ systemType, onSelectStructure, selectedStructure, view }) => {
  const controlsRef = useRef();
  const { camera } = useThree();
  
  // Set camera position based on view
  useEffect(() => {
    if (view === 'anterior') {
      camera.position.set(0, 0, 5);
    } else if (view === 'posterior') {
      camera.position.set(0, 0, -5);
    } else if (view === 'lateral') {
      camera.position.set(5, 0, 0);
    }
    
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [view, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <PerspectiveCamera makeDefault fov={45} position={[0, 0, 5]} />
      <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} />
      
      {systemType === 'skeletal' ? (
        <SkeletalSystem onSelectStructure={onSelectStructure} selectedStructure={selectedStructure} />
      ) : (
        <MuscularSystem onSelectStructure={onSelectStructure} selectedStructure={selectedStructure} />
      )}
      
      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={1} far={5} />
      <Environment preset="city" />
    </>
  );
};

// Main component
const ThreeDAnatomyModel = ({ 
  systemType = 'skeletal',
  initialView = 'anterior',
  onSelectStructure,
  selectedStructure
}) => {
  const [view, setView] = useState(initialView);

  return (
    <Box width="100%" height="500px" borderRadius="md" overflow="hidden" position="relative">
      <VStack position="absolute" top={2} left={2} zIndex={10} align="flex-start">
        <ButtonGroup size="sm" isAttached variant="solid" colorScheme="purple">
          <Button onClick={() => setView('anterior')} isActive={view === 'anterior'}>Anterior</Button>
          <Button onClick={() => setView('lateral')} isActive={view === 'lateral'}>Lateral</Button>
          <Button onClick={() => setView('posterior')} isActive={view === 'posterior'}>Posterior</Button>
        </ButtonGroup>
      </VStack>
      
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene 
            systemType={systemType} 
            onSelectStructure={onSelectStructure} 
            selectedStructure={selectedStructure}
            view={view}
          />
        </Suspense>
      </Canvas>
      
      <Box position="absolute" bottom={2} left={2} right={2} textAlign="center">
        <ChakraText fontSize="sm" color="gray.500">
          Click on any structure to view details | Drag to rotate | Scroll to zoom
        </ChakraText>
      </Box>
    </Box>
  );
};

export default ThreeDAnatomyModel; 