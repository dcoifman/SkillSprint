import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

function SprintPage() {
  const { sprintId } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Mock data - in a real app, this would be fetched from API
  const sprintData = {
    id: sprintId,
    title: 'Neural Networks Fundamentals',
    path: 'Machine Learning Basics',
    totalSteps: 5,
    estimatedTime: '12 min',
    progress: 0,
    steps: [
      {
        type: 'content',
        title: 'What are Neural Networks?',
        content: `A neural network is a series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.

Neural networks can adapt to changing input; so the network generates the best possible result without needing to redesign the output criteria.`,
        image: null,
      },
      {
        type: 'quiz',
        title: 'Quick Check',
        question: 'What do neural networks mimic in their operation?',
        options: [
          'Computer processors',
          'The human brain',
          'Database structures',
          'Logic gates',
        ],
        correctAnswer: 1,
      },
      {
        type: 'content',
        title: 'Structure of Neural Networks',
        content: `Neural networks consist of three main layers:

1. **Input Layer**: Receives the initial data
2. **Hidden Layers**: Process the data through weighted connections
3. **Output Layer**: Delivers the final result

The power of neural networks comes from their ability to adjust these weighted connections through a process called training.`,
        image: null,
      },
      {
        type: 'quiz',
        title: 'Layer Structure',
        question: 'How many main types of layers are in a neural network?',
        options: [
          'Two',
          'Three',
          'Four',
          'It varies based on the problem',
        ],
        correctAnswer: 1,
      },
      {
        type: 'completion',
        title: 'Congratulations!',
        content: `You've completed this sprint on Neural Network Fundamentals.

Key takeaways:
- Neural networks are inspired by the human brain
- They consist of input, hidden, and output layers
- Their power comes from adjustable weighted connections

Continue to the next sprint to learn about training neural networks and backpropagation.`,
        nextSprintTitle: 'Training Neural Networks',
      },
    ],
  };

  const currentStep = sprintData.steps[currentStepIndex];
  
  const handleAnswer = (value) => {
    setUserAnswers({
      ...userAnswers,
      [currentStepIndex]: parseInt(value),
    });
  };

  const handleNextStep = () => {
    if (currentStep.type === 'quiz' && !showFeedback) {
      setShowFeedback(true);
      return;
    }
    
    if (currentStepIndex < sprintData.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowFeedback(false);
    }
  };

  const isCorrectAnswer = (stepIndex) => {
    const step = sprintData.steps[stepIndex];
    return step.type === 'quiz' && userAnswers[stepIndex] === step.correctAnswer;
  };

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'content':
        return (
          <VStack spacing={4} align="flex-start" width="full">
            <Heading size="md">{currentStep.title}</Heading>
            <Text whiteSpace="pre-line">{currentStep.content}</Text>
          </VStack>
        );
      case 'quiz':
        return (
          <VStack spacing={6} align="flex-start" width="full">
            <Heading size="md">{currentStep.title}</Heading>
            <Text fontWeight="medium">{currentStep.question}</Text>
            
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
                  >
                    <Radio value={idx.toString()} width="full">
                      {option}
                    </Radio>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>
            
            {showFeedback && (
              <Box 
                p={4} 
                bg={isCorrectAnswer(currentStepIndex) ? 'green.50' : 'red.50'} 
                borderRadius="md"
                width="full"
              >
                <Text fontWeight="bold" color={isCorrectAnswer(currentStepIndex) ? 'green.600' : 'red.600'}>
                  {isCorrectAnswer(currentStepIndex) ? 'Correct!' : 'Not quite right'}
                </Text>
                <Text>
                  {isCorrectAnswer(currentStepIndex)
                    ? 'Good job! Neural networks indeed mimic the human brain.'
                    : `The correct answer is: ${currentStep.options[currentStep.correctAnswer]}`}
                </Text>
              </Box>
            )}
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
                  to={`/sprint/${parseInt(sprintId) + 1}`}
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="4xl" py={8}>
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
            <Text fontWeight="medium">{sprintData.path}</Text>
          </HStack>
          <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1}>
            {sprintData.estimatedTime}
          </Badge>
        </Flex>
        
        <Heading size="lg">{sprintData.title}</Heading>
        
        <Progress
          value={(currentStepIndex / (sprintData.totalSteps - 1)) * 100}
          size="sm"
          colorScheme="purple"
          borderRadius="full"
        />
        
        <Flex justify="space-between">
          <Text fontSize="sm" fontWeight="medium">
            {currentStepIndex + 1} of {sprintData.totalSteps}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {Math.round((currentStepIndex / (sprintData.totalSteps - 1)) * 100)}% Complete
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
      
      {/* Navigation Buttons */}
      {currentStep.type !== 'completion' && (
        <Flex justify="space-between">
          <Button
            onClick={handlePrevStep}
            leftIcon={<ChevronLeftIcon />}
            isDisabled={currentStepIndex === 0}
            variant="ghost"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextStep}
            rightIcon={<ChevronRightIcon />}
            colorScheme="purple"
            isDisabled={
              currentStep.type === 'quiz' &&
              !showFeedback &&
              userAnswers[currentStepIndex] === undefined
            }
          >
            {currentStep.type === 'quiz' && !showFeedback ? 'Check Answer' : 'Next'}
          </Button>
        </Flex>
      )}
      
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
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Container>
  );
}

export default SprintPage; 