import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Image,
  Flex,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Select,
  Avatar,
  AvatarGroup,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  Tooltip,
  Grid,
  GridItem,
  Divider,
  SlideFade,
  ScaleFade,
  useDisclosure,
  ButtonGroup,
  Stack,
  AspectRatio,
  Wrap,
  WrapItem,
  useBreakpointValue,
  keyframes,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import {
  SearchIcon,
  StarIcon,
  TimeIcon,
  ChevronDownIcon,
  ViewIcon,
  ExternalLinkIcon,
  AddIcon,
  RepeatIcon,
  InfoOutlineIcon,
  ArrowUpIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLearningPaths } from '../services/supabaseClient';
import PathCard from '../components/PathCard';
import useApiErrorHandler from '../hooks/useApiErrorHandler';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel';

// Create animated components with framer-motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionGrid = motion(Grid);

// Define animations
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(124, 58, 237, 0.3); }
  100% { box-shadow: 0 0 0 20px rgba(124, 58, 237, 0); }
`;

const pulse = `${pulseAnimation} 2s infinite`;

function FeaturedPathCard({ path, index }) {
  const navigate = useNavigate();
  const isEven = index % 2 === 0;
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');
  const initialY = isEven ? 50 : -50;

  return (
    <MotionBox
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/path/${path.id}`)}
      cursor="pointer"
    >
      <Grid
        templateColumns={{ base: "1fr", md: "5fr 7fr" }}
        gap={6}
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="xl"
        overflow="hidden"
        _hover={{ bg: hoverBg }}
        height="100%"
      >
        <AspectRatio ratio={1} w="100%" maxH="300px">
          <Box
            bgImage={`url(${path.image})`}
            bgSize="cover"
            bgPosition="center"
            borderRadius="lg"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.500"
              backdropFilter="blur(2px)"
              opacity={0}
              transition="all 0.3s"
              _groupHover={{ opacity: 1 }}
            >
              <Center h="100%">
                <Button
                  colorScheme="purple"
                  rightIcon={<ArrowForwardIcon />}
                  fontSize="lg"
                  size="lg"
                >
                  View Path
                </Button>
              </Center>
            </Box>
          </Box>
        </AspectRatio>
        <VStack align="start" spacing={4} justifyContent="center">
          <HStack>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>FEATURED</Badge>
            <Badge colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'} px={2}>
              {path.level}
            </Badge>
          </HStack>
          
          <Heading size="lg">{path.title}</Heading>
          
          <Text fontSize="lg" noOfLines={3} color="gray.500">
            {path.description}
          </Text>
          
          <HStack spacing={4} mt={2}>
            <HStack>
              <StarIcon color="yellow.400" />
              <Text fontWeight="semibold">{path.rating || '4.8'}</Text>
            </HStack>
            <HStack>
              <TimeIcon color="blue.400" />
              <Text>{path.estimated_time}</Text>
            </HStack>
            <Text>{path.total_sprints || '12'} sprints</Text>
          </HStack>
          
          <Wrap spacing={2} mt={2}>
            {path.tags && path.tags.map((tag, i) => (
              <WrapItem key={i}>
                <Tag colorScheme="purple" variant="subtle">
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
          
          <Flex width="100%" justifyContent="space-between" alignItems="center" mt={2}>
            <HStack>
              <Avatar src={path.instructor?.avatar} name={path.instructor?.name} />
              <Text fontWeight="medium">{path.instructor?.name || 'Expert Instructor'}</Text>
            </HStack>
            <Button
              variant="outline" 
              colorScheme="purple"
              _hover={{ bg: 'purple.500', color: 'white' }}
              size="sm"
            >
              Enroll Now
            </Button>
          </Flex>
        </VStack>
      </Grid>
    </MotionBox>
  );
}

function CategoryBadge({ category, isSelected, onClick }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const badgeBg = useColorModeValue(
    isSelected ? 'purple.500' : 'purple.50',
    isSelected ? 'purple.500' : 'gray.700'
  );
  
  const textColor = useColorModeValue(
    isSelected ? 'white' : 'purple.700',
    isSelected ? 'white' : 'purple.100'
  );
  
  return (
    <MotionBox
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        px={4}
        py={2}
        borderRadius="full"
        bg={badgeBg}
        color={textColor}
        fontWeight="semibold"
        cursor="pointer"
        boxShadow={isSelected ? 'md' : 'none'}
        onClick={onClick}
        transition="all 0.2s"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minW={isMobile ? "90px" : "120px"}
      >
        {category}
      </Box>
    </MotionBox>
  );
}

function ExplorePathsPage() {
  // States for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [learningPaths, setLearningPaths] = useState([]);
  const [featuredPaths, setFeaturedPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const scrollRef = useRef(null);
  
  const toast = useToast();
  const navigate = useNavigate();
  const { handleApiError } = useApiErrorHandler();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

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
        
        // Set featured paths (top rated or specially marked)
        const featured = pathsData
          .filter(path => path.rating >= 4.5 || path.featured)
          .slice(0, 3);
        setFeaturedPaths(featured);
        
        // Extract unique categories and levels
        if (pathsData.length > 0) {
          const uniqueCategories = [...new Set(pathsData.map(path => path.category).filter(Boolean))];
          const uniqueLevels = [...new Set(pathsData.map(path => path.level).filter(Boolean))];
          
          setCategories(uniqueCategories.length > 0 ? uniqueCategories : getDemoCategories());
          setLevels(uniqueLevels.length > 0 ? uniqueLevels : ['Beginner', 'Intermediate', 'Advanced']);
        }
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
  
  const getDemoCategories = () => {
    return ['Anatomy', 'Medicine', 'Healthcare', 'Biology', 'Physiology'];
  };
  
  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const heroBg = useColorModeValue('purple.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const searchBg = useColorModeValue('white', 'gray.700');
  const searchFocusBg = useColorModeValue('white', 'gray.600');

  return (
    <Box>
      {/* Hero Section with 3D Model */}
      <Box bg={heroBg} position="relative" overflow="hidden">
        <Container maxW="7xl" py={12} position="relative" zIndex={2}>
          <Grid templateColumns={{ base: "1fr", lg: "6fr 6fr" }} gap={8} alignItems="center">
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Heading 
                  as="h1" 
                  size="3xl" 
                  mb={4}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  Master New Skills Through Interactive Learning
                </Heading>
                <Text fontSize="xl" color="gray.600" maxW="32rem" mb={8}>
                  Explore our cutting-edge learning paths with 3D anatomical models, adaptive AI-powered lessons, and micro-sprints designed for maximum retention and engagement.
                </Text>
                <ButtonGroup spacing={4}>
                  <Button 
                    size="lg" 
                    colorScheme="purple" 
                    rightIcon={<ArrowForwardIcon />}
                    onClick={() => scrollRef.current.scrollIntoView({ behavior: 'smooth' })}
                    _hover={{ transform: 'translateY(-2px)' }}
                    animation={pulse}
                  >
                    Explore Paths
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="purple"
                    onClick={() => navigate('/course-generation')}
                  >
                    Create Custom Path
                  </Button>
                </ButtonGroup>
              </MotionBox>
            </GridItem>
            <GridItem display={{ base: "none", lg: "block" }}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <AspectRatio ratio={1} width="100%" maxH="500px">
                  <ThreeDAnatomyModel systemType="skeletal" />
                </AspectRatio>
              </MotionBox>
            </GridItem>
          </Grid>
        </Container>

        {/* Abstract background shapes */}
        <Box
          position="absolute"
          width="full"
          height="full"
          top={0}
          left={0}
          bg="transparent"
          zIndex={1}
          opacity={0.4}
          backgroundImage="url('data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%239F7AEA' fill-opacity='0.4' d='M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,202.7C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E')"
          backgroundSize="cover"
          backgroundPosition="center"
        />
      </Box>

      <Container maxW="7xl" py={12} ref={scrollRef}>
        {/* Featured Paths Slider */}
        <VStack spacing={8} align="start" mb={12}>
          <Heading size="xl" fontWeight="bold">
            Featured Learning Paths
          </Heading>
          <Stack spacing={8} w="full">
            <AnimatePresence>
              {featuredPaths.map((path, index) => (
                <FeaturedPathCard key={`featured-${path.id}`} path={path} index={index} />
              ))}
            </AnimatePresence>
          </Stack>
        </VStack>

        {/* Search and Filters */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          mb={8}
          p={6}
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
        >
          <VStack spacing={6}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={isSearchFocused ? accentColor : "gray.400"} />
              </InputLeftElement>
              <Input
                ref={searchInputRef}
                placeholder="Search for a specific skill or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={isSearchFocused ? searchFocusBg : searchBg}
                borderColor={isSearchFocused ? accentColor : borderColor}
                borderWidth={isSearchFocused ? "2px" : "1px"}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                _focus={{
                  boxShadow: `0 0 0 1px ${accentColor}`
                }}
                fontSize="lg"
              />
            </InputGroup>

            <Flex direction={{ base: "column", md: "row" }} width="full" gap={4} align="center">
              <Select
                placeholder="Select Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                size="lg"
                flex={{ md: 1 }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>

              <Select
                placeholder="Select Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                size="lg"
                flex={{ md: 1 }}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>

              <HStack spacing={2} width={{ base: "full", md: "auto" }}>
                <Tooltip label="Reset filters">
                  <IconButton
                    icon={<RepeatIcon />}
                    colorScheme="gray"
                    onClick={handleReset}
                    size="lg"
                  />
                </Tooltip>
                <Tooltip label={viewMode === 'grid' ? 'List view' : 'Grid view'}>
                  <IconButton
                    icon={viewMode === 'grid' ? <ViewIcon /> : <GridItem />}
                    colorScheme="gray"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    size="lg"
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </VStack>
        </MotionBox>

        {/* Category Tabs */}
        <Box mb={8} overflowX="auto" css={{ scrollbarWidth: 'none' }}>
          <Flex gap={3} pb={2} className="no-scrollbar">
            <CategoryBadge 
              category="All" 
              isSelected={selectedCategory === ''} 
              onClick={() => setSelectedCategory('')}
            />
            
            {categories.map(category => (
              <CategoryBadge
                key={category}
                category={category}
                isSelected={selectedCategory === category}
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </Flex>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} borderRadius="lg" overflow="hidden">
                <Skeleton height="200px" />
                <Box p={6}>
                  <SkeletonText mt={4} noOfLines={4} spacing={4} />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {/* Results Count and Sort Option */}
        {!isLoading && (
          <Flex justify="space-between" align="center" mb={6}>
            <HStack>
              <Badge colorScheme="purple" px={2} py={1} borderRadius="md" fontSize="md">
                {learningPaths.length}
              </Badge>
              <Text fontWeight="medium">
                {learningPaths.length === 1 ? 'Path' : 'Paths'} Found
              </Text>
            </HStack>
            <Select
              width="auto"
              size="sm"
              defaultValue="popular"
              borderColor={borderColor}
              bg={cardBg}
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="duration">Shortest First</option>
            </Select>
          </Flex>
        )}

        {/* Learning Paths Grid or List */}
        {!isLoading && learningPaths.length > 0 && (
          <MotionGrid
            templateColumns={viewMode === 'grid' 
              ? { base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } 
              : "1fr"
            }
            gap={8}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {learningPaths.map((path, index) => (
                <GridItem key={path.id}>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <PathCard path={path} />
                  </MotionBox>
                </GridItem>
              ))}
            </AnimatePresence>
          </MotionGrid>
        )}

        {/* Empty State */}
        {!isLoading && learningPaths.length === 0 && (
          <Center py={16} flexDirection="column">
            <InfoOutlineIcon boxSize={12} color="gray.400" mb={4} />
            <Heading size="lg" mb={2} textAlign="center">No paths found</Heading>
            <Text mb={8} textAlign="center" maxW="md">
              We couldn't find any learning paths matching your search criteria. Try adjusting your filters or create a custom path.
            </Text>
            <ButtonGroup spacing={4}>
              <Button colorScheme="purple" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button
                leftIcon={<AddIcon />}
                variant="outline"
                onClick={() => navigate('/course-generation')}
              >
                Create Custom Path
              </Button>
            </ButtonGroup>
          </Center>
        )}

        {/* Back to top button - appears when scrolling down */}
        <Box position="fixed" bottom="20px" right="20px" zIndex={10}>
          <ScaleFade in={true}>
            <IconButton
              aria-label="Scroll to top"
              icon={<ArrowUpIcon />}
              colorScheme="purple"
              rounded="full"
              size="lg"
              onClick={scrollToTop}
              opacity={0.8}
              _hover={{ opacity: 1 }}
              boxShadow="lg"
            />
          </ScaleFade>
        </Box>
      </Container>
    </Box>
  );
}

export default ExplorePathsPage; 