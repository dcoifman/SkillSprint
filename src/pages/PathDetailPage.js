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
  Textarea,
} from '@chakra-ui/react';
import { ChevronLeftIcon, StarIcon, CheckCircleIcon, TimeIcon, LockIcon } from '@chakra-ui/icons';
import { fetchPathDetail, enrollUserInPath, saveLearningSummary, fetchLearningSummary } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.js';
import { generateLearningSummary } from '../services/geminiClient.js';
import ReactMarkdown from 'react-markdown';

function PathDetailPage() {
  const { pathId } = useParams();
  const [enrolling, setEnrolling] = useState(false);
  const [pathDetail, setPathDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personalizedSummary, setPersonalizedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  
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

  // Effect to generate summary when path is completed
  useEffect(() => {
    // Calculate progress inside the effect to ensure pathDetail is available
    const progress = pathDetail?.completedSprints > 0
      ? Math.round((pathDetail.completedSprints / pathDetail.total_sprints) * 100)
      : 0;

    const loadAndGenerateSummary = async () => {
      if (progress === 100 && pathDetail) {
        setIsLoadingSummary(true); // Start loading state
        try {
          // 1. Attempt to load existing summary
          const { data: savedSummary, error: fetchSummaryError } = await fetchLearningSummary(pathId);

          if (savedSummary) {
            setPersonalizedSummary(savedSummary);
            setIsLoadingSummary(false); // Stop loading on success
          } else if (fetchSummaryError && fetchSummaryError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error fetching saved learning summary:', fetchSummaryError);
            toast({
              title: 'Error loading summary',
              description: 'Failed to load saved learning summary.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setIsLoadingSummary(false); // Stop loading on error
          } else {
            // 2. If no existing summary, generate a new one
            setIsGeneratingSummary(true); // Start generating state
            setIsLoadingSummary(false); // Stop loading state as we are now generating

            try {
              // Assuming pathDetail contains information about completed sprints
              const completedSprintTitles = pathDetail.modules
                .flatMap(module => module.sprints)
                .filter(sprint => sprint.isCompleted)
                .map(sprint => sprint.title);

              const summary = await generateLearningSummary(pathDetail.title, completedSprintTitles);
              setPersonalizedSummary(summary);

              // Save the generated summary to Supabase
              const { error: saveError } = await saveLearningSummary(pathId, summary);
              if (saveError) {
                console.error('Error saving learning summary:', saveError);
                toast({
                  title: 'Error saving summary',
                  description: 'Failed to save learning summary.',
                  status: 'warning',
                  duration: 3000,
                  isClosable: true,
                });
              }
            } catch (err) {
              console.error('Error generating personalized summary:', err);
              toast({
                title: 'Error generating summary',
                description: 'Failed to generate learning summary.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            } finally {
              setIsGeneratingSummary(false); // Stop generating state
            }
          }
        } catch (err) {
          console.error('Exception during loading/generating learning summary:', err);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred while processing the summary.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setIsLoadingSummary(false); // Stop loading on exception
          setIsGeneratingSummary(false); // Stop generating on exception
        }
      }
    };

    // Only run if pathDetail is loaded and progress is 100, and no summary is currently being generated or loaded
    if (pathDetail && (pathDetail.completedSprints / pathDetail.total_sprints) * 100 === 100 && !personalizedSummary && !isGeneratingSummary && !isLoadingSummary) {
       loadAndGenerateSummary();
    }

  }, [pathId, pathDetail, personalizedSummary, isGeneratingSummary, isLoadingSummary, toast]); // Add all relevant dependencies

  // Add this function near other utility functions in the component
  const generateModuleSummary = async (moduleTitle, completedSprintTitles) => {
    const prompt = `Generate a concise learning summary for the module "${moduleTitle}" covering these sprints:\n\n${completedSprintTitles.map(title => `- ${title}`).join('\n')}\n\nHighlight key connections between concepts and overall module takeaways.`;

    try {
      const response = await generateContent(prompt);
      return response;
    } catch (error) {
      console.error('Error in generateModuleSummary:', error);
      throw error;
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
                fallbackSrc="https://placehold.co/500x300/e2e8f0/1a202c?text=No+Image"
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

                        {/* Add this after the sprints list: */}
                        {module.sprints.filter(s => s.isCompleted).length > 0 && (
                          <Box mt={4} p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                            <Heading size="sm" mb={2}>Module Summary</Heading>
                            {module.summary ? (
                              <ReactMarkdown>{module.summary}</ReactMarkdown>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={async () => {
                                  const completedSprints = module.sprints.filter(s => s.isCompleted);
                                  const summary = await generateModuleSummary(
                                    module.title, 
                                    completedSprints.map(s => s.title)
                                  );
                                  // Update module state with new summary
                                  setPathDetail(prev => ({
                                    ...prev,
                                    modules: prev.modules.map(m => 
                                      m.id === module.id ? { ...m, summary } : m
                                    )
                                  }));
                                }}
                                isLoading={isGeneratingSummary}
                              >
                                Generate Summary
                              </Button>
                            )}
                          </Box>
                        )}
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
                          fallbackSrc="https://placehold.co/80x80/e2e8f0/1a202c?text=Path"
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

              {/* Personalized Learning Summary (Visible when path is 100% complete) */}
              {progress === 100 && (pathDetail?.completedSprints / pathDetail?.total_sprints) * 100 === 100 && (
                <Box width="100%">
                  <Heading size="md" mb={4}>Your Learning Summary</Heading>
                  {isGeneratingSummary || isLoadingSummary ? (
                    <Center py={4}>
                      <Spinner size="md" color="purple.500" mr={2} />
                      <Text>{isGeneratingSummary ? 'Generating summary...' : 'Loading summary...'}</Text>
                    </Center>
                  ) : personalizedSummary ? (
                    <Box p={4} bg={useColorModeValue('green.50', 'green.700')} borderRadius="md">
                      <ReactMarkdown>{personalizedSummary}</ReactMarkdown>
                    </Box>
                  ) : (
                    <Box p={4} bg={useColorModeValue('yellow.50', 'yellow.700')} borderRadius="md">
                      <Text color={useColorModeValue('yellow.800', 'yellow.200')}>No learning summary available yet.</Text>
                    </Box>
                  )}
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