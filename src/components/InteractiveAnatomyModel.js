import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Heading,
  Text,
  Button,
  ButtonGroup,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  IconButton,
  Grid,
  GridItem,
  Tag,
  RadioGroup,
  Radio,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  FormControl,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, CheckCircleIcon, RepeatIcon, InfoIcon } from '@chakra-ui/icons';

// Structure type definition
const StructureType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  region: PropTypes.oneOf(['upper', 'lower', 'core']).isRequired,
  location: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  functions: PropTypes.arrayOf(PropTypes.string).isRequired,
  connections: PropTypes.arrayOf(PropTypes.string).isRequired,
  funFact: PropTypes.string,
});

/**
 * Interactive Anatomy Model Component
 * 
 * This component provides an interactive interface for exploring anatomical structures.
 */
function InteractiveAnatomyModel({ 
  bodyRegion = 'full', // 'full', 'upper', 'lower', 'core'
  systemType = 'skeletal', // 'skeletal', 'muscular', 'nervous'
  initialView = 'anterior', // 'anterior', 'posterior', 'lateral', 'medial'
  onSelectStructure,
  selectedStructure,
  hoveredStructure,
  setHoveredStructure,
  showControls = true,
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [currentSystem, setCurrentSystem] = useState(systemType);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [highlightMode, setHighlightMode] = useState('none');
  const [error, setError] = useState(null);
  
  // Background and border colors based on color mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get appropriate anatomy image based on current settings
  const getAnatomyImage = () => {
    try {
      // Royalty-free image URLs (primarily from Wikimedia Commons)
      const skeletalImages = {
        anterior: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Human_skeleton_anterior_view_no_labels.svg/800px-Human_skeleton_anterior_view_no_labels.svg.png',
        posterior: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Human_skeleton_posterior_view_no_labels.svg/800px-Human_skeleton_posterior_view_no_labels.svg.png',
        lateral: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Human_skeleton_lateral_view_no_labels.svg/800px-Human_skeleton_lateral_view_no_labels.svg.png',
      };

      const muscularImages = {
        anterior: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Anterior_view_of_human_muscles_no_labels.svg/800px-Anterior_view_of_human_muscles_no_labels.svg.png',
        posterior: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Posterior_view_of_human_muscles_no_labels.svg/800px-Posterior_view_of_human_muscles_no_labels.svg.png',
        lateral: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Lateral_view_of_human_muscles_no_labels.svg/800px-Lateral_view_of_human_muscles_no_labels.svg.png',
      };

      const defaultFallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Missing_image_placeholder.svg/800px-Missing_image_placeholder.svg.png';

      if (currentSystem === 'skeletal') {
        return skeletalImages[currentView] || skeletalImages.anterior; // Default to anterior if view is not specific
      }
      
      if (currentSystem === 'muscular') {
        return muscularImages[currentView] || muscularImages.anterior; // Default to anterior if view is not specific
      }
      
      // Default/fallback image if system is unknown or view doesn't match
      return defaultFallbackImage;

    } catch (err) {
      console.error("Error in getAnatomyImage:", err); // Log the error
      setError('Failed to determine anatomy image URL.'); // More specific error message
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Missing_image_placeholder.svg/800px-Missing_image_placeholder.svg.png'; // Return a fallback in case of error too
    }
  };
  
  // Structure data for each system
  const structures = {
    skeletal: [
      { 
        id: 'sk1', 
        name: 'Humerus', 
        description: 'Long bone in the arm that runs from shoulder to elbow',
        region: 'upper',
        location: { x: 30, y: 35 },
        functions: ['Supports upper arm', 'Provides attachment for arm muscles', 'Forms shoulder and elbow joints'],
        connections: ['Scapula (shoulder)', 'Radius and Ulna (elbow)'],
        funFact: 'The humerus is the second largest bone in the human body after the femur.'
      },
      { 
        id: 'sk2', 
        name: 'Femur', 
        description: 'Longest bone in the body, located in the thigh',
        region: 'lower',
        location: { x: 50, y: 60 },
        functions: ['Supports body weight', 'Enables walking and running', 'Transfer forces between hip and knee'],
        connections: ['Pelvis (hip joint)', 'Tibia and Patella (knee joint)'],
        funFact: 'The femur is the strongest bone in the human body and can support up to 30 times the weight of an adult.'
      },
      { 
        id: 'sk3', 
        name: 'Vertebrae', 
        description: 'Bones that make up the spinal column',
        region: 'core',
        location: { x: 50, y: 45 },
        functions: ['Protect the spinal cord', 'Support the head and body', 'Allow flexibility of the trunk'],
        connections: ['Adjacent vertebrae', 'Ribs', 'Skull'],
        funFact: 'The human spine typically consists of 33 vertebrae at birth, which fuse into 24 movable vertebrae in adults.'
      },
      { 
        id: 'sk4', 
        name: 'Clavicle', 
        description: 'Commonly known as the collarbone',
        region: 'upper',
        location: { x: 60, y: 25 },
        functions: ['Connects arm to body', 'Stabilizes shoulder', 'Protects blood vessels and nerves'],
        connections: ['Sternum', 'Scapula'],
        funFact: 'The clavicle is the most frequently broken bone in the human body and is the only long bone that lies horizontally.'
      },
    ],
    muscular: [
      { 
        id: 'm1', 
        name: 'Biceps Brachii', 
        description: 'Flexes the elbow and supinates the forearm',
        region: 'upper',
        location: { x: 30, y: 33 },
        functions: ['Flexes the elbow', 'Supinates the forearm', 'Stabilizes the shoulder joint'],
        connections: ['Scapula', 'Radius'],
        funFact: 'The biceps is one of the most famous muscles due to its visibility when flexed, but it contributes relatively little to overall arm strength compared to deeper muscles.'
      },
      { 
        id: 'm2', 
        name: 'Quadriceps', 
        description: 'Group of four muscles at the front of the thigh',
        region: 'lower',
        location: { x: 50, y: 55 },
        functions: ['Extends the knee', 'Stabilizes the patella', 'Assists in hip flexion'],
        connections: ['Femur', 'Patella', 'Tibia'],
        funFact: 'The quadriceps muscle group is the largest and strongest in the human body and is crucial for walking, running, and jumping.'
      },
      { 
        id: 'm3', 
        name: 'Latissimus Dorsi', 
        description: 'Large muscle of the back, involved in arm movements',
        region: 'upper',
        location: { x: 45, y: 40 },
        functions: ['Adducts and extends the arm', 'Rotates the arm internally', 'Assists in breathing'],
        connections: ['Humerus', 'Spine', 'Iliac crest'],
        funFact: 'The "lats" are the widest muscles in the human body and play a crucial role in activities like swimming and climbing.'
      },
      { 
        id: 'm4', 
        name: 'Pectoralis Major', 
        description: 'Fan-shaped chest muscle controlling arm movements',
        region: 'upper',
        location: { x: 35, y: 30 },
        functions: ['Adducts and flexes the arm', 'Rotates the arm internally', 'Assists in deep breathing'],
        connections: ['Humerus', 'Clavicle', 'Sternum', 'Ribs'],
        funFact: 'The pectoralis major is one of the main muscles used in pushing movements and makes up the bulk of the chest muscles.'
      },
    ],
  };
  
  // Get structures for current system and filter by region if needed
  const getVisibleStructures = () => {
    const systemStructures = structures[currentSystem] || [];
    if (bodyRegion === 'full') return systemStructures;
    return systemStructures.filter(structure => structure.region === bodyRegion);
  };
  
  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    setError(null);
  };
  
  // Handle system change
  const handleSystemChange = (system) => {
    setCurrentSystem(system);
    setError(null);
  };
  
  // Handle zoom
  const handleZoom = (direction) => {
    if (direction === 'in' && zoomLevel < 2) {
      setZoomLevel(prevLevel => prevLevel + 0.25);
    } else if (direction === 'out' && zoomLevel > 0.5) {
      setZoomLevel(prevLevel => prevLevel - 0.25);
    }
  };
  
  // Handle structure selection
  const handleStructureSelect = (structure) => {
    onSelectStructure(structure);
  };
  
  // Reset all views
  const handleReset = () => {
    setCurrentView(initialView);
    setCurrentSystem(systemType);
    setZoomLevel(1);
    setShowLabels(true);
    setHighlightMode('none');
    setError(null);
  };
  
  // Get visible structures
  const visibleStructures = getVisibleStructures();
  
  // Function to get highlight color by mode
  const getHighlightColor = (structure) => {
    if (highlightMode === 'none' || !structure) return 'transparent';
    if (highlightMode === 'region') {
      if (structure.region === 'upper') return 'red.100';
      if (structure.region === 'lower') return 'blue.100';
      if (structure.region === 'core') return 'green.100';
    }
    return 'purple.100';
  };
  
  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading Model
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
          <Button
            colorScheme="red"
            size="sm"
            mt={4}
            onClick={handleReset}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Grid templateColumns="3fr 1fr" gap={4}>
        {/* Main viewing area */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            {/* Top controls */}
            {showControls && (
              <>
            <HStack justifyContent="space-between">
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button 
                  onClick={() => handleViewChange('anterior')}
                      isActive={currentView === 'anterior'}
                      aria-pressed={currentView === 'anterior'}
                      data-testid="view-control-anterior"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={() => handleViewChange('lateral')}
                      isActive={currentView === 'lateral'}
                      aria-pressed={currentView === 'lateral'}
                      data-testid="view-control-lateral"
                >
                  Lateral
                </Button>
                <Button 
                  onClick={() => handleViewChange('posterior')}
                      isActive={currentView === 'posterior'}
                      aria-pressed={currentView === 'posterior'}
                      data-testid="view-control-posterior"
                >
                  Posterior
                </Button>
              </ButtonGroup>
              
                  <ButtonGroup size="sm" isAttached>
                <IconButton
                  icon={<MinusIcon />}
                  onClick={() => handleZoom('out')}
                      isDisabled={zoomLevel <= 0.5}
                  aria-label="Zoom out"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={() => handleZoom('in')}
                      isDisabled={zoomLevel >= 2}
                  aria-label="Zoom in"
                />
                <IconButton
                  icon={<RepeatIcon />}
                  onClick={handleReset}
                  aria-label="Reset view"
                />
              </ButtonGroup>
            </HStack>
            
            {/* System selector */}
            <ButtonGroup size="sm" isAttached variant="outline" alignSelf="center">
              <Button 
                onClick={() => handleSystemChange('skeletal')}
                colorScheme={currentSystem === 'skeletal' ? 'purple' : 'gray'}
              >
                Skeletal System
              </Button>
              <Button 
                onClick={() => handleSystemChange('muscular')}
                colorScheme={currentSystem === 'muscular' ? 'purple' : 'gray'}
              >
                Muscular System
              </Button>
            </ButtonGroup>
              </>
            )}
            
            {/* Image display */}
            <Box 
              position="relative" 
              borderWidth={1} 
              borderColor={borderColor} 
              borderRadius="md" 
              overflow="hidden"
              bg={bgColor}
              h="500px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image 
                src={getAnatomyImage()} 
                alt={`${currentSystem} system ${currentView} view`}
                objectFit="contain"
                maxH="100%"
                transform={`scale(${zoomLevel})`}
                transition="transform 0.3s ease"
              />
              
              {/* Structure labels/hotspots */}
              {showLabels && visibleStructures.map(structure => (
                <Box
                  key={structure.id}
                  position="absolute"
                  left={`${structure.location.x}%`}
                  top={`${structure.location.y}%`}
                  transform="translate(-50%, -50%)"
                  zIndex={1}
                  onClick={() => handleStructureSelect(structure)}
                  cursor="pointer"
                >
                  <Popover trigger="hover">
                    <PopoverTrigger>
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={selectedStructure?.id === structure.id ? "purple.500" : "gray.400"}
                        bg={selectedStructure?.id === structure.id ? "purple.100" : getHighlightColor(structure)}
                        _hover={{ bg: "purple.100" }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <InfoIcon boxSize={3} color="gray.600" />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader fontWeight="bold">{structure.name}</PopoverHeader>
                      <PopoverBody>
                        <Text fontSize="sm">{structure.description}</Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Box>
              ))}
            </Box>
            
            {/* Highlight controls */}
            {showControls && (
            <HStack justifyContent="center" spacing={4}>
              <Text fontSize="sm" fontWeight="medium">Highlight:</Text>
              <FormControl>
                <RadioGroup value={highlightMode} onChange={setHighlightMode} size="sm">
                  <HStack spacing={4}>
                    <Radio value="none">None</Radio>
                    <Radio value="region">By Region</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </HStack>
            )}
          </VStack>
        </GridItem>
        
        {/* Right sidebar - Information panel */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <Heading size="md">
              {currentSystem === 'skeletal' ? 'Skeletal System' : 'Muscular System'}
            </Heading>
            
            <Box borderWidth={1} borderRadius="md" p={4} bg={bgColor}>
              {selectedStructure ? (
                <VStack align="start" spacing={3}>
                  <Heading size="md">{selectedStructure.name}</Heading>
                  <Text>{selectedStructure.description}</Text>
                  
                  <Divider />
                  
                  <Box width="100%">
                    <Text fontWeight="medium" mb={1}>Functions:</Text>
                    <VStack align="start" pl={2} spacing={1}>
                      {selectedStructure.functions.map((func, i) => (
                        <HStack key={i} spacing={2} align="start">
                          <Text>•</Text>
                          <Text fontSize="sm">{func}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                  
                  <Box width="100%">
                    <Text fontWeight="medium" mb={1}>Connections:</Text>
                    <HStack flexWrap="wrap" spacing={2}>
                      {selectedStructure.connections.map((conn, i) => (
                        <Tag key={i} size="sm" colorScheme="blue" my={1}>{conn}</Tag>
                      ))}
                    </HStack>
                  </Box>
                  
                  <Divider />
                  
                  <Box 
                    width="100%" 
                    bg="purple.50" 
                    borderRadius="md" 
                    p={2} 
                    borderLeftWidth={4} 
                    borderLeftColor="purple.300"
                  >
                    <HStack spacing={2}>
                      <InfoIcon color="purple.500" />
                      <Text fontWeight="medium" fontSize="sm">Did you know?</Text>
                    </HStack>
                    <Text fontSize="sm" mt={1}>{selectedStructure.funFact}</Text>
                  </Box>
                </VStack>
              ) : (
                <VStack spacing={4} py={6} align="center">
                  <InfoIcon boxSize={8} color="purple.400" />
                  <Text textAlign="center" color="gray.600">
                    Select a structure on the model to view detailed information
                  </Text>
                </VStack>
              )}
            </Box>
            
            <Box>
              <Heading size="sm" mb={2}>All Structures</Heading>
              <VStack align="stretch" spacing={1} maxH="250px" overflowY="auto" pr={2}>
                {visibleStructures.map(structure => (
                  <Button
                    key={structure.id}
                    size="sm"
                    justifyContent="flex-start"
                    variant={selectedStructure?.id === structure.id ? "solid" : "ghost"}
                    colorScheme={selectedStructure?.id === structure.id ? "purple" : "gray"}
                    leftIcon={selectedStructure?.id === structure.id ? <CheckCircleIcon /> : undefined}
                    onClick={() => handleStructureSelect(structure)}
                  >
                    {structure.name}
                  </Button>
                ))}
              </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

InteractiveAnatomyModel.propTypes = {
  bodyRegion: PropTypes.oneOf(['full', 'upper', 'lower', 'core']),
  systemType: PropTypes.oneOf(['skeletal', 'muscular', 'nervous']),
  initialView: PropTypes.oneOf(['anterior', 'posterior', 'lateral', 'medial']),
  onSelectStructure: PropTypes.func.isRequired,
  selectedStructure: StructureType,
  hoveredStructure: StructureType,
  setHoveredStructure: PropTypes.func.isRequired,
  showControls: PropTypes.bool,
};

export default InteractiveAnatomyModel; 