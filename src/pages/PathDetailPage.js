import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
  Flex,
  Badge,
  VStack,
  HStack,
  SimpleGrid,
  Progress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Tag,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { ChevronLeftIcon, StarIcon, CheckCircleIcon, TimeIcon, LockIcon } from '@chakra-ui/icons';

function PathDetailPage() {
  const { pathId } = useParams();
  const [enrolling, setEnrolling] = useState(false);

  // In a real app, this would be fetched based on pathId
  const pathDetail = {
    id: pathId,
    title: 'Machine Learning Fundamentals',
    description: 'A comprehensive introduction to machine learning concepts, algorithms, and practical applications. Learn how to build models that can make predictions and improve with experience.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hY2hpbmUlMjBsZWFybmluZ3xlbnwwfHwwfHx8MA%3D%3D',
    category: 'Data Science',
    level: 'Beginner',
    rating: 4.8,
    reviewCount: 324,
    studentsCount: 1245,
    totalSprints: 24,
    completedSprints: 0,
    estimatedTime: '4 hours',
    tags: ['AI', 'Python', 'Neural Networks', 'Data Science'],
    prerequisites: [
      'Basic understanding of programming concepts', 
      'Familiarity with Python (recommended but not required)',
      'High school level mathematics'
    ],
    objectives: [
      'Understand machine learning foundations and key concepts',
      'Implement basic supervised and unsupervised learning algorithms',
      'Build neural network models for classification and regression tasks',
      'Apply machine learning to solve real-world problems',
      'Understand model evaluation and validation techniques'
    ],
    instructor: {
      name: 'Dr. Sarah Chen',
      title: 'AI Research Scientist & Educator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      bio: 'Dr. Sarah Chen is an AI researcher with over 10 years of experience at leading tech companies. She specializes in making complex machine learning concepts accessible to beginners.',
    },
    modules: [
      {
        title: 'Introduction to Machine Learning',
        description: 'Understand the core concepts and types of machine learning',
        sprints: [
          {
            id: 1,
            title: 'What is Machine Learning?',
            time: '8 min',
            isCompleted: false,
            isUnlocked: true,
          },
          {
            id: 2,
            title: 'Supervised vs Unsupervised Learning',
            time: '12 min',
            isCompleted: false,
            isUnlocked: true,
          },
          {
            id: 3,
            title: 'Key Machine Learning Applications',
            time: '10 min',
            isCompleted: false,
            isUnlocked: true,
          },
        ]
      },
      {
        title: 'Data Preparation for Machine Learning',
        description: 'Learn how to prepare and preprocess data for ML algorithms',
        sprints: [
          {
            id: 4,
            title: 'Data Cleaning Techniques',
            time: '15 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 5,
            title: 'Feature Scaling and Normalization',
            time: '12 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 6,
            title: 'Handling Missing Data',
            time: '10 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 7,
            title: 'Feature Engineering Fundamentals',
            time: '12 min',
            isCompleted: false,
            isUnlocked: false,
          },
        ]
      },
      {
        title: 'Supervised Learning Algorithms',
        description: 'Explore key supervised learning algorithms and their applications',
        sprints: [
          {
            id: 8,
            title: 'Linear Regression',
            time: '12 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 9,
            title: 'Logistic Regression',
            time: '10 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 10,
            title: 'Decision Trees',
            time: '15 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 11,
            title: 'Support Vector Machines',
            time: '12 min',
            isCompleted: false,
            isUnlocked: false,
          },
        ]
      },
      {
        title: 'Neural Networks Fundamentals',
        description: 'Understand the basics of neural networks and deep learning',
        sprints: [
          {
            id: 12,
            title: 'Introduction to Neural Networks',
            time: '10 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 13,
            title: 'Activation Functions',
            time: '8 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 14,
            title: 'Backpropagation Explained',
            time: '15 min',
            isCompleted: false,
            isUnlocked: false,
          },
          {
            id: 15,
            title: 'Building Your First Neural Network',
            time: '18 min',
            isCompleted: false,
            isUnlocked: false,
          },
        ]
      },
    ],
    relatedPaths: [
      {
        id: 101,
        title: 'Data Science with Python',
        level: 'Intermediate',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHwwfHx8MA%3D%3D',
        totalSprints: 28,
        estimatedTime: '5 hours',
      },
      {
        id: 102,
        title: 'Deep Learning Specialization',
        level: 'Advanced',
        image: 'https://images.unsplash.com/photo-1677442135136-760302227f2a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVlcCUyMGxlYXJuaW5nfGVufDB8fDB8fHww',
        totalSprints: 36,
        estimatedTime: '7 hours',
      },
      {
        id: 103,
        title: 'Practical Data Visualization',
        level: 'Beginner',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGRhdGElMjB2aXN1YWxpemF0aW9ufGVufDB8fDB8fHww',
        totalSprints: 20,
        estimatedTime: '3.5 hours',
      },
    ],
  };

  const handleEnroll = () => {
    setEnrolling(true);
    
    // In a real app, this would be an API call to enroll the user
    setTimeout(() => {
      setEnrolling(false);
      // Navigate or show success message
    }, 1500);
  };

  // Calculate progress
  const progress = pathDetail.completedSprints > 0
    ? Math.round((pathDetail.completedSprints / pathDetail.totalSprints) * 100)
    : 0;

  // Count total time
  const totalMinutes = pathDetail.modules.reduce((total, module) => {
    return total + module.sprints.reduce((moduleTotal, sprint) => {
      return moduleTotal + parseInt(sprint.time);
    }, 0);
  }, 0);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="7xl">
          <Button
            as={RouterLink}
            to="/explore"
            leftIcon={<ChevronLeftIcon />}
            variant="ghost"
            size="sm"
            mb={4}
          >
            Back to Explore
          </Button>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
            <Box flex="2">
              <VStack align="start" spacing={4}>
                <HStack>
                  <Badge colorScheme="purple">{pathDetail.category}</Badge>
                  <Badge>{pathDetail.level}</Badge>
                </HStack>
                
                <Heading as="h1" size="2xl">
                  {pathDetail.title}
                </Heading>
                
                <Text fontSize="lg" color="gray.600">
                  {pathDetail.description}
                </Text>
                
                <HStack spacing={6} mt={2}>
                  <HStack>
                    <StarIcon color="yellow.400" />
                    <Text fontWeight="medium">{pathDetail.rating}</Text>
                    <Text color="gray.500">({pathDetail.reviewCount} reviews)</Text>
                  </HStack>
                  
                  <HStack>
                    <TimeIcon />
                    <Text>{pathDetail.estimatedTime}</Text>
                  </HStack>
                  
                  <Text>{pathDetail.totalSprints} sprints</Text>
                </HStack>
                
                <HStack flexWrap="wrap" mt={2}>
                  {pathDetail.tags.map(tag => (
                    <Tag key={tag} size="md" colorScheme="blue" m={1}>
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </VStack>
            </Box>
            
            <Box flex="1">
              <Image
                src={pathDetail.image}
                alt={pathDetail.title}
                borderRadius="lg"
                width="100%"
                height="250px"
                objectFit="cover"
              />
            </Box>
          </Flex>
        </Container>
      </Box>
      
      <Container maxW="7xl" py={8}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Main Content */}
          <Box gridColumn={{ lg: 'span 2' }}>
            {/* Instructor Section */}
            <Box mb={8}>
              <Heading size="md" mb={4}>About the Instructor</Heading>
              <HStack spacing={4} align="start">
                <Avatar size="xl" src={pathDetail.instructor.avatar} />
                <Box>
                  <Heading size="sm">{pathDetail.instructor.name}</Heading>
                  <Text color="gray.500">{pathDetail.instructor.title}</Text>
                  <Text mt={2}>{pathDetail.instructor.bio}</Text>
                </Box>
              </HStack>
            </Box>
            
            <Divider my={6} />
            
            {/* Learning Objectives */}
            <Box mb={8}>
              <Heading size="md" mb={4}>What You'll Learn</Heading>
              <List spacing={3}>
                {pathDetail.objectives.map((objective, index) => (
                  <ListItem key={index} display="flex">
                    <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                    <Text>{objective}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Divider my={6} />
            
            {/* Prerequisites */}
            <Box mb={8}>
              <Heading size="md" mb={4}>Prerequisites</Heading>
              <List spacing={3}>
                {pathDetail.prerequisites.map((req, index) => (
                  <ListItem key={index} display="flex">
                    <ListIcon as={CheckCircleIcon} color="purple.500" mt={1} />
                    <Text>{req}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Divider my={6} />
            
            {/* Course Content */}
            <Box>
              <Heading size="md" mb={4}>Path Content</Heading>
              <Text mb={4}>
                {pathDetail.modules.length} modules • {pathDetail.totalSprints} sprints • Total {totalMinutes} minutes
              </Text>
              
              <Accordion allowMultiple defaultIndex={[0]}>
                {pathDetail.modules.map((module, moduleIndex) => (
                  <AccordionItem key={moduleIndex} borderWidth="1px" borderRadius="md" mb={4} bg={cardBg} borderColor={borderColor}>
                    <AccordionButton py={4}>
                      <Box flex="1" textAlign="left">
                        <Heading size="sm">{module.title}</Heading>
                        <Text color="gray.500" fontSize="sm" mt={1}>
                          {module.sprints.length} sprints
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text mb={4} color="gray.600">
                        {module.description}
                      </Text>
                      
                      <VStack spacing={3} align="stretch">
                        {module.sprints.map((sprint) => (
                          <Flex 
                            key={sprint.id} 
                            p={3} 
                            borderRadius="md" 
                            justify="space-between"
                            align="center"
                            bg={sprint.isUnlocked ? highlightColor : 'transparent'}
                            opacity={sprint.isUnlocked ? 1 : 0.7}
                          >
                            <HStack>
                              {sprint.isCompleted ? (
                                <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
                              ) : sprint.isUnlocked ? (
                                <Icon viewBox="0 0 24 24" boxSize={5} color="purple.500">
                                  <path
                                    fill="currentColor"
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                                  />
                                </Icon>
                              ) : (
                                <LockIcon color="gray.500" />
                              )}
                              <Text fontWeight={sprint.isUnlocked ? "medium" : "normal"}>
                                {sprint.title}
                              </Text>
                            </HStack>
                            
                            <HStack spacing={4}>
                              <Text fontSize="sm" color="gray.500">
                                {sprint.time}
                              </Text>
                              {sprint.isUnlocked && (
                                <Button 
                                  size="sm" 
                                  colorScheme="purple" 
                                  variant={sprint.isCompleted ? "outline" : "solid"}
                                  as={RouterLink}
                                  to={`/sprint/${sprint.id}`}
                                >
                                  {sprint.isCompleted ? "Review" : "Start"}
                                </Button>
                              )}
                            </HStack>
                          </Flex>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          </Box>
          
          {/* Sidebar */}
          <Box>
            <VStack spacing={8} position="sticky" top="100px">
              {/* Enrollment Card */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                width="100%"
                boxShadow="lg"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {progress > 0 ? (
                      <>
                        <Heading size="md">Your Progress</Heading>
                        <Box>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">{progress}% complete</Text>
                            <Text>{pathDetail.completedSprints}/{pathDetail.totalSprints} sprints</Text>
                          </Flex>
                          <Progress value={progress} colorScheme="purple" size="sm" mt={2} borderRadius="full" />
                        </Box>
                        
                        <Button 
                          as={RouterLink}
                          to={`/sprint/${pathDetail.modules[0].sprints[0].id}`}
                          colorScheme="purple" 
                          size="lg" 
                          width="100%"
                        >
                          Continue Learning
                        </Button>
                      </>
                    ) : (
                      <>
                        <Heading size="md">Join This Learning Path</Heading>
                        <HStack>
                          <Icon as={TimeIcon} />
                          <Text>{pathDetail.estimatedTime}</Text>
                        </HStack>
                        
                        <Text>
                          {pathDetail.studentsCount.toLocaleString()} learners enrolled
                        </Text>
                        
                        <Button 
                          colorScheme="purple" 
                          size="lg" 
                          width="100%"
                          isLoading={enrolling}
                          onClick={handleEnroll}
                        >
                          Enroll Now - Free
                        </Button>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
              
              {/* Related Paths */}
              <Box width="100%">
                <Heading size="md" mb={4}>Related Learning Paths</Heading>
                <VStack spacing={4} align="stretch">
                  {pathDetail.relatedPaths.map(path => (
                    <Card 
                      key={path.id} 
                      direction="row"
                      overflow="hidden"
                      variant="outline"
                      size="sm"
                      as={RouterLink}
                      to={`/paths/${path.id}`}
                      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      <Image
                        objectFit="cover"
                        maxW="80px"
                        src={path.image}
                        alt={path.title}
                      />
                      <CardBody py={2}>
                        <Heading size="xs">{path.title}</Heading>
                        <HStack mt={1} fontSize="xs" color="gray.500" spacing={2}>
                          <Text>{path.level}</Text>
                          <Text>•</Text>
                          <Text>{path.totalSprints} sprints</Text>
                          <Text>•</Text>
                          <Text>{path.estimatedTime}</Text>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default PathDetailPage; 