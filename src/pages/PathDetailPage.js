import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronLeftIcon, StarIcon, CheckCircleIcon, TimeIcon, LockIcon } from '@chakra-ui/icons';
import { fetchPathDetail, enrollUserInPath } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

function PathDetailPage() {
  const { pathId } = useParams();
  const [enrolling, setEnrolling] = useState(false);
  const [pathDetail, setPathDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  // Define color mode values at the top level
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('gray.50', 'gray.700');
  const heroBg = useColorModeValue('gray.50', 'gray.900');
  const infoBoxBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch path details from Supabase
  useEffect(() => {
    async function loadPathDetail() {
      try {
        setIsLoading(true);
        
        const { data, error } = await fetchPathDetail(pathId);
        
        if (error) {
          // Check for JSON parsing errors
          if (error.message && (
            error.message.includes('JSON Parse') || 
            error.message.includes('Unexpected token') || 
            error.message.includes('Unterminated string')
          )) {
            console.error('JSON parsing error:', error);
            setError('There was an error processing data from our servers');
            toast({
              title: 'Data Processing Error',
              description: 'We encountered an issue while processing the course data. Please try again later.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } else {
            console.error('Error fetching path details:', error);
            setError(error.message);
            toast({
              title: 'Error loading path details',
              description: error.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
          return;
        }
        
        setPathDetail(data);
      } catch (error) {
        // Check for JSON parsing errors in unexpected errors too
        if (error.message && (
          error.message.includes('JSON Parse') || 
          error.message.includes('Unexpected token') || 
          error.message.includes('Unterminated string')
        )) {
          console.error('JSON parsing error:', error);
          setError('There was an error processing data from our servers');
          toast({
            title: 'Data Processing Error',
            description: 'We encountered an issue while processing the course data. Please try again later.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.error('Unexpected error:', error);
          setError('An unexpected error occurred');
          toast({
            title: 'An unexpected error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPathDetail();
  }, [pathId, toast]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // If user is not logged in, redirect to login page
      toast({
        title: 'Login required',
        description: 'Please login to enroll in this path',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/login?redirect=/paths/${pathId}`);
      return;
    }
    
    setEnrolling(true);
    
    try {
      const { error } = await enrollUserInPath(pathId);
      
      if (error) {
        toast({
          title: 'Error enrolling in path',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Successfully enrolled',
          description: 'You are now enrolled in this learning path',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh path details to show progress UI
        const { data: refreshedData } = await fetchPathDetail(pathId);
        setPathDetail(refreshedData);
      }
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setEnrolling(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxW="7xl" py={20}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text>Loading path details...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxW="7xl" py={20}>
        <Center>
          <VStack spacing={4} maxW="md" textAlign="center">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              Failed to load path details
            </Alert>
            <Text>{error}</Text>
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => navigate('/explore')}
              colorScheme="purple"
              mt={4}
            >
              Back to Explore
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  // Not found state
  if (!pathDetail) {
    return (
      <Container maxW="7xl" py={20}>
        <Center>
          <VStack spacing={4} maxW="md" textAlign="center">
            <Heading>Path Not Found</Heading>
            <Text>The learning path you're looking for doesn't exist or has been removed.</Text>
            <Button
              leftIcon={<ChevronLeftIcon />}
              as={RouterLink}
              to="/explore"
              colorScheme="purple"
              mt={4}
            >
              Browse Learning Paths
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  // Calculate progress
  const progress = pathDetail.completedSprints > 0
    ? Math.round((pathDetail.completedSprints / pathDetail.total_sprints) * 100)
    : 0;

  // Count total time for all sprints
  const totalMinutes = pathDetail.modules?.reduce((total, module) => {
    return total + module.sprints.reduce((moduleTotal, sprint) => {
      const sprintTime = sprint.time ? parseInt(sprint.time, 10) : 0;
      return moduleTotal + sprintTime;
    }, 0);
  }, 0) || 0;

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={heroBg} py={8}>
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
                    <Text fontWeight="medium">{pathDetail.rating || 'N/A'}</Text>
                    <Text color="gray.500">({pathDetail.review_count || 0} reviews)</Text>
                  </HStack>
                  
                  <HStack>
                    <TimeIcon />
                    <Text>{pathDetail.estimated_time || 'N/A'}</Text>
                  </HStack>
                  
                  <Text>{pathDetail.total_sprints || 0} sprints</Text>
                </HStack>
                
                <HStack flexWrap="wrap" mt={2}>
                  {pathDetail.tags && pathDetail.tags.map(tag => (
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
                fallbackSrc="https://via.placeholder.com/500x300?text=No+Image"
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
            {pathDetail.instructor && (
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
            )}
            
            <Divider my={6} />
            
            {/* Learning Objectives */}
            {pathDetail.objectives && (
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
            )}
            
            <Divider my={6} />
            
            {/* Prerequisites */}
            {pathDetail.prerequisites && (
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
            )}
            
            <Divider my={6} />
            
            {/* Course Content */}
            {pathDetail.modules && pathDetail.modules.length > 0 && (
              <Box>
                <Heading size="md" mb={4}>Path Content</Heading>
                <Text mb={4}>
                  {pathDetail.modules.length} modules • {pathDetail.total_sprints} sprints • Total {totalMinutes} minutes
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
            )}
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
                            <Text>{pathDetail.completedSprints}/{pathDetail.total_sprints} sprints</Text>
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
                          <Text>{pathDetail.estimated_time || 'N/A'}</Text>
                        </HStack>
                        
                        <Text>
                          {pathDetail.students_count ? `${pathDetail.students_count.toLocaleString()} learners enrolled` : 'Be the first to enroll!'}
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
              {pathDetail.relatedPaths && pathDetail.relatedPaths.length > 0 && (
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
                          fallbackSrc="https://via.placeholder.com/80x80?text=Path"
                        />
                        <CardBody py={2}>
                          <Heading size="xs">{path.title}</Heading>
                          <HStack mt={1} fontSize="xs" color="gray.500" spacing={2}>
                            <Text>{path.level}</Text>
                            <Text>•</Text>
                            <Text>{path.total_sprints} sprints</Text>
                            <Text>•</Text>
                            <Text>{path.estimated_time}</Text>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default PathDetailPage;