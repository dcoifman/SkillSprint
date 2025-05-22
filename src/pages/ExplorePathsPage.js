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
  useToast,
  Icon,
  TagLabel,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Skeleton,
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
import { fetchLearningPaths } from '../services/supabaseClient.js';
import PathCard from '../components/PathCard.js';
import useApiErrorHandler from '../hooks/useApiErrorHandler.js';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel.js';
import { isValidUUID } from '../utils/uuid.js';
import { Link as RouterLink } from 'react-router-dom';
import { FaHistory, FaBookReader, FaBrain, FaCode, FaChartLine } from 'react-icons/fa';

// Create animated components with framer-motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);
const MotionCard = motion(Card);

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

// Define theme color variables at the top of the component scope
const pageBg = useColorModeValue('var(--background-color)', 'var(--chakra-colors-gray-800)');
const cardBgGlobal = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-700)'); // Renamed to avoid conflict
const borderColorGlobal = useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-600)');
const textColorGlobal = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
const textLightColorGlobal = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');
const primaryColorGlobal = useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)');
const accentColorGlobal = useColorModeValue('var(--accent-color)', 'var(--chakra-colors-orange-300)');


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
            bg={useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-700)')} // Themed Tooltip
            color={useColorModeValue('var(--text-color)', 'whiteAlpha.900')} // Themed Tooltip Text
            p={'var(--spacing-sm)'} 
            borderRadius="var(--border-radius-md)" 
            boxShadow="var(--shadow-lg)" 
            minW="150px"
            textAlign="center"
            borderWidth="1px"
            borderColor={useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-600)')}
          >
            <Text fontWeight="bold">{path.title}</Text>
            <Badge 
              colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'}
              variant="subtle" // Softer badge
              px={2} py={0.5} borderRadius="full" // Pill shape
            >
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

const CATEGORIES = [
  { name: 'History', icon: FaHistory, color: 'blue' },
  { name: 'Technology', icon: FaCode, color: 'purple' },
  { name: 'Science', icon: FaBrain, color: 'green' },
  { name: 'Business', icon: FaChartLine, color: 'orange' },
  { name: 'Literature', icon: FaBookReader, color: 'pink' },
];

const LEARNING_PATHS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'The Great Naval Disaster: Russian Baltic Fleet\'s Epic Journey',
    description: 'Experience the incredible (and incredibly disastrous) journey of the Russian Baltic Fleet during the Russo-Japanese War (1904-1905).',
    category: 'History',
    duration: '5 hours',
    modules: 5,
    difficulty: 'Intermediate',
    rating: 4.8,
    reviews: 128,
    image: '/path-images/russian-baltic-fleet.jpg',
    tags: ['Military History', 'Naval Warfare', 'Comedy in History'],
    featured: true,
    instructor: {
      name: 'Dr. Naval History',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=naval'
    }
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Fundamentals',
    description: 'Master the basics of machine learning, from algorithms to practical applications.',
    category: 'Technology',
    duration: '8 hours',
    modules: 6,
    difficulty: 'Advanced',
    rating: 4.7,
    reviews: 245,
    image: '/path-images/machine-learning.jpg',
    tags: ['AI', 'Data Science', 'Python'],
  },
  {
    id: 'web-dev',
    title: 'Web Development with React',
    description: 'Build modern web applications using React and related technologies.',
    category: 'Technology',
    duration: '10 hours',
    modules: 8,
    difficulty: 'Intermediate',
    rating: 4.9,
    reviews: 312,
    image: '/path-images/web-dev.jpg',
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: 'business-comm',
    title: 'Business Communication',
    description: 'Enhance your professional communication skills for the modern workplace.',
    category: 'Business',
    duration: '6 hours',
    modules: 5,
    difficulty: 'Beginner',
    rating: 4.6,
    reviews: 189,
    image: '/path-images/business-comm.jpg',
    tags: ['Communication', 'Professional Skills'],
  },
];

function ExplorePathsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter paths based on search and category
  const filteredPaths = LEARNING_PATHS.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || path.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Styling
  // Styling - use the globally defined theme variables
  const currentCardBg = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-800)'); // cardBg is already a prop for TreePathCard
  const currentBorderColor = useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-700)');
  const currentTextColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const currentTextLightColor = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');
  const primaryColor = useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)');
  const searchInputBg = useColorModeValue('white', 'var(--chakra-colors-gray-700)');


  return (
    <Container maxW="7xl" py={'var(--spacing-xl)'} bg={pageBg}> {/* Themed Page BG & Padding */}
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={'var(--spacing-lg)'} // Themed margin
      >
        <Heading size="2xl" mb={'var(--spacing-sm)'} color={currentTextColor}>Explore Learning Paths</Heading> {/* Themed Text Color */}
        <Text fontSize="lg" color={currentTextLightColor}> {/* Themed Text Light Color */}
          Discover curated learning paths across various disciplines, from historical adventures to cutting-edge technology.
        </Text>
      </MotionBox>

      {/* Search and Filter */}
      <Stack direction={{ base: 'column', md: 'row' }} spacing={'var(--spacing-md)'} mb={'var(--spacing-lg)'}> {/* Themed Spacing & Margin */}
        <InputGroup maxW={{ base: 'full', md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={currentTextLightColor} /> {/* Themed Icon Color */}
              </InputLeftElement>
              <Input 
                placeholder="Search paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="var(--border-radius-full)" // Themed border radius
                bg={searchInputBg} // Themed input background
                borderColor={currentBorderColor} // Themed border color
                _hover={{ borderColor: primaryColor }}
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
              />
            </InputGroup>
        <Flex wrap="wrap" gap={2}>
          <Button
            variant={selectedCategory === '' ? 'solid' : 'outline'}
            bg={selectedCategory === '' ? primaryColor : 'transparent'} // Themed active BG
            color={selectedCategory === '' ? useColorModeValue('white', 'gray.900') : currentTextColor} // Themed active color
            borderColor={selectedCategory === '' ? primaryColor : currentBorderColor} // Themed border
            borderRadius="var(--border-radius-full)" // Themed
            onClick={() => setSelectedCategory('')}
            _hover={{ bg: selectedCategory === '' ? primaryColor : useColorModeValue('gray.100', 'gray.700') }}
              >
            All
          </Button>
          {CATEGORIES.map((category) => (
              <Button 
              key={category.name}
              variant={selectedCategory === category.name ? 'solid' : 'outline'}
              bg={selectedCategory === category.name ? primaryColor : 'transparent'} // Themed active BG
              color={selectedCategory === category.name ? useColorModeValue('white', 'gray.900') : currentTextColor} // Themed active color
              borderColor={selectedCategory === category.name ? primaryColor : currentBorderColor} // Themed border
              borderRadius="var(--border-radius-full)" // Themed
              leftIcon={<Icon as={category.icon} />}
              onClick={() => setSelectedCategory(category.name)}
              _hover={{ bg: selectedCategory === category.name ? primaryColor : useColorModeValue('gray.100', 'gray.700') }}
              >
              {category.name}
              </Button>
          ))}
        </Flex>
      </Stack>

      {/* Learning Paths Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredPaths.map((path) => (
          <MotionCard
            key={path.id}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            initial={{ opacity: 0, scale: 0.95, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)' }}
            animate={{ opacity: 1, scale: 1, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)' }}
            whileHover={{ 
              y: -5, 
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.08)' 
            }}
            transition={{ duration: 0.3 }}
          >
            <Skeleton isLoaded={!loading}>
              <Box position="relative">
                <Image
                  src={path.image}
                  alt={path.title}
                  fallbackSrc="https://via.placeholder.com/400x200"
                  objectFit="cover"
                  height="200px"
                  width="100%"
                />
                {path.featured && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="purple"
                    variant="solid"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Featured
                  </Badge>
                )}
              </Box>
            </Skeleton>

            <CardHeader pb={0}>
              <Skeleton isLoaded={!loading}>
                <Heading size="md" mb={2}>{path.title}</Heading>
                <Text color={textColor} noOfLines={2} mb={2}>
                  {path.description}
                </Text>
              </Skeleton>
            </CardHeader>

            <CardBody py={2}>
              <Skeleton isLoaded={!loading}>
                <Stack spacing={2}>
                  <Flex wrap="wrap" gap={2}>
                    {path.tags.map((tag) => (
                      <Tag key={tag} size="sm" colorScheme="purple" borderRadius="full">
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Flex align="center">
                      <TimeIcon mr={1} />
                      <Text fontSize="sm">{path.duration}</Text>
                    </Flex>
                    <Flex align="center">
                      <StarIcon mr={1} color="yellow.400" />
                      <Text fontSize="sm">{path.rating} ({path.reviews})</Text>
                    </Flex>
                  </Flex>
                  <Flex align="center">
                    <InfoOutlineIcon mr={2} />
                    <Text fontSize="sm">{path.modules} Modules • {path.difficulty}</Text>
                  </Flex>
                </Stack>
              </Skeleton>
            </CardBody>
                
            <CardFooter pt={2}>
              <Skeleton isLoaded={!loading}>
                <Button 
                  as={RouterLink}
                  to={`/path/${path.id}`}
              colorScheme="purple"
                  width="full"
                  rightIcon={<ChevronRightIcon />}
                >
                  Start Learning
                </Button>
              </Skeleton>
            </CardFooter>
          </MotionCard>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default ExplorePathsPage; 