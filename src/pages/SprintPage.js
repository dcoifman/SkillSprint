import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Progress,
  Text,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Card,
  CardBody,
  Badge,
  IconButton,
  Divider,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  AspectRatio,
  useToast,
  FormControl,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import InteractiveAnatomyModel from '../components/InteractiveAnatomyModel.js';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel.js';
import ErrorBoundary from '../components/ErrorBoundary.js';
import MarkdownWithMath from '../components/MarkdownWithMath.js';
import supabaseClient from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.js';
import { generatePracticeProblems } from '../services/geminiClient.js';
import { savePracticeProblems, fetchPracticeProblems } from '../services/supabaseClient.js';
import PracticeProblemItem from '../components/PracticeProblemItem.js';

function SprintPage() {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sprintData, setSprintData] = useState(null);
  const [practiceProblems, setPracticeProblems] = useState('');
  const [isGeneratingProblems, setIsGeneratingProblems] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Combine the two useEffects that watch currentStep into one
  useEffect(() => {
    // Validate current step index
    if (currentStepIndex < 0 || (sprintData?.steps && currentStepIndex >= sprintData.steps.length)) {
      console.error('Invalid step index:', currentStepIndex);
      setCurrentStepIndex(0);
      return;
    }

    // Reset states on step change
    setShowFeedback(false);
    setIsLoading(false);

    // Get current step
    const currentStep = sprintData?.steps?.[currentStepIndex];

    // Handle 3D model loading if needed
    if (currentStep?.useThreeDModel || (currentStep?.type === 'interactive' && currentStep?.componentType === 'anatomy')) {
      setIsLoading(true);
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentStepIndex, sprintData]);

  // Keep the fetchSprintData effect separate
  useEffect(() => {
    async function fetchSprintData() {
      try {
        // Wait for auth to be initialized
        if (authLoading) return;

        // First get the sprint details
        const { data: sprint, error: sprintError } = await supabaseClient.supabase
          .from('sprints')
          .select(`
            *,
            module:module_id (
              *,
              path:path_id (
                *,
                instructor:instructor_id (*)
              )
            )
          `)
          .eq('id', sprintId)
          .single();

        if (sprintError) throw sprintError;
        if (!sprint) throw new Error('Sprint not found');
  
        // Get user progress if authenticated
        let progress = null;
        if (user) {
          const { data: progressData } = await supabaseClient.supabase
            .from('user_progress')
            .select('*')
            .eq('sprint_id', sprintId)
            .eq('user_id', user.id)
            .single();
          
          progress = progressData;
        }

        // Get sprint content
        const { data: contentData } = await supabaseClient.supabase
          .from('sprint_contents')
          .select('content')
          .eq('request_id', sprint.module.path.course_generation_request_id)
          .eq('module_index', sprint.module.order_index)
          .eq('sprint_index', sprint.order_index)
          .single();
    
        // Format the data for the component
        const formattedData = {
          id: sprint.id,
          title: sprint.title,
          path: sprint.module.path.title,
          totalSteps: contentData?.content?.steps?.length || 1,
          estimatedTime: sprint.time || '10 min',
          progress: progress?.progress || 0,
          steps: contentData?.content?.steps || [{
            type: 'content',
            title: sprint.title,
            content: sprint.content || 'Content not available.',
          }]
        };

        setSprintData(formattedData);
        setError(null);

        // Fetch saved practice problems for this sprint
        const { data: savedProblems, error: fetchProblemsError } = await fetchPracticeProblems(sprintId);
        if (fetchProblemsError && fetchProblemsError.code !== 'PGRST116') {
          console.error('Error fetching saved practice problems:', fetchProblemsError);
        } else if (savedProblems) {
          setPracticeProblems(savedProblems);
        }

      } catch (err) {
        console.error('Error fetching sprint data:', err);
        setError(err.message);
    toast({
          title: 'Error loading sprint',
          description: err.message,
          status: 'error',
      duration: 5000,
      isClosable: true,
    });
      } finally {
        setIsLoading(false);
      }
    }

    if (sprintId) {
      fetchSprintData();
    }
  }, [sprintId, user, authLoading, toast]);

  const handleAnswer = (value) => {
    const answer = parseInt(value, 10);
    setUserAnswers(prev => ({
      ...prev,
      [currentStepIndex]: answer,
    }));
    console.log(`Set answer for question ${currentStepIndex} to ${answer}`);
  };

  const handleNextStep = () => {
    if (!sprintData || !sprintData.steps) {
      console.error('Invalid sprint data');
      return;
    }

    const currentStep = sprintData.steps[currentStepIndex];
    if (!currentStep) {
      console.error('Invalid current step');
      return;
    }

    if (currentStep.type === 'quiz' && !showFeedback) {
      setShowFeedback(true);
      return;
    }
    
    if (currentStepIndex < sprintData.steps.length - 1) {
      setIsLoading(false);
      setShowFeedback(false);
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      console.log(`Moving to step ${currentStepIndex + 1}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleModelError = () => {
    setIsLoading(false);
    toast({
      title: "Model loading error",
      description: "There was a problem loading the 3D model. You can still continue with the course.",
      status: "warning",
      duration: 5000,
      isClosable: true,
    });
  };

  const isCorrectAnswer = (stepIndex) => {
    const step = sprintData?.steps?.[stepIndex];
    return step?.type === 'quiz' && userAnswers[stepIndex] === step.correctAnswer;
  };

  const handleGeneratePracticeProblems = async () => {
    if (!sprintData || !sprintData.steps || currentStepIndex >= sprintData.steps.length) {
      toast({
        title: 'Cannot generate problems',
        description: 'Sprint data is not available.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingProblems(true);
    setPracticeProblems('');

    try {
      const currentStepContent = sprintData.steps[currentStepIndex].content;
      if (!currentStepContent) {
         toast({
          title: 'No content to generate problems from',
          description: 'The current sprint step has no content.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const problems = await generatePracticeProblems(sprintData.title, currentStepContent);
      setPracticeProblems(problems);
      
      // Save the generated problems to Supabase
      const { error: saveError } = await savePracticeProblems(sprintId, problems);
      if (saveError) {
        console.error('Error saving practice problems:', saveError);
        toast({
          title: 'Error saving problems',
          description: 'Failed to save practice problems.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

    } catch (err) {
      console.error('Error generating practice problems:', err);
      toast({
        title: 'Error generating problems',
        description: 'Failed to generate practice problems. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingProblems(false);
    }
  };

  // Function to parse the practice problems string
  const parsePracticeProblems = (problemsString) => {
    const problems = [];
    const problemBlocks = problemsString.split(/Problem \d+:\s*/).filter(block => block.trim() !== '');

    problemBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length < 6) return; // Minimum lines: question, 4 options, answer

      const question = lines[0].trim();
      const options = lines.slice(1, 5).map(optionLine => optionLine.substring(3).trim()); // Remove A) , B) etc.
      const answerLine = lines[5];
      const correctAnswerMatch = answerLine.match(/^Answer:\s*([A-D])/);
      const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : null;

      if (question && options.length === 4 && correctAnswer) {
        problems.push({
          question,
          options,
          correctAnswer
        });
      }
    });

    return problems;
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Error Loading Sprint
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="red"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  // Show loading state while fetching sprint data
  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text>Loading sprint content...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  // Get the current sprint data based on the sprint ID
  const currentSprintData = sprintData || { 
    id: "not-found",
    title: "Sprint Not Found",
    path: "Error",
    totalSteps: 1,
    progress: 0,
    steps: [{ 
      type: 'content',
      title: 'Sprint Not Found', 
      content: error || 'The requested sprint could not be found. Please go back to the dashboard and try again.' 
    }]
  };
  
  // Get the current step based on current step index
  const currentStep = currentSprintData.steps?.[currentStepIndex] || {
    type: 'content',
    title: 'Error Loading Step',
    content: 'There was a problem loading this step. Please try refreshing the page or return to the dashboard.',
  };

  // Helper to render the Next and Previous buttons
  const renderNextButton = (currentStep) => {
    // Always show the button, even if currentStep is undefined
    const isLastStep = currentStepIndex === currentSprintData.steps.length - 1;
    const isQuizStep = currentStep?.type === 'quiz';
    const canProgress = !isQuizStep || (isQuizStep && (showFeedback || userAnswers[currentStepIndex] !== undefined));

    return (
      <Flex justify="space-between" width="100%" mt={4}>
        <Button
          onClick={handlePrevStep}
          leftIcon={<ChevronLeftIcon />}
          isDisabled={currentStepIndex === 0}
          variant="ghost"
        >
          Previous
        </Button>
        {!isLastStep && (
          <Button
            onClick={handleNextStep}
            colorScheme="purple"
            isDisabled={!canProgress}
            data-testid="next-button"
            rightIcon={<ChevronRightIcon />}
          >
            {isQuizStep && !showFeedback ? 'Check Answer' : 'Next'}
          </Button>
        )}
      </Flex>
    );
  };

  const renderStepContent = () => {
    // Add protection against undefined currentStep
    if (!currentStep) {
      console.error("Current step is undefined - unable to render content");
      return (
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Error Loading Content</Heading>
          <Text>There was a problem loading this step. Please try refreshing the page.</Text>
          <Button 
            as={RouterLink}
            to="/dashboard"
            colorScheme="purple"
          >
            Return to Dashboard
          </Button>
        </VStack>
      );
    }

    // Handle different content types
    const renderContentItem = (item) => {
      switch (item.type) {
        case 'text':
          return (
            <Text mb={4}>
              {item.value}
            </Text>
          );
        case 'key_point':
          return (
            <Box p={4} bg="purple.50" borderRadius="md" mb={4}>
              <Text fontWeight="bold" color="purple.700">
                Key Point: {item.value}
              </Text>
            </Box>
          );
        case 'example':
          return (
            <Box p={4} bg="blue.50" borderRadius="md" mb={4}>
              <Text fontWeight="medium" color="blue.700">
                Example: {item.value}
              </Text>
            </Box>
          );
        case 'visual_tree':
          return (
            <Box p={4} bg="green.50" borderRadius="md" mb={4}>
              <Text fontWeight="medium" color="green.700" whiteSpace="pre-line">
                {item.value.split('->').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part.trim()}
                    {i < arr.length - 1 && (
                      <ChevronRightIcon mx={2} color="green.500" />
                    )}
                  </React.Fragment>
                ))}
              </Text>
            </Box>
          );
        case 'activity':
          return (
            <Card mb={4}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Heading size="sm" color="orange.500">
                    Activity
                  </Heading>
                  <Text>{item.value}</Text>
                </VStack>
              </CardBody>
            </Card>
          );
        case 'reflection':
          return (
            <Box p={4} bg="gray.50" borderRadius="md" mb={4} borderLeft="4px solid" borderColor="gray.400">
              <Text fontStyle="italic">
                Reflection: {item.value}
              </Text>
            </Box>
          );
        default:
          return (
            <Text mb={4}>
              {item.value}
            </Text>
          );
      }
    };

    // Render content based on step type
    switch (currentStep.type) {
      case 'content':
        return (
          <VStack spacing={6} align="stretch">
            {currentStep.title && <Heading size="lg">{currentStep.title}</Heading>}
            
            {currentStep.introduction && (
              <Text fontSize="lg" color="gray.600" mb={4}>
                {currentStep.introduction}
              </Text>
            )}
            
            {currentStep.useThreeDModel ? (
              <Box borderRadius="md" overflow="hidden" my={4}>
                <ErrorBoundary fallback={
                  <Box p={4} bg="red.50" borderRadius="md">
                    <Text>Error loading the 3D model. You can still continue with the course.</Text>
                  </Box>
                }>
                  {isLoading ? (
                    <Flex justify="center" align="center" height="300px">
                      <Spinner size="xl" color="purple.500" thickness="4px" />
                      <Text ml={4}>Loading 3D model...</Text>
                    </Flex>
                  ) : (
                    <ThreeDAnatomyModel 
                      systemType={currentStep.modelType || 'skeletal'} 
                      initialView="anterior"
                      onSelectStructure={(structure) => toast({
                        title: structure,
                        description: `You selected the ${structure}`,
                        status: 'info',
                        duration: 2000,
                      })}
                      onError={handleModelError}
                    />
                  )}
                </ErrorBoundary>
              </Box>
            ) : currentStep.image ? (
              <AspectRatio ratio={16/9} maxH="400px" my={4}>
                <Image
                  src={currentStep.image}
                  alt={currentStep.title}
                  objectFit="cover"
                  borderRadius="md"
                />
              </AspectRatio>
            ) : null}
            
            {Array.isArray(currentStep.content) ? (
              currentStep.content.map((item, index) => (
                <Box key={index}>
                  {renderContentItem(item)}
                </Box>
              ))
            ) : (
            <Box className="markdown-content">
              <MarkdownWithMath>
                  {currentStep.content || 'Content not available.'}
              </MarkdownWithMath>
            </Box>
            )}
            
            {/* Always render navigation buttons, even if there's an error */}
            {renderNextButton(currentStep)}
          </VStack>
        );
      case 'interactive':
        if (currentStep.componentType === 'anatomy') {
          return (
            <VStack spacing={6} align="stretch">
              {currentStep.title && <Heading size="lg">{currentStep.title}</Heading>}
              <Text>{currentStep.content}</Text>
              
              <Card variant="outline" p={4} my={4}>
                <CardBody>
                  <ErrorBoundary fallback={
                    <Box p={4} bg="red.50" borderRadius="md">
                      <Text>Error loading the 3D model. You can still continue with the course.</Text>
                      <Button 
                        mt={2} 
                        size="sm" 
                        colorScheme="purple" 
                        onClick={() => setIsLoading(false)}
                      >
                        Try Again
                      </Button>
                    </Box>
                  }>
                    {isLoading ? (
                      <Flex justify="center" align="center" height="300px">
                        <Spinner size="xl" color="purple.500" thickness="4px" />
                        <Text ml={4}>Loading 3D model...</Text>
                      </Flex>
                    ) : (
                      <ThreeDAnatomyModel 
                        systemType={currentStep.systemType || 'skeletal'}
                        initialView="anterior"
                        onSelectStructure={(structure) => toast({
                          title: structure,
                          description: `You selected the ${structure}`,
                          status: 'info',
                          duration: 2000,
                        })}
                        fallbackImage="/img/anatomy_fallback.png"
                        onError={handleModelError}
                      />
                    )}
                  </ErrorBoundary>
                </CardBody>
              </Card>
              
              {/* Always render navigation buttons, even if there's an error */}
              {renderNextButton(currentStep)}
            </VStack>
          );
        }
        return null;
      case 'quiz':
        return (
          <VStack spacing={6} align="flex-start" width="full">
            <Heading size="md">{currentStep.title}</Heading>
            <Text fontWeight="medium">{currentStep.question}</Text>
            
            <FormControl width="full" isRequired={!showFeedback}>
              <RadioGroup 
                onChange={handleAnswer} 
                value={userAnswers[currentStepIndex]?.toString()}
                isDisabled={showFeedback}
                width="full"
              >
                <VStack spacing={3} align="flex-start" width="full">
                  {currentStep.options.map((option, idx) => (
                    <Box
                      key={idx}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      width="full"
                      bg={
                        showFeedback
                          ? idx === currentStep.correctAnswer
                            ? 'green.50'
                            : idx === userAnswers[currentStepIndex]
                            ? 'red.50'
                            : 'white'
                          : userAnswers[currentStepIndex] === idx
                          ? 'purple.50'
                          : 'white'
                      }
                      borderColor={
                        showFeedback
                          ? idx === currentStep.correctAnswer
                            ? 'green.400'
                            : idx === userAnswers[currentStepIndex]
                            ? 'red.400'
                            : 'gray.200'
                          : userAnswers[currentStepIndex] === idx
                          ? 'purple.400'
                          : 'gray.200'
                      }
                      cursor={showFeedback ? 'default' : 'pointer'}
                      onClick={() => !showFeedback && handleAnswer(idx.toString())}
                    >
                      <Radio value={idx.toString()} width="full">
                        {option}
                      </Radio>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>
            </FormControl>
            
            {showFeedback && (
              <Box 
                p={4} 
                bg={isCorrectAnswer(currentStepIndex) ? 'green.50' : 'red.50'} 
                borderRadius="md"
                width="full"
                boxShadow="md"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold" color={isCorrectAnswer(currentStepIndex) ? 'green.600' : 'red.600'}>
                    {isCorrectAnswer(currentStepIndex) ? 'Correct!' : 'Not quite right'}
                  </Text>
                </Flex>
                
                <Text mb={3}>
                  {isCorrectAnswer(currentStepIndex)
                    ? 'Good job! You\'ve got it right.'
                    : `The correct answer is: ${currentStep.options[currentStep.correctAnswer]}`}
                </Text>
              </Box>
            )}
            
            {/* Always render navigation buttons for quiz steps */}
            {renderNextButton(currentStep)}
          </VStack>
        );
      case 'completion':
        return (
          <VStack spacing={6} align="flex-start" width="full">
            <Heading size="md">{currentStep.title}</Heading>
            <Text whiteSpace="pre-line">{currentStep.content}</Text>
            <Box pt={4} width="full">
              <HStack justifyContent="space-between">
                <Button 
                  as={RouterLink}
                  to="/dashboard"
                  colorScheme="purple"
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  colorScheme="purple"
                  as={RouterLink}
                  to={`/sprint/${parseInt(currentSprintData.id) + 1}`}
                >
                  Next Sprint: {currentStep.nextSprintTitle}
                </Button>
              </HStack>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="6xl" py={8}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .markdown-content h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content strong {
          font-weight: 600;
        }
        .markdown-content em {
          font-style: italic;
        }
        .markdown-content blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }
        .markdown-content code {
          background-color: #f7fafc;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .markdown-content pre {
          background-color: #f7fafc;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .markdown-content a {
          color: #3182ce;
          text-decoration: underline;
        }
      `}} />
      
      {/* Header */}
      <VStack spacing={5} align="stretch" mb={8}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Button
              as={RouterLink}
              to="/dashboard"
              leftIcon={<ChevronLeftIcon />}
              variant="ghost"
              size="sm"
            >
              Back
            </Button>
            <Text color="gray.500">|</Text>
            <Text fontWeight="medium">{currentSprintData.path}</Text>
          </HStack>
          <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1}>
            {currentSprintData.estimatedTime}
          </Badge>
        </Flex>
        
        <Heading size="lg">{currentSprintData.title}</Heading>
        
        <Progress
          value={(currentStepIndex / (currentSprintData.totalSteps - 1)) * 100}
          size="sm"
          colorScheme="purple"
          borderRadius="full"
        />
        
        <Flex justify="space-between">
          <Text fontSize="sm" fontWeight="medium">
            {currentStepIndex + 1} of {currentSprintData.totalSteps}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {Math.round((currentStepIndex / (currentSprintData.totalSteps - 1)) * 100)}% Complete
          </Text>
        </Flex>
      </VStack>

      {/* Main Content */}
      <Card
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        mb={6}
      >
        <CardBody p={6}>{renderStepContent()}</CardBody>
      </Card>
      
      {/* AI Tutor */}
      <Box mt={10}>
        <Accordion allowToggle>
          <AccordionItem border="1px" borderColor={borderColor} borderRadius="md">
            <h2>
              <AccordionButton bg={bgColor} _hover={{ bg: 'gray.50' }}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  Need help? Ask the AI tutor
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Text>
                  What questions do you have about {currentStep.title.toLowerCase()}?
                </Text>
                <Flex>
                  <Button size="sm" mr={2} variant="outline">
                    Explain in simpler terms
                  </Button>
                  <Button size="sm" mr={2} variant="outline">
                    Give an example
                  </Button>
                  <Button size="sm" variant="outline">
                    Why is this important?
                  </Button>
                </Flex>
                
                <Divider />
                
                <HStack>
                  <Box
                    flex="1"
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ borderColor: 'purple.400' }}
                  >
                    <Text color="gray.500">Type your question...</Text>
                  </Box>
                  <Button colorScheme="purple">Ask</Button>
                </HStack>

                <Button 
                  colorScheme="purple"
                  onClick={handleGeneratePracticeProblems}
                  isLoading={isGeneratingProblems}
                  isDisabled={!sprintData || !sprintData.steps || currentStepIndex >= sprintData.steps.length}
                  mt={4}
                >
                  Generate Practice Problems
                </Button>

                {practiceProblems && (
                  <Box mt={4} p={4} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md">
                    <Heading size="sm" mb={2}>Practice Problems</Heading>
                    <VStack align="stretch" spacing={3}>
                      {/* Render parsed practice problems */}
                      {parsePracticeProblems(practiceProblems).map((problem, index) => (
                        <PracticeProblemItem key={index} problem={problem} />
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Container>
  );
}

export default SprintPage; 