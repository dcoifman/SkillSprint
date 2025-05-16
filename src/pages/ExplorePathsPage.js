import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

function ExplorePathsPage() {
  // States for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Mock data for learning paths
  const categories = [
    'Technology', 'Business', 'Design', 'Marketing', 
    'Data Science', 'Personal Development', 'Leadership'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const learningPaths = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals',
      description: 'Learn the core concepts of machine learning, from basic algorithms to neural networks.',
      category: 'Data Science',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hY2hpbmUlMjBsZWFybmluZ3xlbnwwfHwwfHx8MA%3D%3D',
      totalSprints: 24,
      estimatedTime: '4 hours',
      studentsCount: 1245,
      tags: ['AI', 'Python', 'Neural Networks'],
      instructor: {
        name: 'Dr. Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
    {
      id: 2,
      title: 'Web Development with React',
      description: 'Master React.js and build modern, responsive web applications from scratch.',
      category: 'Technology',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhY3QlMjBqc3xlbnwwfHwwfHx8MA%3D%3D',
      totalSprints: 32,
      estimatedTime: '6 hours',
      studentsCount: 2780,
      tags: ['React', 'JavaScript', 'Frontend'],
      instructor: {
        name: 'Michael Taylor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
    {
      id: 3,
      title: 'Business Communication',
      description: 'Develop effective communication skills for professional environments and leadership.',
      category: 'Business',
      level: 'All Levels',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YnVzaW5lc3MlMjBjb21tdW5pY2F0aW9ufGVufDB8fDB8fHww',
      totalSprints: 18,
      estimatedTime: '3 hours',
      studentsCount: 3150,
      tags: ['Communication', 'Leadership', 'Presentations'],
      instructor: {
        name: 'Emma Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
    {
      id: 4,
      title: 'UX/UI Design Principles',
      description: 'Learn user-centered design approaches and create beautiful, functional interfaces.',
      category: 'Design',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHV4JTIwZGVzaWdufGVufDB8fDB8fHww',
      totalSprints: 22,
      estimatedTime: '4.5 hours',
      studentsCount: 1875,
      tags: ['UX', 'UI', 'Figma', 'Design Thinking'],
      instructor: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
    {
      id: 5,
      title: 'Data Analytics with Python',
      description: 'Learn to analyze and visualize data using Python\'s powerful libraries.',
      category: 'Data Science',
      level: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHwwfHx8MA%3D%3D',
      totalSprints: 28,
      estimatedTime: '5 hours',
      studentsCount: 2130,
      tags: ['Python', 'Pandas', 'Data Visualization', 'NumPy'],
      instructor: {
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
    {
      id: 6,
      title: 'Digital Marketing Essentials',
      description: 'Master the fundamentals of digital marketing strategies and channels.',
      category: 'Marketing',
      level: 'Beginner',
      image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRpZ2l0YWwlMjBtYXJrZXRpbmd8ZW58MHx8MHx8fDA%3D',
      totalSprints: 20,
      estimatedTime: '3.5 hours',
      studentsCount: 4280,
      tags: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
      instructor: {
        name: 'Jessica Martinez',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      }
    },
  ];

  // Filter learning paths based on search query and filters
  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? path.category === selectedCategory : true;
    const matchesLevel = selectedLevel ? path.level === selectedLevel : true;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </Box>

        {/* Category Tags */}
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

        {/* Results Count */}
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontWeight="medium">
            {filteredPaths.length} {filteredPaths.length === 1 ? 'path' : 'paths'} found
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

        {/* Learning Paths Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {filteredPaths.map((path) => (
            <Card
              key={path.id}
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
            >
              <Image
                src={path.image}
                alt={path.title}
                height="180px"
                objectFit="cover"
                width="100%"
              />
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Badge colorScheme="purple">{path.category}</Badge>
                    <Badge>{path.level}</Badge>
                  </HStack>
                  <Heading size="md">{path.title}</Heading>
                  <Text noOfLines={2} color="gray.500">
                    {path.description}
                  </Text>
                  <HStack flexWrap="wrap">
                    {path.tags.map((tag) => (
                      <Tag key={tag} size="sm" colorScheme="blue" mb={1}>
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                  <Flex w="full" justify="space-between" align="center">
                    <HStack>
                      <Avatar src={path.instructor.avatar} size="sm" />
                      <Text fontSize="sm">{path.instructor.name}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <AvatarGroup size="xs" max={3}>
                        <Avatar src="https://bit.ly/ryan-florence" />
                        <Avatar src="https://bit.ly/kent-c-dodds" />
                        <Avatar src="https://bit.ly/prosper-baba" />
                        <Avatar src="https://bit.ly/code-beast" />
                      </AvatarGroup>
                      <Text fontSize="xs" color="gray.500">+{path.studentsCount}</Text>
                    </HStack>
                  </Flex>
                  <Box pt={2} w="full">
                    <Flex justify="space-between" align="center" w="full" fontSize="sm" color="gray.500">
                      <Text>{path.totalSprints} sprints</Text>
                      <Text>{path.estimatedTime}</Text>
                    </Flex>
                  </Box>
                  <Button 
                    as={RouterLink} 
                    to={`/paths/${path.id}`} 
                    colorScheme="purple" 
                    size="md"
                    w="full"
                  >
                    View Path
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* No Results */}
        {filteredPaths.length === 0 && (
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
        {filteredPaths.length > 0 && (
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

export default ExplorePathsPage; 