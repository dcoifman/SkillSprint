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
  Select,
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
  const bgColor = useColorModeValue('var(--surface-color)', 'gray.800'); // Use CSS var
  const cardBgColor = useColorModeValue('white', 'gray.700'); // For cards, distinct from page bg if needed
  const borderColor = useColorModeValue('gray.300', 'gray.600'); // Slightly adjusted border color
  const primaryColor = useColorModeValue('var(--primary-color)', 'blue.300'); // CSS var for light, Chakra for dark
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'gray.400');
  const successColorLight = useColorModeValue('green.50', 'green.900'); // For backgrounds
  const errorColorLight = useColorModeValue('red.50', 'red.900'); // For backgrounds
  const successColorDark = useColorModeValue('green.600', 'green.300'); // For text
  const errorColorDark = useColorModeValue('red.600', 'red.300'); // For text


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
  
        // Log the raw sprint data
        console.log('Fetched sprint data:', sprint);

        // Get user progress if authenticated
        let progress = null;
        if (user) {
          console.log('Authenticated user object before fetching progress:', user);
          console.log('Attempting to fetch user progress for sprintId:', sprintId, 'and userId:', user.id);
          const { data: progressData, error: progressError } = await supabaseClient.supabase
            .from('user_progress') // This corresponds to user_sprint_progress in DB
            .select('*')
            .eq('sprint_id', sprintId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (progressError) {
            console.error('Error fetching user progress:', progressError);
          } else {
            console.log('Successfully fetched user progress:', progressData);
          }
          
          progress = progressData;
        }

        // Directly use the 'content' JSONB from the sprints table
        const rawSprintContent = sprint.content; // Get the raw content
        let sprintContent = null;

        // Attempt to parse the content if it's a string
        if (typeof rawSprintContent === 'string') {
          try {
            sprintContent = JSON.parse(rawSprintContent);
            console.log('Parsed sprint content string:', sprintContent);
          } catch (parseError) {
            console.error('Error parsing sprint content JSON string:', parseError);
            // Keep sprintContent as null or default if parsing fails
          }
        } else if (typeof rawSprintContent === 'object' && rawSprintContent !== null) {
             // If it's already an object (as expected for JSONB), use it directly
             sprintContent = rawSprintContent;
        }

        // Format the data for the component
        const formattedData = {
          id: sprint.id,
          title: sprint.title,
          path: sprint.module.path.title, // Access path title via nested relation
          // Use the steps array directly from the parsed sprintContent, default to empty array if not found or invalid
          steps: Array.isArray(sprintContent?.steps) ? sprintContent.steps : [],
          // Calculate total steps based on the actual steps array
          totalSteps: Array.isArray(sprintContent?.steps) ? sprintContent.steps.length : 1,
          estimatedTime: sprint.time || '10 min',
          progress: progress?.progress || 0,
        };

        // Handle case where steps array is empty after fetching (or parsing failed)
        if (formattedData.steps.length === 0) {
             // Provide a default step if no steps are found in the content
             formattedData.steps = [{
                type: 'content',
                title: sprint.title || 'Untitled Sprint Content',
                content: 'Content not available or improperly formatted.',
             }];
             formattedData.totalSteps = 1;
        }

        // Log the formatted data
        console.log('Formatted sprint data:', formattedData);

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

  const handleGeneratePracticeProblems = async (difficulty) => {
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

      const problems = await generatePracticeProblems(sprintData.title, currentStepContent, difficulty);
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
    if (!problemsString) return [];
    
    const problems = [];
    const problemBlocks = problemsString.split(/\n\n(?=\d+\.)/);

    problemBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length < 2) return;

      const question = lines[0].replace(/^\d+\.\s*/, '').trim();
      
      // Multiple Choice
      if (block.includes('A)') && block.includes('Answer:')) {
        const options = [];
        let correctAnswer = null;
        let explanation = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^[A-D]\)/)) {
            options.push(line.substring(3).trim());
          } else if (line.startsWith('Answer:')) {
            correctAnswer = line.match(/[A-D]/)?.[0];
          } else if (line.startsWith('Explanation:')) {
            explanation = line.substring('Explanation:'.length).trim();
          }
        }
        
        if (question && options.length >= 2 && correctAnswer) {
          problems.push({
            type: 'multiple_choice',
            question,
            options,
            correctAnswer,
            explanation
          });
        }
      } 
      // Fill in Blank
      else if (block.includes('Answer:') && question.includes('____')) {
        const answerLine = lines.find(l => l.startsWith('Answer:'));
        const explanationLine = lines.find(l => l.startsWith('Explanation:'));
        
        if (answerLine) {
          problems.push({
            type: 'fill_blank',
            question,
            correctAnswer: answerLine.substring('Answer:'.length).trim(),
            explanation: explanationLine ? explanationLine.substring('Explanation:'.length).trim() : ''
          });
        }
      }
      // Short Answer
      else if (block.includes('Answer:')) {
        const answerLine = lines.find(l => l.startsWith('Answer:'));
        
        if (answerLine) {
          problems.push({
            type: 'short_answer',
            question,
            correctAnswer: answerLine.substring('Answer:'.length).trim()
          });
        }
      }
    });

    return problems;
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Spinner size="xl" color={primaryColor} thickness="4px" />
      </Center>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <Container maxW="6xl" py={8} bg={bgColor}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          bg={errorColorLight}
          color={errorColorDark}
          borderRadius="var(--border-radius-lg)" // Use CSS var
          p={6} // Added padding
        >
          <AlertIcon boxSize="40px" mr={0} color={errorColorDark} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Error Loading Sprint
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="red" // Keep red for error emphasis
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
      <Container maxW="6xl" py={8} bg={bgColor}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color={primaryColor} thickness="4px" />
            <Text color={textColor}>Loading sprint content...</Text>
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
          variant="outline" // Changed for consistency
          colorScheme="gray" // Neutral color
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          Previous
        </Button>
        {!isLastStep && (
          <Button
            onClick={handleNextStep}
            colorScheme="blue" // Use new primary color scheme
            isDisabled={!canProgress}
            data-testid="next-button"
            rightIcon={<ChevronRightIcon />}
            _disabled={{ bg: useColorModeValue('blue.200', 'blue.700'), cursor: 'not-allowed' }}
          >
            {isQuizStep && !showFeedback ? 'Check Answer' : 'Next'}
          </Button>
        )}
      </Flex>
    );
  };

  const renderStepContent = () => {
    // Add protection against undefined currentStep
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'text':
        console.log('Rendering text step:', currentStep); // Debug logging
        const contentToRender = currentStep.content || currentStep.value;
        return (
          <VStack spacing={6} align="stretch">
            {currentStep.title && <Heading size="lg">{currentStep.title}</Heading>}
            <Box className="markdown-content">
              <MarkdownWithMath>
                {contentToRender || 'Content not available.'}
              </MarkdownWithMath>
            </Box>
            {renderNextButton(currentStep)}
          </VStack>
        );
      case 'content':
        return (
          <VStack spacing={6} align="stretch">
            {currentStep?.title && <Heading size="lg">{currentStep.title}</Heading>}
            
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
                      <Spinner size="xl" color={primaryColor} thickness="4px" />
                      <Text ml={4} color={textColor}>Loading 3D model...</Text>
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
                  borderRadius="var(--border-radius-lg)" // Use CSS var
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
            <Box className="markdown-content" color={textColor}>
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
              {/* Safely render title only if it exists */}
              {currentStep && currentStep.title && <Heading size="lg">{currentStep.title}</Heading>}
              <Text>{currentStep.content}</Text>
              
              <Card variant="outline" p={4} my={4}>
                <CardBody>
                  <ErrorBoundary fallback={
                    <Box p={4} bg="red.50" borderRadius="md">
                      <Text>Error loading the 3D model. You can still continue with the course.</Text>
                      <Button 
                        mt={2} 
                        size="sm" 
                        colorScheme="blue" // Use new primary color
                        onClick={() => setIsLoading(false)}
                      >
                        Try Again
                      </Button>
                    </Box>
                  }>
                    {isLoading ? (
                      <Flex justify="center" align="center" height="300px">
                        <Spinner size="xl" color={primaryColor} thickness="4px" />
                        <Text ml={4} color={textColor}>Loading 3D model...</Text>
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
            <Heading size="md" color={textColor}>{currentStep.title}</Heading>
            <Text fontWeight="medium" color={textColor}>{currentStep.question}</Text>
            
            <FormControl width="full" isRequired={!showFeedback}>
              <RadioGroup 
                onChange={handleAnswer} 
                value={userAnswers[currentStepIndex]?.toString()}
                isDisabled={showFeedback}
                width="full"
              >
                <VStack spacing={4} align="flex-start" width="full"> {/* Increased spacing */}
                  {currentStep.options.map((option, idx) => {
                    const isSelected = userAnswers[currentStepIndex] === idx;
                    const isCorrect = idx === currentStep.correctAnswer;
                    const feedbackBg = isCorrect ? successColorLight : errorColorLight;
                    const feedbackBorder = isCorrect ? successColorDark : errorColorDark;
                    const selectedBg = useColorModeValue('blue.50', 'blue.800'); // Primary theme color
                    const selectedBorder = primaryColor;

                    return (
                      <Box
                        key={idx}
                        p={4} // Increased padding
                        borderWidth="2px" // Slightly thicker border
                        borderRadius="var(--border-radius-md)" // Use CSS var
                        width="full"
                        bg={
                          showFeedback
                            ? isCorrect
                              ? successColorLight
                              : isSelected // Incorrectly selected
                              ? errorColorLight
                              : cardBgColor // Default for non-selected after feedback
                            : isSelected
                            ? selectedBg
                            : cardBgColor // Default before feedback
                        }
                        borderColor={
                          showFeedback
                            ? isCorrect
                              ? successColorDark
                              : isSelected // Incorrectly selected
                              ? errorColorDark
                              : borderColor // Default for non-selected after feedback
                            : isSelected
                            ? selectedBorder
                            : borderColor // Default before feedback
                        }
                        cursor={showFeedback ? 'default' : 'pointer'}
                        onClick={() => !showFeedback && handleAnswer(idx.toString())}
                        transition="background-color 0.2s ease-in-out, border-color 0.2s ease-in-out"
                        _hover={!showFeedback ? { 
                          borderColor: selectedBorder, 
                          bg: useColorModeValue('gray.50', 'gray.700') 
                        } : {}}
                      >
                        <Radio 
                          value={idx.toString()} 
                          width="full" 
                          colorScheme="blue" // Use new primary color for radio check
                          sx={{'.chakra-radio__label': {color: textColor}}} // Ensure label color
                        >
                          {option}
                        </Radio>
                      </Box>
                    );
                  })}
                </VStack>
              </RadioGroup>
            </FormControl>
            
            {showFeedback && (
              <Box 
                p={4} 
                bg={isCorrectAnswer(currentStepIndex) ? successColorLight : errorColorLight} 
                borderRadius="var(--border-radius-md)" // Use CSS var
                width="full"
                boxShadow="var(--shadow-md)" // Use CSS var
                borderWidth="1px"
                borderColor={isCorrectAnswer(currentStepIndex) ? successColorDark : errorColorDark}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold" color={isCorrectAnswer(currentStepIndex) ? successColorDark : errorColorDark}>
                    {isCorrectAnswer(currentStepIndex) ? 'Correct!' : 'Not quite right'}
                  </Text>
                </Flex>
                
                <Text mb={3} color={textColor}>
                  {isCorrectAnswer(currentStepIndex)
                    ? 'Good job! You\'ve got it right.'
                    : `The correct answer is: ${currentStep.options[currentStep.correctAnswer]}`}
                </Text>
                {currentStep.explanation && (
                  <Text fontSize="sm" color={textLightColor} mt={2}>
                    <strong>Explanation:</strong> {currentStep.explanation}
                  </Text>
                )}
              </Box>
            )}
            
            {/* Always render navigation buttons for quiz steps */}
            {renderNextButton(currentStep)}
          </VStack>
        );
      case 'completion':
        return (
          <VStack spacing={6} align="flex-start" width="full">
            <Heading size="md" color={textColor}>{currentStep.title}</Heading>
            <Text whiteSpace="pre-line" color={textColor}>{currentStep.content}</Text>
            <Box pt={4} width="full">
              <HStack justifyContent="space-between">
                <Button 
                  as={RouterLink}
                  to="/dashboard"
                  colorScheme="blue" // Use new primary color
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  colorScheme="blue" // Use new primary color
                  as={RouterLink}
                  to={`/sprint/${parseInt(currentSprintData.id) + 1}`} // Consider if next sprint logic is robust
                >
                  Next Sprint: {currentStep.nextSprintTitle || 'Unnamed Sprint'}
                </Button>
              </HStack>
            </Box>
          </VStack>
        );
      default:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Unsupported Content Type</Heading>
            <Text>This type of content cannot be displayed.</Text>
            {renderNextButton(currentStep)}
          </VStack>
        );
    }
  };

  return (
    <Container maxW="6xl" py={8} bg={bgColor}> {/* Ensure page background is applied */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .markdown-content h1 {
          font-size: 1.8rem;
          font-weight: 700; /* Corresponds to var(--font-weight-bold) or similar */
          margin-top: var(--spacing-lg); /* Use CSS var */
          margin-bottom: var(--spacing-md); /* Use CSS var */
          color: ${textColor};
        }
        .markdown-content h2 {
          font-size: 1.5rem; /* Corresponds to h2 */
          font-weight: 600;
          margin-top: var(--spacing-lg);
          margin-bottom: var(--spacing-sm);
          color: ${textColor};
        }
        .markdown-content h3 {
          font-size: 1.2rem; /* Corresponds to h3 */
          font-weight: 600;
          margin-top: var(--spacing-md);
          margin-bottom: var(--spacing-xs);
          color: ${textColor};
        }
        .markdown-content p {
          margin-bottom: var(--spacing-md);
          line-height: var(--line-height-base);
          color: ${textColor};
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          color: ${textColor};
        }
        .markdown-content li {
          margin-bottom: var(--spacing-sm);
        }
        .markdown-content strong {
          font-weight: 600; /* Poppins semi-bold */
        }
        .markdown-content em {
          font-style: italic;
        }
        .markdown-content blockquote {
          border-left: 4px solid ${borderColor}; /* Use theme border color */
          padding-left: var(--spacing-md);
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: ${textLightColor};
        }
        .markdown-content code {
          background-color: ${useColorModeValue('gray.100', 'gray.700')}; /* Subtle code background */
          padding: 0.2rem 0.4rem;
          border-radius: var(--border-radius-sm);
          font-family: var(--font-family-monospace);
          font-size: 0.9em; /* Slightly smaller for code */
          color: ${textColor};
        }
        .markdown-content pre {
          background-color: ${useColorModeValue('gray.100', 'gray.700')};
          padding: var(--spacing-md);
          border-radius: var(--border-radius-md);
          overflow-x: auto;
          margin-bottom: var(--spacing-md);
        }
        .markdown-content pre code {
          background-color: transparent; /* No double background */
          padding: 0;
        }
        .markdown-content a {
          color: ${primaryColor}; /* Use theme primary color */
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: ${useColorModeValue('var(--accent-color)', 'blue.200')}; /* Use accent color */
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
              color={textLightColor}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.700')}}
            >
              Back
            </Button>
            <Text color={textLightColor}>|</Text>
            <Text fontWeight="medium" color={textColor}>{currentSprintData.path}</Text>
          </HStack>
          <Badge colorScheme="blue" variant="subtle" fontSize="0.8em" px={3} py={1} borderRadius="var(--border-radius-md)"> {/* Use new primary color */}
            {currentSprintData.estimatedTime}
          </Badge>
        </Flex>
        
        <Heading size="xl" color={textColor}>{currentSprintData.title}</Heading> {/* Larger heading */}
        
        <Progress
          value={(currentSprintData.totalSteps <= 1) ? 100 : (currentStepIndex / (currentSprintData.totalSteps - 1)) * 100}
          size="sm"
          colorScheme="blue" // Use new primary color
          bg={useColorModeValue('gray.200', 'gray.600')} // Explicit background for progress
          borderRadius="var(--border-radius-full)" // More rounded
        />
        
        <Flex justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            Step {currentStepIndex + 1} of {currentSprintData.totalSteps}
          </Text>
          <Text fontSize="sm" color={textLightColor}>
            { (currentSprintData.totalSteps <= 1) ? '100' : Math.round((currentStepIndex / (currentSprintData.totalSteps - 1)) * 100)}% Complete
          </Text>
        </Flex>
      </VStack>

      {/* Main Content Card */}
      <Card
        bg={cardBgColor} // Use specific card background
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="var(--border-radius-lg)" // Use CSS var
        boxShadow="var(--shadow-md)" // Use CSS var
        overflow="hidden"
        mb={6}
      >
        <CardBody p={{ base: 4, md: 6 }}>{renderStepContent()}</CardBody> {/* Responsive padding */}
      </Card>
      
      {/* AI Tutor Accordion */}
      <Box mt={10}>
        <Accordion allowToggle>
          <AccordionItem 
            border="1px" 
            borderColor={borderColor} 
            borderRadius="var(--border-radius-lg)" // Use CSS var
            bg={cardBgColor} // Use card background
          >
            <h2>
              <AccordionButton _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }} borderRadius="var(--border-radius-lg)">
                <Box flex="1" textAlign="left" fontWeight="medium" color={textColor}>
                  Need help? Ask the AI tutor
                </Box>
                <AccordionIcon color={textColor} />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} borderTopWidth="1px" borderTopColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <Text>
                  What questions do you have about {currentStep?.title?.toLowerCase() || 'this topic'}?
                </Text>
                <Flex wrap="wrap"> {/* Allow buttons to wrap on smaller screens */}
                  <Button size="sm" mr={2} mb={2} variant="outline" colorScheme="gray">
                    Explain in simpler terms
                  </Button>
                  <Button size="sm" mr={2} mb={2} variant="outline" colorScheme="gray">
                    Give an example
                  </Button>
                  <Button size="sm" mb={2} variant="outline" colorScheme="gray">
                    Why is this important?
                  </Button>
                </Flex>
                
                <Divider borderColor={borderColor} />
                
                <HStack>
                  <Box // This would ideally be a proper Input/Textarea component
                    flex="1"
                    p={3} // Increased padding
                    borderWidth="1px"
                    borderRadius="var(--border-radius-md)" // Use CSS var
                    borderColor={borderColor}
                    _hover={{ borderColor: primaryColor }}
                  >
                    <Text color={textLightColor}>Type your question...</Text>
                  </Box>
                  <Button colorScheme="blue">Ask</Button> {/* Use new primary color */}
                </HStack>

                <HStack spacing={4}>
                  <Select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    width="150px"
                    isDisabled={isGeneratingProblems}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                  <Button 
                    colorScheme="purple"
                    onClick={() => handleGeneratePracticeProblems(selectedDifficulty)}
                    isLoading={isGeneratingProblems}
                  >
                    Generate Practice Problems
                  </Button>
                </HStack>

                {practiceProblems && (
                  <Box mt={4} p={4} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md">
                    <Heading size="sm" mb={2}>Practice Problems</Heading>
                    <VStack align="stretch" spacing={4}>
                      {parsePracticeProblems(practiceProblems).map((problem, index) => (
                        <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('white', 'gray.800')}>
                          <Text fontWeight="bold" mb={2}>{problem.question}</Text>
                          
                          {problem.type === 'multiple_choice' && (
                            <VStack align="stretch" spacing={2}>
                              {problem.options.map((option, i) => (
                                <HStack key={i}>
                                  <Text>{String.fromCharCode(65 + i)})</Text>
                                  <Text>{option}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          )}
                          
                          {problem.explanation && (
                            <Box mt={3} p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                              <Text fontSize="sm"><strong>Explanation:</strong> {problem.explanation}</Text>
                            </Box>
                          )}
                        </Box>
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