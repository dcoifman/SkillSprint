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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
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
} from '@chakra-ui/react';
import {
  SearchIcon,
  StarIcon,
  TimeIcon,
  ViewIcon,
  RepeatIcon,
  InfoOutlineIcon,
  ArrowForwardIcon,
  ChevronRightIcon,
  CalendarIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { fetchLearningPaths } from '../services/supabaseClient';
import PathCard from '../components/PathCard';
import useApiErrorHandler from '../hooks/useApiErrorHandler';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel';

// Create animated components with framer-motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionGrid = motion(Grid);

function ExplorePathsPage() {
  // States for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredPath, setFeaturedPath] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { handleApiError } = useApiErrorHandler();
  
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
        
        // Set featured path
        const featured = pathsData.find(path => path.rating >= 4.8) || pathsData[0];
        setFeaturedPath(featured);
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
    setSelectedPath(path);
    onOpen();
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
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
  
  // Get the system types for the 3D models to display in featured paths
  const getSystemTypeForCategory = (category) => {
    const systemMap = {
      'Anatomy': 'skeletal',
      'Medicine': 'heart',
      'Healthcare': 'muscular',
      'Biology': 'brain',
      'Physiology': 'circulatory'
    };
    return systemMap[category] || 'skeletal';
  };
  
  // Background and styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const heroBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box>
      {/* Hero Section */}
      <Box bg={heroBg} py={12}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="center">
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading
                  as="h1"
                  size="2xl"
                  mb={4}
                  bgGradient="linear(to-r, blue.400, teal.400)"
                  bgClip="text"
                >
                  Explore Educational Paths
                </Heading>
                <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')} mb={6}>
                  Master medical and anatomical knowledge through interactive 3D models, 
                  comprehensive lessons, and structured learning paths designed by experts.
                </Text>
                <HStack spacing={4}>
                  <Button 
                    colorScheme="blue" 
                    size="lg"
                    rightIcon={<ArrowForwardIcon />}
                    onClick={() => document.getElementById('paths-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Browse Paths
                  </Button>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/course-builder')}
                  >
                    Create Custom Path
                  </Button>
                </HStack>
              </MotionBox>
            </GridItem>
            <GridItem display={{ base: 'none', lg: 'block' }}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                height="400px"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="xl"
              >
                <ThreeDAnatomyModel 
                  systemType={featuredPath ? getSystemTypeForCategory(featuredPath.category) : 'skeletal'} 
                  initialView="anterior"
                />
              </MotionBox>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={12} id="paths-section">
        {/* Search and Filter Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          mb={8}
        >
          <Grid 
            templateColumns={{ base: '1fr', md: '1fr 1fr 1fr auto' }} 
            gap={4} 
            p={6} 
            bg={cardBg} 
            borderRadius="lg" 
            boxShadow="md"
          >
            <GridItem>
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
            </GridItem>
            <GridItem>
              <Select 
                placeholder="Select Category" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </GridItem>
            <GridItem>
              <Select 
                placeholder="Select Level" 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </GridItem>
            <GridItem>
              <Button 
                leftIcon={<RepeatIcon />} 
                onClick={handleReset} 
                colorScheme="blue" 
                variant="outline"
                width="full"
              >
                Reset
              </Button>
            </GridItem>
          </Grid>
        </MotionBox>

        {/* Results Stats */}
        <Flex justify="space-between" align="center" mb={6}>
          <HStack>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="md">
              {filteredPaths.length}
            </Badge>
            <Text>Paths Found</Text>
          </HStack>
          
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <HStack>
              <CalendarIcon color="blue.500" />
              <Text>Updated Weekly</Text>
            </HStack>
            <HStack>
              <CheckIcon color="green.500" />
              <Text>Expert Verified</Text>
            </HStack>
          </HStack>
        </Flex>

        {/* Path Grid */}
        {filteredPaths.length > 0 ? (
          <MotionGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={8}
          >
            {filteredPaths.map((path) => (
              <MotionBox
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => handlePathSelect(path)}
              >
                <PathCard path={path} />
              </MotionBox>
            ))}
          </MotionGrid>
        ) : (
          <Center py={16} flexDirection="column">
            <InfoOutlineIcon boxSize={12} color="gray.400" mb={4} />
            <Heading size="lg" mb={2} textAlign="center">No paths found</Heading>
            <Text mb={8} textAlign="center" maxW="md">
              We couldn't find any learning paths matching your search criteria. Try adjusting your filters or create a custom path.
            </Text>
            <Button colorScheme="blue" onClick={handleReset}>
              Reset Filters
            </Button>
          </Center>
        )}
      </Container>
      
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
                  colorScheme="blue" 
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