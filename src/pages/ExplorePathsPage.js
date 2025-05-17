import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Tag,
  HStack,
  VStack,
  Flex,
  Badge,
  useColorModeValue,
  Select,
  Avatar,
  Center,
  IconButton,
  Tooltip,
  ScaleFade,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useBreakpointValue,
  Image,
  Grid,
  GridItem,
  Stack,
  useToast
} from '@chakra-ui/react';
import {
  SearchIcon,
  StarIcon,
  TimeIcon,
  ViewIcon,
  AddIcon,
  RepeatIcon,
  InfoOutlineIcon,
  ArrowUpIcon,
  ArrowForwardIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, useTexture, Sky, Cloud, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { fetchLearningPaths } from '../services/supabaseClient';
import PathCard from '../components/PathCard';
import useApiErrorHandler from '../hooks/useApiErrorHandler';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel';
import { isValidUUID } from '../utils/uuid';

// Create animated components with framer-motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);

// Define animations
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(124, 58, 237, 0.3); }
  100% { box-shadow: 0 0 0 20px rgba(124, 58, 237, 0); }
`;

const growAnimation = keyframes`
  0% { transform: scale(0, 0); transform-origin: bottom; }
  100% { transform: scale(1, 1); transform-origin: bottom; }
`;

const sway = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;

const pulse = `${pulseAnimation} 2s infinite`;
const grow = `${growAnimation} 1.5s ease-out`;
const treeSway = `${sway} 5s ease-in-out infinite`;

// Tree geometry creation function
function Tree({ path, position, scale = 1.0, onClick, isHovered, setHovered }) {
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
  const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
  
  // Use path level to determine tree properties
  const treeHeight = path.level === 'Beginner' ? 3 : path.level === 'Intermediate' ? 4 : 5;
  const branchDensity = path.level === 'Beginner' ? 1 : path.level === 'Intermediate' ? 2 : 3;
  
  // Color based on category
  const categoryColors = {
    'Anatomy': '#2F855A', // Green
    'Medicine': '#3182CE', // Blue
    'Healthcare': '#D53F8C', // Pink
    'Biology': '#805AD5', // Purple
    'Physiology': '#DD6B20', // Orange
  };
  
  const leavesColor = categoryColors[path.category] || '#2F855A';
  const [meshGrown, setMeshGrown] = useState(false);
  
  // Reference to trunk for animation
  const trunkRef = useRef();
  const leavesRef = useRef();
  
  // Animation for growing tree
  useFrame(({ clock }) => {
    if (trunkRef.current && !meshGrown) {
      const time = clock.getElapsedTime();
      const growth = Math.min(time / 2, 1);
      
      trunkRef.current.scale.y = growth;
      trunkRef.current.position.y = (treeHeight * 0.5) * growth - (treeHeight * 0.5) * (1 - growth);
      
      if (leavesRef.current) {
        leavesRef.current.scale.set(growth, growth, growth);
        leavesRef.current.position.y = treeHeight - 1 + growth;
        
        // Animate leaves color slightly to simulate wind
        leavesRef.current.material.color.offsetHSL(0, 0, Math.sin(time * 2) * 0.01);
      }
      
      if (growth === 1) {
        setMeshGrown(true);
      }
    }
    
    // Gentle swaying animation when hovered
    if (trunkRef.current && isHovered && meshGrown) {
      const time = clock.getElapsedTime();
      trunkRef.current.rotation.z = Math.sin(time) * 0.05;
      if (leavesRef.current) {
        leavesRef.current.rotation.z = Math.sin(time) * 0.08;
      }
    }
  });
  
  return (
    <group 
      position={position} 
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Trunk */}
      <mesh 
        ref={trunkRef} 
        geometry={trunkGeometry}
        position={[0, treeHeight * 0.5, 0]}
      >
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Leaves */}
      <mesh 
        ref={leavesRef} 
        geometry={leavesGeometry}
        position={[0, treeHeight, 0]}
      >
        <meshStandardMaterial 
          color={leavesColor} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Tooltip */}
      {isHovered && (
        <Html position={[0, treeHeight + 2, 0]} center>
          <Box 
            bg="white" 
            p={2} 
            borderRadius="md" 
            boxShadow="lg" 
            minW="150px"
            textAlign="center"
          >
            <Text fontWeight="bold">{path.title}</Text>
            <Badge colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'}>
              {path.level}
            </Badge>
          </Box>
        </Html>
      )}
    </group>
  );
}

// Forest scene component
function Forest({ paths, onSelectPath, isDay }) {
  const [hoveredTree, setHoveredTree] = useState(null);
  const { camera } = useThree();
  
  // Arrange trees in a forest pattern
  const treePlacements = paths.map((path, index) => {
    // Arrange in a grid-like pattern
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    // Add slight randomization to positions
    const xOffset = (Math.random() - 0.5) * 2;
    const zOffset = (Math.random() - 0.5) * 2;
    
    return {
      path,
      position: [col * 6 - 9 + xOffset, 0, row * 6 - 6 + zOffset],
      scale: 0.8 + Math.random() * 0.4
    };
  });
  
  // Adjust camera to view all trees
  useEffect(() => {
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 5, 0);
  }, [camera]);
  
  return (
    <>
      {/* Sky and environment */}
      <Sky sunPosition={[0, 1, 0]} />
      <Stars radius={100} depth={50} count={1000} factor={4} />
      <Cloud position={[-10, 15, -10]} speed={0.2} opacity={0.4} />
      <Cloud position={[10, 15, -5]} speed={0.2} opacity={0.3} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#538a4e" roughness={1} />
      </mesh>
      
      {/* Trees */}
      {treePlacements.map((item, index) => (
        <Tree 
          key={index}
          path={item.path}
          position={item.position}
          scale={item.scale}
          onClick={() => onSelectPath(item.path)}
          isHovered={hoveredTree === index}
          setHovered={(isHovered) => setHoveredTree(isHovered ? index : null)}
        />
      ))}
      
      {/* Ambient light */}
      <ambientLight intensity={0.4} />
      
      {/* Directional light (sun) */}
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
    </>
  );
}

// Tree-inspired path card for the side panel
function TreePathCard({ path, index }) {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const leafColor = useColorModeValue('green.100', 'green.900');
  const branchColor = useColorModeValue('brown.300', 'brown.700');
  
  const categoryColors = {
    'Anatomy': '#2F855A', // Green
    'Medicine': '#3182CE', // Blue
    'Healthcare': '#D53F8C', // Pink
    'Biology': '#805AD5', // Purple
    'Physiology': '#DD6B20', // Orange
  };
  
  const categoryColor = categoryColors[path.category] || '#2F855A';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={() => navigate(`/path/${path.id}`)}
      cursor="pointer"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        left: '24px',
        top: 0,
        bottom: 0,
        width: '4px',
        bg: branchColor,
        zIndex: 0
      }}
    >
      <Box 
        bg={cardBg}
        p={4} 
        borderRadius="md" 
        boxShadow="md"
            position="relative"
        ml={10}
        mb={4}
        borderLeft="4px solid"
        borderColor={categoryColor}
        _hover={{ transform: 'translateX(5px)', boxShadow: 'lg' }}
        transition="all 0.3s ease"
          >
            <Box
              position="absolute"
          left="-30px" 
          top="20px" 
          width="40px" 
          height="40px" 
          borderRadius="full" 
          bg={leafColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={categoryColor}
          fontWeight="bold"
          animation={treeSway}
          border="3px solid"
          borderColor={categoryColor}
          zIndex={1}
        >
          {path.level.charAt(0)}
            </Box>
        
        <VStack align="start" spacing={2}>
          <Heading size="md">{path.title}</Heading>
          
          <Text noOfLines={2} fontSize="sm" color="gray.500">
            {path.description}
          </Text>
          
          <HStack>
            <Badge colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'}>
              {path.level}
            </Badge>
            <Badge>{path.category}</Badge>
            <Badge>{path.estimated_time}</Badge>
          </HStack>
          
          <HStack spacing={4}>
            <HStack spacing={1}>
              <TimeIcon color="gray.500" />
              <Text fontSize="xs">{path.total_sprints || '12'} sprints</Text>
            </HStack>
            <HStack spacing={1}>
              <StarIcon color="yellow.500" />
              <Text fontSize="xs">{path.rating || '4.8'}</Text>
            </HStack>
          </HStack>
          
          <Flex align="center" justify="space-between" width="100%">
            <HStack>
              <Avatar size="xs" src={path.instructor.avatar} name={path.instructor.name} />
              <Text fontSize="xs">{path.instructor.name}</Text>
            </HStack>
            
            <Button
              size="xs"
              colorScheme="purple"
              rightIcon={<ChevronRightIcon />}
            >
              Explore
            </Button>
          </Flex>
        </VStack>
      </Box>
    </MotionBox>
  );
}

function ExplorePathsPage() {
  // States for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDay, setIsDay] = useState(true);
  const scrollRef = useRef(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { handleApiError } = useApiErrorHandler();
  const toast = useToast();
  
  // Show panel on smaller screens, 3D view on larger screens
  const defaultView = useBreakpointValue({ base: 'panel', md: '3d' });
  const [viewMode, setViewMode] = useState(defaultView);

  // Fetch learning paths from Supabase
  useEffect(() => {
    async function loadLearningPaths() {
      try {
        setIsLoading(true);
        
        const { data, error } = await fetchLearningPaths({
          category: selectedCategory || null,
          level: selectedLevel || null,
          search: searchQuery || null,
        });
        
        if (error) {
          handleApiError(error);
          return;
        }
        
        // Add local demo paths if empty data
        const pathsData = data && data.length > 0 ? data : generateDemoPaths();
        setLearningPaths(pathsData);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLearningPaths();
  }, [selectedCategory, selectedLevel, searchQuery, handleApiError]);
  
  // Generate demo paths if no data is available
  const generateDemoPaths = () => {
    const demoCategories = ['Anatomy', 'Medicine', 'Healthcare', 'Biology', 'Physiology'];
    const demoLevels = ['Beginner', 'Intermediate', 'Advanced'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `demo-${i}`,
      title: [
        'Human Anatomy Fundamentals',
        'Advanced Cardiovascular Systems',
        'Neuroanatomy Deep Dive',
        'Musculoskeletal System Exploration',
        'Respiratory System & Pathologies',
        'Digestive System & Nutrition',
        'Medical Imaging Fundamentals',
        'Clinical Diagnosis Skills',
        'Surgical Technique Foundations',
        'Pharmacology Essentials',
        'Medical Ethics & Communication',
        'Emergency Medicine Basics'
      ][i % 12],
      description: 'Master essential concepts through interactive 3D models, quizzes, and adaptive learning modules designed for maximum retention and practical application.',
      category: demoCategories[i % demoCategories.length],
      level: demoLevels[i % demoLevels.length],
      image: `https://source.unsplash.com/random/800x600?medical,anatomy&sig=${i}`,
      estimated_time: ['2-4 hours', '4-6 hours', '6-8 hours', '8-10 hours'][i % 4],
      rating: (4 + Math.random()).toFixed(1),
      review_count: Math.floor(Math.random() * 200) + 50,
      students_count: Math.floor(Math.random() * 5000) + 500,
      total_sprints: Math.floor(Math.random() * 15) + 5,
      tags: ['anatomy', '3d-models', 'interactive', 'medical', 'healthcare'].slice(0, Math.floor(Math.random() * 3) + 2),
      instructor: {
        name: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Prof. Emma Rodriguez', 'Dr. James Wilson'][i % 4],
        avatar: `https://source.unsplash.com/random/100x100?portrait&sig=${i}`
      },
      featured: i < 3
    }));
  };
  
  const handlePathSelect = (path) => {
    if (isValidUUID(path.id)) {
      setSelectedPath(path);
      onOpen();
    } else {
      toast({
        title: 'Demo Path',
        description: 'This is a demo path. Please select a real path to view details.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
  };
  
  const toggleDayNight = () => {
    setIsDay(!isDay);
  };
  
  const filteredPaths = learningPaths.filter(path => {
    const matchesCategory = selectedCategory ? path.category === selectedCategory : true;
    const matchesLevel = selectedLevel ? path.level === selectedLevel : true;
    const matchesSearch = searchQuery 
      ? path.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        path.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesCategory && matchesLevel && matchesSearch;
  });
  
  const categories = [...new Set(learningPaths.map(path => path.category))];
  const levels = [...new Set(learningPaths.map(path => path.level))];
  
  // Background and styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const forestBg = useColorModeValue('green.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      {/* Forest 3D Canvas */}
      <Box 
        height={{ base: '40vh', md: 'calc(100vh - 60px)' }} 
        bg={forestBg}
        position="relative"
        overflowX="hidden"
      >
        {/* Floating search and filter controls */}
        <Box 
          position={{ base: 'relative', md: 'absolute' }}
          top="20px"
          left="20px"
          zIndex={10}
          width={{ base: '100%', md: '350px' }}
          p={4}
        >
          <VStack 
            spacing={4}
            bg={cardBg}
            p={4}
            borderRadius="lg"
            boxShadow="xl"
            align="stretch"
          >
            <Heading size="md">Explore Learning Forest</Heading>
            
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <HStack>
              <Select 
                placeholder="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>

              <Select 
                placeholder="Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </HStack>
            
            <HStack>
              <Button 
                leftIcon={<RepeatIcon />} 
                onClick={handleReset}
                size="sm"
                variant="outline"
                flex={1}
              >
                Reset
              </Button>
              
              <Tooltip label={isDay ? 'Switch to night mode' : 'Switch to day mode'}>
                  <IconButton
                  icon={isDay ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleDayNight}
                  size="sm"
                  variant="outline"
                  aria-label="Toggle day/night"
                  />
                </Tooltip>
              
              <Tooltip label={viewMode === '3d' ? 'Show paths list' : 'Show 3D forest'}>
                  <IconButton
                  icon={viewMode === '3d' ? <ViewIcon /> : <ViewIcon />}
                  onClick={() => setViewMode(viewMode === '3d' ? 'panel' : '3d')}
                  size="sm"
                  variant="outline"
                  aria-label="Toggle view mode"
                  display={{ base: 'flex', md: 'none' }}
                  />
                </Tooltip>
            </HStack>
          </VStack>
        </Box>

        {/* Stats summary */}
        <Box 
          position={{ base: 'relative', md: 'absolute' }}
          top="20px"
          right="20px"
          zIndex={10}
          p={4}
          display={{ base: 'none', md: 'block' }}
        >
          <Flex 
            bg={cardBg}
            p={4}
            borderRadius="lg"
            boxShadow="xl"
            gap={4}
          >
            <Stat>
              <StatLabel>Paths</StatLabel>
              <StatNumber>{filteredPaths.length}</StatNumber>
            </Stat>
            
            <Divider orientation="vertical" />
            
            <Stat>
              <StatLabel>Categories</StatLabel>
              <StatNumber>{categories.length}</StatNumber>
            </Stat>
          </Flex>
        </Box>

        {/* 3D Canvas */}
        {(viewMode === '3d' || viewMode === 'panel') && (
          <Box height="100%" width="100%">
            <Canvas shadows camera={{ position: [0, 10, 20], fov: 60 }}>
              <Forest 
                paths={filteredPaths} 
                onSelectPath={handlePathSelect} 
                isDay={isDay}
              />
              <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                minPolarAngle={Math.PI / 6} 
                maxPolarAngle={Math.PI / 2} 
              />
            </Canvas>
              </Box>
        )}

        {/* Hover instructions for desktop */}
        <Flex 
          position="absolute"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
          bg="blackAlpha.700"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          fontSize="sm"
          zIndex={10}
          display={{ base: 'none', md: 'flex' }}
        >
          <Text>Hover over trees to see details • Click to explore</Text>
        </Flex>
      </Box>
      
      {/* Mobile view - Scrollable list of paths */}
      {viewMode === 'panel' && (
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" mb={4}>
              Learning Paths Forest
            </Heading>
            
            <Text textAlign="center" maxW="container.md" mx="auto" mb={4}>
              Each path is represented as a tree in our knowledge forest. Explore, learn, and grow your skills through these carefully crafted learning journeys.
            </Text>
            
            <MotionVStack
              spacing={0}
              align="stretch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
              {filteredPaths.map((path, index) => (
                <TreePathCard key={path.id} path={path} index={index} />
              ))}
            </MotionVStack>
            
            {filteredPaths.length === 0 && (
              <Center py={12} flexDirection="column">
                <Image 
                  src="https://source.unsplash.com/random/400x300?forest,empty" 
                  alt="Empty forest" 
                  borderRadius="lg" 
                  maxW="300px"
                  mb={4} 
                />
                <Heading size="md" mb={2}>No trees found in this forest section</Heading>
                <Text mb={4} textAlign="center" maxW="md">
                  Try adjusting your search criteria to discover more learning paths.
            </Text>
                <Button colorScheme="green" onClick={handleReset}>
                Reset Filters
              </Button>
          </Center>
        )}
          </VStack>
        </Container>
      )}
      
      {/* Path Detail Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {selectedPath?.title}
          </DrawerHeader>
          
          <DrawerBody>
            {selectedPath && (
              <VStack spacing={6} align="stretch">
                <Image
                  src={selectedPath.image}
                  alt={selectedPath.title}
                  borderRadius="md"
                  objectFit="cover"
                  height="200px"
                />
                
                <Flex justify="space-between" wrap="wrap" gap={2}>
                  <Badge colorScheme={selectedPath.level === 'Beginner' ? 'green' : selectedPath.level === 'Intermediate' ? 'blue' : 'purple'} p={1}>
                    {selectedPath.level}
                  </Badge>
                  <Badge colorScheme="teal" p={1}>{selectedPath.category}</Badge>
                  <Badge colorScheme="gray" p={1}>{selectedPath.estimated_time}</Badge>
                </Flex>
                
                <Text>{selectedPath.description}</Text>
                
                <Heading size="sm">What You'll Learn</Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                    <Text>Master essential {selectedPath.category.toLowerCase()} concepts</Text>
                  </HStack>
                  <HStack>
                    <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                    <Text>Practice through interactive exercises</Text>
                  </HStack>
                  <HStack>
                    <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                    <Text>Apply knowledge in practical scenarios</Text>
                  </HStack>
                </VStack>
                
                <Heading size="sm">Course Details</Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Duration</StatLabel>
                    <StatNumber>{selectedPath.estimated_time}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Sprints</StatLabel>
                    <StatNumber>{selectedPath.total_sprints || '12'}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Rating</StatLabel>
                    <StatNumber>{selectedPath.rating}</StatNumber>
                    <StatHelpText>{selectedPath.review_count} reviews</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Students</StatLabel>
                    <StatNumber>{selectedPath.students_count}</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Heading size="sm">Instructor</Heading>
                <HStack>
                  <Avatar src={selectedPath.instructor.avatar} name={selectedPath.instructor.name} size="lg" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{selectedPath.instructor.name}</Text>
                    <Text fontSize="sm">Expert in {selectedPath.category}</Text>
                  </VStack>
                </HStack>
                
                <Button 
              colorScheme="purple"
              size="lg"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/path/${selectedPath.id}`)}
                  mt={4}
                >
                  Start Learning
                </Button>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default ExplorePathsPage; 