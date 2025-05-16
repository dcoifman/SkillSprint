import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { fetchLearningPaths } from '../services/supabaseClient';
import PathCard from '../components/PathCard';
import useApiErrorHandler from '../hooks/useApiErrorHandler';

function ExplorePathsPage() {
  // States for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [learningPaths, setLearningPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const toast = useToast();
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
        
        setLearningPaths(data || []);
        
        // Extract unique categories and levels
        if (data && data.length > 0) {
          const uniqueCategories = [...new Set(data.map(path => path.category))];
          const uniqueLevels = [...new Set(data.map(path => path.level))];
          
          setCategories(uniqueCategories);
          setLevels(uniqueLevels);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLearningPaths();
  }, [selectedCategory, selectedLevel, searchQuery, handleApiError]);
  
  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchLearningPaths({
          category: selectedCategory || null,
          level: selectedLevel || null,
          search: searchQuery,
        }).then(({ data, error }) => {
          if (!error) {
            setLearningPaths(data || []);
          }
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      <Container maxW="7xl" py={8}>
        {/* Hero Section */}
        <Box textAlign="center" mb={12}>
          <Heading as="h1" size="2xl" mb={4}>
            Explore Learning Paths
          </Heading>
          <Text fontSize="xl" color="gray.500" maxW="2xl" mx="auto">
            Discover curated skill paths designed to help you master new abilities through adaptive micro-learning
          </Text>
        </Box>

        {/* Search and Filters */}
        <Box mb={10}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <InputGroup size="lg" flex="1">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Search for skills, topics, or keywords..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
              />
            </InputGroup>
            <HStack spacing={4}>
              <Select 
                placeholder="Category" 
                size="lg" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                minW="150px"
                isDisabled={isLoading || categories.length === 0}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <Select 
                placeholder="Level" 
                size="lg" 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                minW="150px"
                isDisabled={isLoading || levels.length === 0}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </Box>

        {/* Category Tags */}
        {categories.length > 0 && (
        <Box mb={10}>
          <HStack spacing={3} flexWrap="wrap">
            {categories.map(category => (
              <Tag 
                key={category} 
                size="lg" 
                variant={selectedCategory === category ? "solid" : "subtle"}
                colorScheme="purple"
                cursor="pointer"
                onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                mb={2}
              >
                {category}
              </Tag>
            ))}
          </HStack>
        </Box>
        )}

        {/* Loading State */}
        {isLoading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text>Loading learning paths...</Text>
            </VStack>
          </Center>
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Heading size="md" color="red.500">Error loading content</Heading>
              <Text>{error}</Text>
              <Button 
                colorScheme="purple"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </VStack>
          </Center>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontWeight="medium">
              {learningPaths.length} {learningPaths.length === 1 ? 'path' : 'paths'} found
          </Text>
          <Select 
            placeholder="Sort by" 
            size="sm" 
            maxW="200px"
            bg={cardBg}
            borderColor={borderColor}
            defaultValue="popularity"
          >
            <option value="popularity">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="shortest">Shortest First</option>
            <option value="longest">Longest First</option>
          </Select>
        </Flex>
        )}

        {/* Learning Paths Grid */}
        {!isLoading && !error && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {learningPaths.map((path) => (
              <PathCard key={path.id} path={path} />
          ))}
        </SimpleGrid>
        )}

        {/* No Results */}
        {!isLoading && !error && learningPaths.length === 0 && (
          <Box textAlign="center" py={10}>
            <Heading size="md" mb={2}>No paths found</Heading>
            <Text color="gray.500">Try adjusting your search or filters</Text>
            <Button 
              mt={4} 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedLevel('');
              }}
              colorScheme="purple"
            >
              Clear Filters
            </Button>
          </Box>
        )}

        {/* Load More Button */}
        {!isLoading && !error && learningPaths.length > 0 && (
          <Box textAlign="center" mt={10}>
            <Button size="lg" variant="outline" colorScheme="purple">
              Load More Paths
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function PathCard({ path }) {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const tagBg = useColorModeValue('gray.100', 'gray.700');

  const handleClick = () => {
    navigate(`/path/${path.id}`);
  };

  return (
    <Card
      bg={cardBg}
      overflow="hidden"
      variant="outline"
      cursor="pointer"
      onClick={handleClick}
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        transition: 'all 0.2s',
      }}
    >
      <Image
        src={path.image}
        alt={path.title}
        height="200px"
        objectFit="cover"
      />
      <CardBody>
        <VStack align="start" spacing={3}>
          <Flex justify="space-between" width="100%">
            <Badge colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'}>
              {path.level}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {path.estimated_time}
            </Text>
          </Flex>
          
          <Heading size="md" noOfLines={2}>
            {path.title}
          </Heading>
          
          <Text noOfLines={2} color="gray.500">
            {path.description}
          </Text>
          
          <HStack spacing={2}>
            {path.tags.map((tag, index) => (
              <Tag key={index} size="sm" bg={tagBg}>
                {tag}
              </Tag>
            ))}
          </HStack>
          
          <Flex width="100%" justify="space-between" align="center">
            <HStack>
              <Avatar size="sm" src={path.instructor.avatar} name={path.instructor.name} />
              <Text fontSize="sm">{path.instructor.name}</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {path.students_count.toLocaleString()} students
            </Text>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default ExplorePathsPage; 