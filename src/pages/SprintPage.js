import React, { useState, useEffect } from 'react';
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
  Image,
  AspectRatio,
  useToast,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import InteractiveAnatomyModel from '../components/InteractiveAnatomyModel';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel';

function SprintPage() {
  const { sprintId } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const toast = useToast();
  
  // Mock data - in a real app, this would be fetched from API
  const sprintData = {
    // Original neural networks sprint
    "101": {
      id: "101",
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
    },
    // Functional Anatomy sprint
    "201": {
      id: "201",
      title: 'Introduction to Functional Anatomy',
      path: 'Functional Anatomy Fundamentals',
      totalSteps: 6,
      estimatedTime: '10 min',
      progress: 0,
      steps: [
        {
          type: 'content',
          title: 'What is Functional Anatomy?',
          content: `# Functional Anatomy
          
Functional anatomy is the study of the body's structures as they relate to movement and physical performance. Unlike traditional anatomy that focuses solely on identifying structures, functional anatomy examines **how these structures work together during movement**.

This approach helps us understand not just what the body is made of, but how it performs in real-world activities, making it essential for professionals in:
- Physical therapy
- Sports performance
- Fitness training
- Rehabilitation`,
          image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hdG9teXxlbnwwfHwwfHx8MA%3D%3D',
          useThreeDModel: true,
          modelType: 'skeletal'
        },
        {
          type: 'quiz',
          title: 'Quick Check',
          question: 'How does functional anatomy differ from traditional anatomy?',
          options: [
            'It only studies muscles, not bones',
            'It focuses on structure identification only',
            'It examines how structures work together during movement',
            'It is only relevant for medical professionals',
          ],
          correctAnswer: 2,
        },
        {
          type: 'content',
          title: 'Anatomical Terminology',
          content: `# Anatomical Terminology

To effectively study functional anatomy, we must understand basic anatomical terminology:

## 1. Directional Terms
- **Anterior** (front)
- **Posterior** (back)
- **Superior** (above)
- **Inferior** (below)
- **Medial** (toward midline)
- **Lateral** (away from midline)

## 2. Movement Terms
- **Flexion** (decrease angle)
- **Extension** (increase angle)
- **Abduction** (away from midline)
- **Adduction** (toward midline)
- **Rotation** (circular movement)

## 3. Planes of Motion
- **Sagittal plane**: divides body into left/right
- **Frontal plane**: divides body into front/back
- **Transverse plane**: divides body into top/bottom

Understanding these terms is essential for precise movement analysis and professional communication.`,
          useThreeDModel: true,
          modelType: 'skeletal'
        },
        {
          type: 'interactive',
          title: 'Explore the Skeletal System',
          content: 'Use the 3D model to explore the skeletal system. Click on different bones to learn about their function and structure.',
          componentType: 'anatomy',
          systemType: 'skeletal'
        },
        {
          type: 'quiz',
          title: 'Anatomical Terms',
          question: 'Which plane divides the body into front and back portions?',
          options: [
            'Sagittal plane',
            'Frontal plane',
            'Transverse plane',
            'Horizontal plane',
          ],
          correctAnswer: 1,
        },
        {
          type: 'interactive',
          title: 'Explore the Muscular System',
          content: 'Use the 3D model to explore the muscular system. Click on different muscles to learn about their function and attachments.',
          componentType: 'anatomy',
          systemType: 'muscular'
        },
        {
          type: 'completion',
          title: 'Congratulations!',
          content: `# Well Done!

You've completed the introduction to Functional Anatomy sprint!

## Key takeaways:
- Functional anatomy focuses on how structures work together during movement
- Directional terms help precisely locate body parts and describe relationships
- Understanding planes of motion is critical for analyzing movement patterns

Continue to the next sprint to learn about the skeletal system and its role in functional movement.`,
          nextSprintTitle: 'Skeletal System Basics',
        },
      ],
    },
    // Skeletal System Basics sprint
    "202": {
      id: "202",
      title: 'Skeletal System Basics',
      path: 'Functional Anatomy Fundamentals',
      totalSteps: 6,
      estimatedTime: '15 min',
      progress: 0,
      steps: [
        {
          type: 'content',
          title: 'Functions of the Skeletal System',
          content: `# Functions of the Skeletal System

The skeletal system serves multiple crucial functions in the human body:

## 1. Structural Support
Provides the framework that supports the body and maintains its shape

## 2. Movement
Works with the muscular system to create leverage for movement

## 3. Protection
Shields vital organs from injury:
- **Skull** protects the brain
- **Ribcage** protects the heart and lungs
- **Vertebrae** protect the spinal cord

## 4. Blood Cell Production
Red and white blood cells are produced in the bone marrow

## 5. Mineral Storage
Stores calcium, phosphorus, and other minerals that can be released into the bloodstream when needed`,
          useThreeDModel: true,
          modelType: 'skeletal'
        },
        {
          type: 'quiz',
          title: 'Skeletal Functions',
          question: 'Which of the following is NOT a function of the skeletal system?',
          options: [
            'Protection of vital organs',
            'Production of digestive enzymes',
            'Storage of minerals',
            'Support for body framework',
          ],
          correctAnswer: 1,
        },
        {
          type: 'interactive',
          title: 'Skeletal Structure Exploration',
          content: 'Explore the key structures of the skeletal system and understand their relationships to each other.',
          componentType: 'anatomy',
          systemType: 'skeletal'
        },
        {
          type: 'content',
          title: 'Types of Bones',
          content: `# Types of Bones

Bones are classified into five types based on their shape and function:

## 1. Long Bones
- Examples: femur, humerus, tibia
- Function: provide leverage for movement
- Structure: shaft (diaphysis) with expanded ends (epiphyses)

## 2. Short Bones
- Examples: carpals (wrist), tarsals (ankle)
- Function: provide stability and some movement
- Structure: roughly cube-shaped, spongy bone with thin compact bone layer

## 3. Flat Bones
- Examples: skull bones, sternum, scapula
- Function: protection and broad muscle attachment
- Structure: two thin layers of compact bone with spongy bone between

## 4. Irregular Bones
- Examples: vertebrae, hip bones
- Function: varied, protection and complex movements
- Structure: complex shapes with varying proportions of compact and spongy bone

## 5. Sesamoid Bones
- Examples: patella (kneecap)
- Function: protect tendons and modify mechanical force
- Structure: embedded within tendons`,
          image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tlbGV0b258ZW58MHx8MHx8fDA%3D',
        },
        {
          type: 'quiz',
          title: 'Bone Types',
          question: 'Which type of bone provides the most leverage for movement?',
          options: [
            'Short bones',
            'Long bones',
            'Flat bones',
            'Irregular bones',
          ],
          correctAnswer: 1,
        },
        {
          type: 'completion',
          title: 'Congratulations!',
          content: `# Excellent Work!

You've completed the Skeletal System Basics sprint!

## Key takeaways:
- The skeletal system provides structure, protection, and storage
- Bones come in five distinct types based on shape and function
- The skeletal system works closely with muscles to create movement

Continue to the next sprint to learn about the muscular system and how it interacts with the skeleton to produce functional movement.`,
          nextSprintTitle: 'Muscular System Overview',
        },
      ],
    },
    // Muscular System Overview sprint
    "203": {
      id: "203",
      title: 'Muscular System Overview',
      path: 'Functional Anatomy Fundamentals',
      totalSteps: 6,
      estimatedTime: '15 min',
      progress: 0,
      steps: [
        {
          type: 'content',
          title: 'Muscle Tissue Types',
          content: `The human body contains three distinct types of muscle tissue, each with specific characteristics and functions:

1. **Skeletal Muscle**
   - Voluntary control
   - Striated appearance under microscope
   - Attaches to bones via tendons
   - Responsible for movement and posture

2. **Cardiac Muscle**
   - Involuntary control
   - Striated appearance
   - Found only in the heart
   - Specialized for continuous rhythmic contraction

3. **Smooth Muscle**
   - Involuntary control
   - Non-striated appearance
   - Found in internal organs, blood vessels, and airways
   - Responsible for automatic functions like digestion and blood pressure regulation

In functional anatomy, we primarily focus on skeletal muscle, as it's directly involved in movement.`,
          image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzY2xlc3xlbnwwfHwwfHx8MA%3D%3D',
        },
        {
          type: 'quiz',
          title: 'Muscle Types',
          question: 'Which muscle type is under voluntary control and attaches to bones?',
          options: [
            'Cardiac muscle',
            'Smooth muscle',
            'Skeletal muscle',
            'Visceral muscle',
          ],
          correctAnswer: 2,
        },
        {
          type: 'content',
          title: 'Muscle Fiber Types',
          content: `Skeletal muscle contains different fiber types, each with unique properties:

1. **Type I (Slow Twitch)**
   - High endurance capacity
   - Slow contraction speed
   - Fatigue-resistant
   - Specialized for aerobic metabolism
   - Example activities: long-distance running, maintaining posture

2. **Type IIa (Fast Twitch Oxidative)**
   - Moderate endurance
   - Fast contraction speed
   - Moderate resistance to fatigue
   - Uses both aerobic and anaerobic metabolism
   - Example activities: middle-distance running, swimming

3. **Type IIx (Fast Twitch Glycolytic)**
   - Low endurance capacity
   - Very fast contraction speed
   - Fatigues quickly
   - Primarily anaerobic metabolism
   - Example activities: sprinting, weightlifting, explosive movements

Most muscles contain a mixture of these fiber types, with distribution varying based on genetics and training.`,
          image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzY2xlJTIwZmliZXJzfGVufDB8fDB8fHww',
        },
        {
          type: 'interactive',
          title: 'Explore the Muscular System',
          description: 'Use this interactive model to explore the muscular system. Rotate between views, zoom in on specific areas, and click on highlighted muscles to learn about their functions and actions.',
          modelType: 'muscular',
          bodyRegion: 'full',
        },
        {
          type: 'quiz',
          title: 'Muscle Fibers',
          question: 'Which muscle fiber type is best suited for a marathon runner?',
          options: [
            'Type I (Slow Twitch)',
            'Type IIx (Fast Twitch Glycolytic)',
            'A mixture of all fiber types equally',
            'None of the above',
          ],
          correctAnswer: 0,
        },
        {
          type: 'completion',
          title: 'Congratulations!',
          content: `You've completed the Muscular System Overview sprint!

Key takeaways:
- The body contains three types of muscle tissue: skeletal, cardiac, and smooth
- Skeletal muscle is under voluntary control and attaches to bones for movement
- Muscle fibers are specialized for different types of activities
- Type I fibers excel at endurance, while Type II fibers provide speed and power

Continue to the next sprint to learn about upper body musculature and its role in functional movement.`,
          nextSprintTitle: 'Upper Body Musculature',
        },
      ],
    },
  };

  // Get the specific sprint data based on the ID parameter
  const currentSprintData = sprintData[sprintId] || sprintData["101"];
  const currentStep = currentSprintData.steps[currentStepIndex];
  
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
    
    if (currentStepIndex < currentSprintData.steps.length - 1) {
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
    const step = currentSprintData.steps[stepIndex];
    return step.type === 'quiz' && userAnswers[stepIndex] === step.correctAnswer;
  };

  // Helper to render the Next and Previous buttons
  const renderNextButton = (currentStep) => (
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
  );

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'content':
        return (
          <VStack spacing={6} align="stretch">
            {currentStep.title && <Heading size="lg">{currentStep.title}</Heading>}
            
            {currentStep.useThreeDModel ? (
              <Box borderRadius="md" overflow="hidden" my={4}>
                <ThreeDAnatomyModel 
                  systemType={currentStep.modelType || 'skeletal'} 
                  initialView="anterior"
                  onSelectStructure={(structure) => toast({
                    title: structure,
                    description: `You selected the ${structure}`,
                    status: 'info',
                    duration: 2000,
                  })}
                />
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
            
            <Box className="markdown-content">
              <ReactMarkdown>
                {currentStep.content}
              </ReactMarkdown>
            </Box>
            
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
                  <ThreeDAnatomyModel 
                    systemType={currentStep.systemType || 'skeletal'}
                    initialView="anterior"
                    onSelectStructure={(structure) => toast({
                      title: structure,
                      description: `You selected the ${structure}`,
                      status: 'info',
                      duration: 2000,
                    })}
                  />
                </CardBody>
              </Card>
              
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
                    ? 'Good job! You\'ve got it right.'
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="6xl" py={8}>
      <style jsx global>{`
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
      `}</style>
      
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
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Container>
  );
}

export default SprintPage; 