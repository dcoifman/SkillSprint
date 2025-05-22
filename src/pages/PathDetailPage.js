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

  // Define color mode values using CSS variables and Chakra fallbacks
  const pageBg = useColorModeValue('var(--background-color)', 'gray.800');
  const heroBg = useColorModeValue('var(--surface-color)', 'gray.800'); // Hero on a slightly elevated surface or matching page bg
  const cardBg = useColorModeValue('var(--surface-color)', 'gray.700'); // For cards, accordions
  const altCardBg = useColorModeValue('gray.50', 'gray.700'); // For highlighted items or subtle contrast
  const borderColor = useColorModeValue('gray.200', 'gray.600'); // Adjusted for better visibility on new bg
  const primaryColor = useColorModeValue('var(--primary-color)', 'blue.300');
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'gray.400');
  const successColor = useColorModeValue('var(--success-color)', 'green.300');
  const accentColor = useColorModeValue('var(--accent-color)', 'orange.300');


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
      <Container maxW="7xl" py={20} bg={pageBg}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} thickness="4px" />
            <Text color={textColor}>Loading path details...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxW="7xl" py={20} bg={pageBg}>
        <Center>
          <VStack spacing={4} maxW="md" textAlign="center">
            <Alert status="error" borderRadius="var(--border-radius-md)" bg={useColorModeValue('red.50', 'red.900')} p={4}>
              <AlertIcon color={useColorModeValue('var(--error-color)', 'red.300')} />
              <Heading size="sm" color={useColorModeValue('var(--error-color)', 'red.300')} ml={2}>Failed to load path details</Heading>
            </Alert>
            <Text color={textLightColor}>{error}</Text>
            <Button
              leftIcon={<ChevronLeftIcon />}
              onClick={() => navigate('/explore')}
              colorScheme="blue" // Updated color scheme
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
      <Container maxW="7xl" py={20} bg={pageBg}>
        <Center>
          <VStack spacing={4} maxW="md" textAlign="center">
            <Heading color={textColor}>Path Not Found</Heading>
            <Text color={textLightColor}>The learning path you're looking for doesn't exist or has been removed.</Text>
            <Button
              leftIcon={<ChevronLeftIcon />}
              as={RouterLink}
              to="/explore"
              colorScheme="blue" // Updated color scheme
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
    <Box bg={pageBg}> {/* Applied pageBg to the root Box */}
      {/* Hero Section */}
      <Box bg={heroBg} py={10} borderBottom="1px" borderColor={borderColor}> {/* Themed hero section */}
        <Container maxW="7xl">
          <Button
            as={RouterLink}
            to="/explore"
            leftIcon={<ChevronLeftIcon />}
            variant="ghost"
            size="sm"
            mb={6} // Increased margin
            color={textLightColor}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.700')}}
          >
            Back to Explore
          </Button>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={10}> {/* Increased gap */}
            <Box flex="2">
              <VStack align="start" spacing={5}> {/* Increased spacing */}
                <HStack>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="var(--border-radius-md)">{pathDetail.category}</Badge> {/* Themed badge */}
                  <Badge colorScheme="gray" variant="subtle" px={3} py={1} borderRadius="var(--border-radius-md)">{pathDetail.level}</Badge> {/* Themed badge */}
                </HStack>
                
                <Heading as="h1" size="2xl" color={textColor}>
                  {pathDetail.title}
                </Heading>
                
                <Text fontSize="lg" color={textLightColor}>
                  {pathDetail.description}
                </Text>
                
                <HStack spacing={6} mt={2} color={textLightColor}>
                  <HStack>
                    <Icon as={StarIcon} color={accentColor} /> {/* Themed icon */}
                    <Text fontWeight="medium" color={textColor}>{pathDetail.rating || 'N/A'}</Text>
                    <Text>({pathDetail.review_count || 0} reviews)</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={TimeIcon} />
                    <Text color={textColor}>{pathDetail.estimated_time || 'N/A'}</Text>
                  </HStack>
                  
                  <Text color={textColor}>{pathDetail.total_sprints || 0} sprints</Text>
                </HStack>
                
                <HStack flexWrap="wrap" mt={2}>
                  {pathDetail.tags && pathDetail.tags.map(tag => (
                    <Tag key={tag} size="md" colorScheme="blue" variant="solid" m={1} borderRadius="var(--border-radius-md)"> {/* Themed tag */}
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
                borderRadius="var(--border-radius-lg)" // Use CSS var
                width="100%"
                height="280px" // Slightly increased height
                objectFit="cover"
                boxShadow="var(--shadow-lg)" // Added shadow
                fallbackSrc="https://placehold.co/500x300/e2e8f0/1a202c?text=No+Image"
              />
            </Box>
          </Flex>
        </Container>
      </Box>
      
      <Container maxW="7xl" py={10}> {/* Increased padding */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}> {/* Increased spacing */}
          {/* Main Content */}
          <Box gridColumn={{ lg: 'span 2' }}>
            {/* Instructor Section */}
            {pathDetail.instructor && (
              <Box mb={8} p={6} bg={cardBg} borderRadius="var(--border-radius-lg)" boxShadow="var(--shadow-md)"> {/* Themed card */}
                <Heading size="md" mb={4} color={textColor}>About the Instructor</Heading>
                <HStack spacing={4} align="start">
                  <Avatar size="xl" src={pathDetail.instructor.avatar_url || pathDetail.instructor.avatar} name={pathDetail.instructor.name} /> {/* Added name for fallback */}
                  <Box>
                    <Heading size="sm" color={textColor}>{pathDetail.instructor.name}</Heading>
                    <Text color={textLightColor}>{pathDetail.instructor.title}</Text>
                    <Text mt={2} color={textColor}>{pathDetail.instructor.bio}</Text>
                  </Box>
                </HStack>
              </Box>
            )}
            
            <Divider my={6} />
            
            {/* Learning Objectives */}
            {pathDetail.objectives && (
              <Box mb={8} p={6} bg={altCardBg} borderRadius="var(--border-radius-lg)" boxShadow="var(--shadow-sm)"> {/* Themed box */}
                <Heading size="md" mb={4} color={textColor}>What You'll Learn</Heading>
                <List spacing={3}>
                  {pathDetail.objectives.map((objective, index) => (
                    <ListItem key={index} display="flex" color={textColor}>
                      <ListIcon as={CheckCircleIcon} color={successColor} mt={1} /> {/* Themed icon */}
                      <Text>{objective}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Prerequisites */}
            {pathDetail.prerequisites && (
              <Box mb={8} p={6} bg={altCardBg} borderRadius="var(--border-radius-lg)" boxShadow="var(--shadow-sm)"> {/* Themed box */}
                <Heading size="md" mb={4} color={textColor}>Prerequisites</Heading>
                <List spacing={3}>
                  {pathDetail.prerequisites.map((req, index) => (
                    <ListItem key={index} display="flex" color={textColor}>
                      <ListIcon as={CheckCircleIcon} color={primaryColor} mt={1} /> {/* Themed icon */}
                      <Text>{req}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Course Content */}
            {pathDetail.modules && pathDetail.modules.length > 0 && (
              <Box>
                <Heading size="lg" mb={3} color={textColor}>Path Content</Heading> {/* Increased size */}
                <Text mb={6} color={textLightColor}> {/* Increased margin */}
                  {pathDetail.modules.length} modules • {pathDetail.total_sprints} sprints • Total {totalMinutes} minutes
                </Text>
                
                <Accordion allowMultiple defaultIndex={[0]}>
                  {pathDetail.modules.map((module, moduleIndex) => (
                    <AccordionItem 
                      key={moduleIndex} 
                      borderWidth="0px" // Remove default border, rely on card styling
                      borderRadius="var(--border-radius-lg)" // Use CSS var
                      mb={6} // Increased spacing
                      bg={cardBg} 
                      boxShadow="var(--shadow-md)" // Use CSS var
                      _hover={{ boxShadow: "var(--shadow-lg)" }}
                      transition="box-shadow 0.2s ease-in-out"
                    >
                      <AccordionButton 
                        py={5} // Increased padding
                        px={6} // Increased padding
                        borderRadius="var(--border-radius-lg)"
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.600') }}
                      >
                        <Box flex="1" textAlign="left">
                          <Heading size="sm" color={textColor}>{module.title}</Heading>
                          <Text color={textLightColor} fontSize="sm" mt={1}>
                            {module.sprints.length} sprints
                          </Text>
                        </Box>
                        <AccordionIcon color={primaryColor} />
                      </AccordionButton>
                      <AccordionPanel pb={5} px={6}> {/* Increased padding */}
                        <Text mb={4} color={textLightColor} fontSize="sm">
                          {module.description}
                        </Text>
                        
                        <VStack spacing={4} align="stretch"> {/* Increased spacing */}
                          {module.sprints.map((sprint) => {
                            const isLocked = !sprint.isUnlocked; // Assuming isUnlocked is available
                            const isCompleted = sprint.isCompleted; // Assuming isCompleted is available
                            const isNextUp = sprint.isUnlocked && !sprint.isCompleted; // Basic next up logic

                            let sprintIcon = <Icon as={TimeIcon} color={textLightColor} boxSize={5} />;
                            let sprintBg = altCardBg;
                            let sprintOpacity = 1;
                            let titleColor = textColor;
                            let buttonVariant = "solid";
                            let buttonColorScheme = "blue";
                            let buttonText = "Start";

                            if (isLocked) {
                              sprintIcon = <Icon as={LockIcon} color={textLightColor} boxSize={5} />;
                              sprintOpacity = 0.6;
                              titleColor = textLightColor;
                              buttonText = "Locked";
                            } else if (isCompleted) {
                              sprintIcon = <Icon as={CheckCircleIcon} color={successColor} boxSize={5} />;
                              sprintBg = useColorModeValue('green.50', 'green.900');
                              titleColor = textLightColor;
                              buttonVariant = "outline";
                              buttonText = "Review";
                            } else if (isNextUp) { // Highlight next up
                              sprintIcon = <Icon as={TimeIcon} color={primaryColor} boxSize={5} />; // Or FiPlayCircle
                              sprintBg = useColorModeValue('blue.50', 'rgba(74,144,226,0.2)'); // Light primary bg
                            }

                            return (
                              <Flex 
                                key={sprint.id} 
                                p={4} // Increased padding
                                borderRadius="var(--border-radius-md)" // Use CSS var
                                justify="space-between"
                                align="center"
                                bg={sprintBg}
                                opacity={sprintOpacity}
                                borderWidth={isNextUp ? "1px" : "1px"}
                                borderColor={isNextUp ? primaryColor : borderColor}
                                _hover={!isLocked ? { borderColor: primaryColor, bg: useColorModeValue('gray.100', 'gray.600')} : {}}
                                transition="background-color 0.2s, border-color 0.2s"
                              >
                                <HStack spacing={4}> {/* Increased spacing */}
                                  {sprintIcon}
                                  <Text fontWeight={isNextUp ? "semibold" : "medium"} color={titleColor}>
                                    {sprint.title}
                                  </Text>
                                </HStack>
                                
                                <HStack spacing={4}>
                                  <Text fontSize="sm" color={textLightColor}>
                                    {sprint.time} min
                                  </Text>
                                  {!isLocked && (
                                    <Button 
                                      size="sm" 
                                      colorScheme={buttonColorScheme}
                                      variant={buttonVariant}
                                      as={RouterLink}
                                      to={`/sprint/${sprint.id}`}
                                      isDisabled={isLocked}
                                    >
                                      {buttonText}
                                    </Button>
                                  )}
                                </HStack>
                              </Flex>
                            );
                          })}
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
            <VStack spacing={8} position={{ base: 'static', lg: 'sticky' }} top={{ lg: 'var(--spacing-xl)' }}> {/* Sticky top with var */}
              {/* Enrollment Card */}
              <Card
                bg={cardBg}
                borderRadius="var(--border-radius-lg)" // Use CSS var
                boxShadow="var(--shadow-lg)" // Prominent shadow
                width="100%"
                borderWidth="0px" // No border if shadow is strong
              >
                <CardBody p={6}> {/* Increased padding */}
                  <VStack spacing={5} align="stretch"> {/* Increased spacing */}
                    {progress > 0 ? (
                      <>
                        <Heading size="md" color={textColor}>Your Progress</Heading>
                        <Box>
                          <Flex justify="space-between">
                            <Text fontWeight="medium" color={textColor}>{progress}% complete</Text>
                            <Text color={textLightColor}>{pathDetail.completedSprints}/{pathDetail.total_sprints} sprints</Text>
                          </Flex>
                          <Progress value={progress} colorScheme="blue" size="md" mt={2} borderRadius="var(--border-radius-full)" bg={useColorModeValue('gray.200', 'gray.600')} /> {/* Themed progress */}
                        </Box>
                        
                        <Button 
                          as={RouterLink}
                          // TODO: Ensure this links to the correct next available sprint, not just the first one.
                          to={`/sprint/${pathDetail.modules[0]?.sprints[0]?.id}`} 
                          colorScheme="blue" 
                          size="lg" 
                          width="100%"
                          mt={2} // Added margin
                        >
                          Continue Learning
                        </Button>
                      </>
                    ) : (
                      <>
                        <Heading size="md" color={textColor}>Join This Learning Path</Heading>
                        <HStack color={textLightColor}>
                          <Icon as={TimeIcon} />
                          <Text color={textColor}>{pathDetail.estimated_time || 'N/A'}</Text>
                        </HStack>
                        
                        <Text color={textColor}>
                          {pathDetail.students_count ? `${pathDetail.students_count.toLocaleString()} learners enrolled` : 'Be the first to enroll!'}
                        </Text>
                        
                        <Button 
                          colorScheme="blue" 
                          size="lg" 
                          width="100%"
                          isLoading={enrolling}
                          onClick={handleEnroll}
                          mt={2} // Added margin
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
                <Box width="100%" mt={4}> {/* Added margin top */}
                  <Heading size="md" mb={4} color={textColor}>Related Learning Paths</Heading>
                  <VStack spacing={4} align="stretch">
                    {pathDetail.relatedPaths.map(path => (
                      <Card 
                        key={path.id} 
                        direction={{ base: 'column', sm: 'row' }} // Responsive direction
                        overflow="hidden"
                        variant="outline"
                        bg={cardBg} // Themed background
                        borderColor={borderColor}
                        borderRadius="var(--border-radius-md)" // Use CSS var
                        size="sm"
                        as={RouterLink}
                        to={`/paths/${path.id}`}
                        _hover={{ boxShadow: "var(--shadow-md)", transform: 'translateY(-2px)' }} // Use CSS var for shadow
                        transition="all 0.2s ease-in-out"
                      >
                        <Image
                          objectFit="cover"
                          w={{ base: '100%', sm: '100px' }} // Responsive width
                          h={{ base: '100px', sm: 'auto' }} // Responsive height
                          src={path.image}
                          alt={path.title}
                          fallbackSrc="https://placehold.co/100x80/e2e8f0/1a202c?text=Path"
                        />
                        <CardBody py={3} px={4}> {/* Adjusted padding */}
                          <Heading size="xs" color={textColor} mb={1}>{path.title}</Heading>
                          <HStack fontSize="xs" color={textLightColor} spacing={2} wrap="wrap"> {/* Allow wrap */}
                            <Text>{path.level}</Text>
                            <Text>•</Text>
                            <Text>{path.total_sprints} sprints</Text>
                            <Text display={{ base: 'none', md: 'inline' }}>•</Text> {/* Hide on smaller screens */}
                            <Text display={{ base: 'none', md: 'inline' }}>{path.estimated_time}</Text>
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