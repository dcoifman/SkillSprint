import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  ButtonGroup,
  VStack,
  HStack,
  Image,
  Tooltip,
  useColorModeValue,
  IconButton,
  Icon,
} from '@chakra-ui/react';

/**
 * Interactive Anatomy Model Component
 * 
 * This component provides a simplified interactive interface for exploring anatomical structures.
 * In a production environment, this would integrate with a 3D anatomy visualization library 
 * like BioDigital Human API or similar solutions.
 */
function InteractiveAnatomyModel({ 
  bodyRegion = 'full', // 'full', 'upper', 'lower', 'core'
  systemType = 'skeletal', // 'skeletal', 'muscular', 'nervous'
  initialView = 'anterior', // 'anterior', 'posterior', 'lateral', 'medial'
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Background and border colors based on color mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // In a real implementation, these would be dynamic based on the selected view and system
  // For this prototype, we're using static images for different views
  const getAnatomyImage = () => {
    if (systemType === 'skeletal') {
      if (bodyRegion === 'upper') {
        return currentView === 'anterior' 
          ? 'https://images.unsplash.com/photo-1578593195483-4cc38067d2a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHNrZWxldG9ufGVufDB8fDB8fHww'
          : 'https://images.unsplash.com/photo-1576086135878-bd7e7c2d6dfd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fHNrZWxldG9ufGVufDB8fDB8fHww';
      } else {
        return currentView === 'anterior' 
          ? 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tlbGV0b258ZW58MHx8MHx8fDA%3D'
          : 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fHNrZWxldG9ufGVufDB8fDB8fHww';
      }
    } else if (systemType === 'muscular') {
      if (bodyRegion === 'upper') {
        return currentView === 'anterior' 
          ? 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bXVzY2xlc3xlbnwwfHwwfHx8MA%3D%3D'
          : 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFjayUyMG11c2NsZXN8ZW58MHx8MHx8fDA%3D';
      } else {
        return currentView === 'anterior' 
          ? 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzY2xlc3xlbnwwfHwwfHx8MA%3D%3D'
          : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzY2xlc3xlbnwwfHwwfHx8MA%3D%3D';
      }
    }
    
    // Default fallback image
    return 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tlbGV0b258ZW58MHx8MHx8fDA%3D';
  };
  
  // In a real implementation, these would be dynamic based on what's clicked in the model
  const sampleStructures = {
    skeletal: [
      { id: 'sk1', name: 'Humerus', description: 'Long bone in the arm that runs from shoulder to elbow' },
      { id: 'sk2', name: 'Femur', description: 'Longest bone in the body, located in the thigh' },
      { id: 'sk3', name: 'Vertebrae', description: 'Bones that make up the spinal column' },
      { id: 'sk4', name: 'Clavicle', description: 'Commonly known as the collarbone' },
    ],
    muscular: [
      { id: 'm1', name: 'Biceps Brachii', description: 'Flexes the elbow and supinates the forearm' },
      { id: 'm2', name: 'Quadriceps', description: 'Group of four muscles at the front of the thigh' },
      { id: 'm3', name: 'Latissimus Dorsi', description: 'Large muscle of the back, involved in arm movements' },
      { id: 'm4', name: 'Pectoralis Major', description: 'Fan-shaped chest muscle controlling arm movements' },
    ],
  };
  
  // Rotate model to different views
  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  
  // Simulated zoom functionality
  const handleZoom = (direction) => {
    if (direction === 'in' && zoomLevel < 2) {
      setZoomLevel(zoomLevel + 0.25);
    } else if (direction === 'out' && zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.25);
    }
  };
  
  // Select a structure to display information
  const handleStructureSelect = (structure) => {
    setSelectedStructure(structure);
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Interactive {systemType.charAt(0).toUpperCase() + systemType.slice(1)} Model</Heading>
        
        {/* View Controls */}
        <HStack justifyContent="space-between">
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              isActive={currentView === 'anterior'}
              onClick={() => handleViewChange('anterior')}
            >
              Anterior
            </Button>
            <Button
              isActive={currentView === 'posterior'}
              onClick={() => handleViewChange('posterior')}
            >
              Posterior
            </Button>
          </ButtonGroup>
          
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton
              aria-label="Zoom out"
              icon={<Icon viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"
                />
              </Icon>}
              onClick={() => handleZoom('out')}
              isDisabled={zoomLevel <= 0.5}
            />
            <IconButton
              aria-label="Zoom in"
              icon={<Icon viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H7V9h2V7h1v2h2v1z"
                />
              </Icon>}
              onClick={() => handleZoom('in')}
              isDisabled={zoomLevel >= 2}
            />
          </ButtonGroup>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </Button>
        </HStack>
        
        {/* Interactive Anatomy Visualization */}
        <Box 
          position="relative" 
          height="400px"
          border="1px"
          borderColor={borderColor}
          borderRadius="md"
          overflow="hidden"
        >
          <Image
            src={getAnatomyImage()}
            alt={`${systemType} system ${currentView} view`}
            objectFit="contain"
            width="100%"
            height="100%"
            transform={`scale(${zoomLevel})`}
            transition="transform 0.3s ease-in-out"
          />
          
          {/* In a real implementation, these would be positioned dynamically on the 3D model */}
          {showLabels && (
            <>
              {/* These positions would be mapped to the actual 3D coordinates in a real implementation */}
              <Tooltip label="Humerus" placement="right">
                <Box
                  position="absolute"
                  top="120px"
                  left="150px"
                  width="20px"
                  height="20px"
                  borderRadius="full"
                  bg="purple.400"
                  opacity="0.7"
                  cursor="pointer"
                  _hover={{ opacity: 1 }}
                  onClick={() => handleStructureSelect(sampleStructures[systemType][0])}
                />
              </Tooltip>
              
              <Tooltip label="Femur" placement="right">
                <Box
                  position="absolute"
                  top="250px"
                  left="170px"
                  width="20px"
                  height="20px"
                  borderRadius="full"
                  bg="purple.400"
                  opacity="0.7"
                  cursor="pointer"
                  _hover={{ opacity: 1 }}
                  onClick={() => handleStructureSelect(sampleStructures[systemType][1])}
                />
              </Tooltip>
              
              <Tooltip label={systemType === 'skeletal' ? 'Vertebrae' : 'Latissimus Dorsi'} placement="left">
                <Box
                  position="absolute"
                  top="180px"
                  left="230px"
                  width="20px"
                  height="20px"
                  borderRadius="full"
                  bg="purple.400"
                  opacity="0.7"
                  cursor="pointer"
                  _hover={{ opacity: 1 }}
                  onClick={() => handleStructureSelect(sampleStructures[systemType][2])}
                />
              </Tooltip>
              
              <Tooltip label={systemType === 'skeletal' ? 'Clavicle' : 'Pectoralis Major'} placement="top">
                <Box
                  position="absolute"
                  top="100px"
                  left="210px"
                  width="20px"
                  height="20px"
                  borderRadius="full"
                  bg="purple.400"
                  opacity="0.7"
                  cursor="pointer"
                  _hover={{ opacity: 1 }}
                  onClick={() => handleStructureSelect(sampleStructures[systemType][3])}
                />
              </Tooltip>
            </>
          )}
        </Box>
        
        {/* Information Panel */}
        <Box 
          p={4} 
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
          bg={useColorModeValue('gray.50', 'gray.700')}
          minHeight="100px"
        >
          {selectedStructure ? (
            <VStack align="start" spacing={2}>
              <Heading size="sm">{selectedStructure.name}</Heading>
              <Text>{selectedStructure.description}</Text>
            </VStack>
          ) : (
            <Flex align="center" justify="center" height="100%">
              <Text color="gray.500" fontSize="sm">
                Select a structure in the model to view details
              </Text>
            </Flex>
          )}
        </Box>
        
        {/* System Switcher */}
        <HStack mt={2}>
          <Text fontSize="sm" fontWeight="medium">System:</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              isActive={systemType === 'skeletal'}
              onClick={() => window.location.href = '?system=skeletal'}
            >
              Skeletal
            </Button>
            <Button
              isActive={systemType === 'muscular'}
              onClick={() => window.location.href = '?system=muscular'}
            >
              Muscular
            </Button>
          </ButtonGroup>
        </HStack>
      </VStack>
    </Box>
  );
}

export default InteractiveAnatomyModel; 