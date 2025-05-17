import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Divider,
  Flex,
  IconButton,
  Tag,
  TagLabel,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  EditIcon, 
  ChevronRightIcon, 
  InfoIcon,
  WarningIcon,
  CheckCircleIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import geminiClient, { PROMPT_TEMPLATES, generateContent, stripCodeFences } from '../services/geminiClient';
import supabaseClient from '../services/supabaseClient';
import { keyframes } from '@chakra-ui/react';

// Default course structure
const defaultCourseForm = {
  topic: '',
  audience: '',
  level: 'Beginner',
  duration: '2-4 hours',
  goals: '',
};

// Add animation keyframes after imports
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.3; }
`;

// Add BulkGenerationProgress component before CourseBuilderPage
const BulkGenerationProgress = ({ current, total, isComplete }) => {
  const progress = (current / total) * 100;
  
  return (
    <Box 
      p={6} 
      borderWidth={1} 
      borderRadius="lg" 
      bg="white" 
      boxShadow="lg"
      animation={isComplete ? "none" : `${pulseAnimation} 2s infinite`}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold">Generating Course Content</Text>
          <Text>{current} / {total} sprints</Text>
        </HStack>
        
        <Progress 
          value={progress} 
          size="lg" 
          colorScheme={isComplete ? "green" : "purple"} 
          borderRadius="full"
          hasStripe
          isAnimated={!isComplete}
        />
        
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {isComplete 
            ? "All content generated successfully!" 
            : "Please wait while we generate your course content..."}
        </Text>
      </VStack>
    </Box>
  );
};

function CourseBuilderPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeSprint, setActiveSprint] = useState(null);
  const [sprintContent, setSprintContent] = useState({});
  const [isLoadingSprint, setIsLoadingSprint] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTab, setSelectedTab] = useState(0);
  const moduleRef = useRef(null);
  const sprintRef = useRef(null);
  const [suggestedObjectives, setSuggestedObjectives] = useState([]);
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);
  
  // Rate limit warning threshold (8 out of 10 free requests)
  const RATE_LIMIT_WARNING = 8;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm({
      ...courseForm,
      [name]: value,
    });
  };

  // Generate course objectives suggestions
  const generateObjectives = async () => {
    if (!courseForm.topic || !courseForm.audience) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the topic and target audience.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingObjectives(true);
    
    try {
      // Replace template placeholders with actual values
      const filledPrompt = PROMPT_TEMPLATES.GENERATE_OBJECTIVES
        .replace('{topic}', courseForm.topic)
        .replace('{audience}', courseForm.audience)
        .replace('{level}', courseForm.level);
      
      // Generate content
      const response = await generateContent(filledPrompt, 0.7);
      setRequestCount(prevCount => prevCount + 1);
      
      try {
        // Parse the JSON response
        const objectives = JSON.parse(stripCodeFences(response));
        setSuggestedObjectives(objectives);
        
        // Success message
        toast({
          title: "Objectives generated",
          description: "AI-suggested learning objectives are ready.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Check rate limit
        if (requestCount + 1 >= RATE_LIMIT_WARNING) {
          toast({
            title: "Approaching rate limit",
            description: "You're nearing your free tier rate limit. Consider spacing out your requests.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        toast({
          title: "Error parsing response",
          description: "The AI generated an invalid response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating objectives:', error);
      toast({
        title: "Error",
        description: "Failed to generate learning objectives. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  // Add objective to goals
  const addObjectiveToGoals = (objective) => {
    if (!courseForm.goals.includes(objective)) {
      const updatedGoals = courseForm.goals 
        ? courseForm.goals + "\n\n" + objective 
        : objective;
      
      setCourseForm({
        ...courseForm,
        goals: updatedGoals
      });
      
      toast({
        title: "Objective added",
        description: "The objective has been added to your course goals.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Already added",
        description: "This objective is already in your course goals.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Generate course outline using Gemini API
  const generateCourseOutline = async () => {
    // Validate form
    if (!courseForm.topic || !courseForm.audience || !courseForm.goals) {
      toast({
        title: "Missing information",
        description: "Please fill in the topic, target audience, and learning goals.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Replace template placeholders with actual values
      const filledPrompt = PROMPT_TEMPLATES.COURSE_OUTLINE
        .replace('{topic}', courseForm.topic)
        .replace('{audience}', courseForm.audience)
        .replace('{level}', courseForm.level)
        .replace('{duration}', courseForm.duration)
        .replace('{goals}', courseForm.goals);
      
      // Generate content
      const response = await generateContent(filledPrompt, 0.7);
      setRequestCount(prevCount => prevCount + 1);
      
      try {
        // Parse the JSON response
        const courseData = JSON.parse(stripCodeFences(response));
        setGeneratedCourse(courseData);
        
        // Success message
        toast({
          title: "Course outline generated",
          description: "Your course outline has been created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Move to the next tab
        setSelectedTab(1);
        
        // Check rate limit
        if (requestCount + 1 >= RATE_LIMIT_WARNING) {
          toast({
            title: "Approaching rate limit",
            description: "You're nearing your free tier rate limit. Consider spacing out your requests.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        toast({
          title: "Error parsing response",
          description: "The AI generated an invalid response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating course outline:', error);
      toast({
        title: "Error",
        description: "Failed to generate course outline. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate sprint content
  const generateSprintContent = async (moduleIndex, sprintIndex) => {
    if (!generatedCourse) return;
    
    const module = generatedCourse.modules[moduleIndex];
    const sprint = module.sprints[sprintIndex];
    
    setActiveModule(moduleIndex);
    setActiveSprint(sprintIndex);
    setIsLoadingSprint(true);
    
    try {
      // Check if we already have this sprint content
      if (sprintContent[`${moduleIndex}-${sprintIndex}`]) {
        // Just set the active sprint without making an API call
        setIsLoadingSprint(false);
        return;
      }
      
      // Replace template placeholders
      const filledPrompt = PROMPT_TEMPLATES.SPRINT_CONTENT
        .replace('{title}', sprint.title)
        .replace('{module}', module.title)
        .replace('{course}', generatedCourse.title)
        .replace('{outline}', sprint.contentOutline.join(', '))
        .replace('{audience}', courseForm.audience)
        .replace('{level}', courseForm.level)
        .replace('{duration}', sprint.duration || '10');
      
      // Generate content
      const response = await generateContent(filledPrompt, 0.7);
      setRequestCount(prevCount => prevCount + 1);
      
      try {
        // Parse the JSON response
        const content = JSON.parse(stripCodeFences(response));
        
        // Update sprint content state
        setSprintContent(prev => ({
          ...prev,
          [`${moduleIndex}-${sprintIndex}`]: content
        }));
        
        // Check rate limit
        if (requestCount + 1 >= RATE_LIMIT_WARNING) {
          toast({
            title: "Approaching rate limit",
            description: "You're nearing your free tier rate limit. Consider spacing out your requests.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        toast({
          title: "Error parsing response",
          description: "The AI generated an invalid response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating sprint content:', error);
      toast({
        title: "Error",
        description: "Failed to generate sprint content. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSprint(false);
    }
  };

  // Improve content using AI
  const improveContent = async (moduleIndex, sprintIndex) => {
    const contentKey = `${moduleIndex}-${sprintIndex}`;
    if (!sprintContent[contentKey]) return;
    
    setIsLoadingSprint(true);
    
    try {
      // Get current content
      const currentContent = JSON.stringify(sprintContent[contentKey], null, 2);
      
      // Replace template placeholders
      const filledPrompt = PROMPT_TEMPLATES.IMPROVE_CONTENT
        .replace('{content}', currentContent)
        .replace('{level}', courseForm.level);
      
      // Generate improved content
      const response = await generateContent(filledPrompt, 0.7);
      setRequestCount(prevCount => prevCount + 1);
      
      try {
        // Parse the JSON response
        const improvedContent = JSON.parse(stripCodeFences(response));
        
        // Update sprint content state
        setSprintContent(prev => ({
          ...prev,
          [contentKey]: improvedContent
        }));
        
        toast({
          title: "Content improved",
          description: "The sprint content has been enhanced.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        toast({
          title: "Error parsing response",
          description: "The AI generated an invalid response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error improving content:', error);
      toast({
        title: "Error",
        description: "Failed to improve content. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingSprint(false);
    }
  };

  // Save course to the database
  const saveCourse = async () => {
    if (!generatedCourse) {
      toast({
        title: "Missing course data",
        description: "Please generate a course outline first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Set loading state
    setIsGenerating(true);
    
    try {
      // Generate any missing sprint content in parallel
      const missingContent = [];
      generatedCourse.modules.forEach((module, moduleIndex) => {
        module.sprints.forEach((sprint, sprintIndex) => {
          if (!sprintContent[`${moduleIndex}-${sprintIndex}`]) {
            missingContent.push({ moduleIndex, sprintIndex, sprint, module });
          }
        });
      });

      if (missingContent.length > 0) {
        // Show initial progress
        const totalSprints = missingContent.length;
        let completedSprints = 0;
        
        // Create a modal to show progress
        onOpen();
        
        // Generate content in batches of 5 to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < missingContent.length; i += batchSize) {
          const batch = missingContent.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map(async ({ moduleIndex, sprintIndex, sprint, module }) => {
              try {
                // Replace template placeholders
                const filledPrompt = PROMPT_TEMPLATES.SPRINT_CONTENT
                  .replace('{title}', sprint.title)
                  .replace('{module}', module.title)
                  .replace('{course}', generatedCourse.title)
                  .replace('{outline}', sprint.contentOutline.join(', '))
                  .replace('{audience}', courseForm.audience)
                  .replace('{level}', courseForm.level)
                  .replace('{duration}', sprint.duration || '10');
                
                // Generate content
                const response = await generateContent(filledPrompt, 0.7);
                
                try {
                  // Parse the JSON response
                  const content = JSON.parse(stripCodeFences(response));
                  
                  // Update sprint content state
                  setSprintContent(prev => ({
                    ...prev,
                    [`${moduleIndex}-${sprintIndex}`]: content
                  }));

                  completedSprints++;
                  return { success: true, moduleIndex, sprintIndex };
                } catch (parseError) {
                  console.error('Error parsing JSON response:', parseError);
                  return { success: false, error: 'JSON parsing error', moduleIndex, sprintIndex };
                }
              } catch (error) {
                console.error('Error generating sprint content:', error);
                return { success: false, error: error.message, moduleIndex, sprintIndex };
              }
            })
          );

          // Report generation progress
          const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
          const failedCount = batch.length - successCount;

          if (failedCount > 0) {
            toast({
              title: "Generation Progress",
              description: `Batch ${Math.floor(i/batchSize) + 1}: ${successCount} succeeded, ${failedCount} failed. Continuing...`,
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
          }
        }
        
        // Close progress modal
        onClose();
      }

      // Prepare course data
      const pathData = {
        title: generatedCourse.title,
        description: generatedCourse.description,
        category: generatedCourse.category,
        level: courseForm.level,
        estimated_time: courseForm.duration,
        objectives: generatedCourse.objectives || [],
        prerequisites: generatedCourse.prerequisites || [],
        tags: generatedCourse.tags || []
      };
      
      // Prepare modules data
      const moduleData = generatedCourse.modules.map((module, moduleIndex) => {
        return {
          title: module.title,
          description: module.description,
          order_index: moduleIndex,
          sprints: module.sprints.map((sprint, sprintIndex) => {
            return {
              title: sprint.title,
              description: sprint.description,
              content: sprintContent[`${moduleIndex}-${sprintIndex}`] || [],
              time: sprint.time || "5-10 min",
              order_index: sprintIndex
            };
          })
        };
      });
      
      // Save the course to Supabase
      const { data, error } = await supabaseClient.createLearningPath(pathData, moduleData);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save course. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      toast({
        title: "Course saved",
        description: "Your course has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to render content based on type
  const renderContentItem = (item, index) => {
    switch (item.type) {
      case 'text':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md">
            <Badge colorScheme="blue" mb={2}>text</Badge>
            <Text>{item.value}</Text>
          </Box>
        );
      case 'key_point':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="purple.50">
            <Badge colorScheme="purple" mb={2}>key point</Badge>
            <Text fontWeight="medium">{item.value}</Text>
          </Box>
        );
      case 'example':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="green.50">
            <Badge colorScheme="green" mb={2}>example</Badge>
            <Text>{item.value}</Text>
          </Box>
        );
      case 'visual_tree':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="blue.50">
            <Badge colorScheme="blue" mb={2}>visual tree</Badge>
            <VStack align="stretch" spacing={1}>
              {item.value.split('\n').map((line, i) => {
                const parts = line.split('->').map(part => part.trim());
                return (
                  <Box key={i} pl={parts.length > 1 ? (parts.length - 1) * 4 : 0}>
                    <HStack align="center" spacing={2}>
                      {parts.length > 1 && <ChevronRightIcon color="blue.500" />}
                      <Text fontWeight={parts.length === 1 ? "bold" : "normal"}>
                        {parts[parts.length - 1]}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        );
      case 'activity':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="orange.50">
            <Badge colorScheme="orange" mb={2}>activity</Badge>
            <Text>{item.value}</Text>
          </Box>
        );
      case 'reflection':
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="teal.50">
            <Badge colorScheme="teal" mb={2}>reflection</Badge>
            <Text fontStyle="italic">{item.value}</Text>
          </Box>
        );
      default:
        return (
          <Box key={index} p={4} borderWidth={1} borderRadius="md">
            <Badge mb={2}>{item.type.replace('_', ' ')}</Badge>
            <Text>{item.value}</Text>
          </Box>
        );
    }
  };

  // Helper to render quiz question based on type
  const renderQuizQuestion = (quiz, index) => {
    const questionType = quiz.type || 'multiple_choice';
    
    return (
      <VStack key={index} align="stretch" spacing={3} mb={6} p={4} borderWidth={1} borderRadius="md">
        <HStack>
          <Text fontWeight="bold">{index+1}. {quiz.question}</Text>
          <Badge ml={2} colorScheme={
            questionType === 'multiple_choice' ? 'blue' : 
            questionType === 'fill_blank' ? 'green' : 
            questionType === 'ordering' ? 'orange' : 'gray'
          }>
            {questionType.replace('_', ' ')}
          </Badge>
        </HStack>
        
        {questionType === 'multiple_choice' && (
          <VStack align="stretch" spacing={2} pl={4}>
            {quiz.options.map((option, j) => (
              <HStack key={j}>
                <Badge 
                  colorScheme={j === quiz.correctAnswer ? "green" : "gray"}
                  variant={j === quiz.correctAnswer ? "solid" : "outline"}
                >
                  {String.fromCharCode(65 + j)}
                </Badge>
                <Text>{option}</Text>
              </HStack>
            ))}
          </VStack>
        )}
        
        {questionType === 'fill_blank' && (
          <VStack align="stretch" spacing={2} pl={4}>
            <Box p={2} borderWidth={1} borderRadius="md" bg="green.50">
              <Text fontWeight="medium">{quiz.correctAnswer}</Text>
            </Box>
          </VStack>
        )}
        
        {questionType === 'ordering' && (
          <VStack align="stretch" spacing={2} pl={4}>
            {quiz.correctOrder.map((itemIndex, orderIndex) => (
              <HStack key={orderIndex}>
                <Badge colorScheme="orange">{orderIndex + 1}</Badge>
                <Text>{quiz.options[itemIndex]}</Text>
              </HStack>
            ))}
          </VStack>
        )}
        
        <Box bgColor="gray.50" p={2} borderRadius="md">
          <Text fontSize="sm" fontWeight="medium">Explanation:</Text>
          <Text fontSize="sm">{quiz.explanation}</Text>
        </Box>
      </VStack>
    );
  };

  return (
    <Container maxW="7xl" py={8}>
      <Tabs index={selectedTab} onChange={setSelectedTab} variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>1. Course Details</Tab>
          <Tab isDisabled={!generatedCourse}>2. Course Structure</Tab>
          <Tab isDisabled={!generatedCourse}>3. Sprint Content</Tab>
          <Tab isDisabled={!generatedCourse}>4. Review & Publish</Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1: Course Details */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="xl">Create a New Course</Heading>
              <Text color="gray.600">
                Fill in the details below and AI will help generate a course structure for you.
              </Text>
              
              <HStack spacing={4} align="flex-start">
                <Box
                  flex={1}
                  p={6}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                >
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Course Topic</FormLabel>
                      <Input
                        name="topic"
                        value={courseForm.topic}
                        onChange={handleInputChange}
                        placeholder="e.g., Introduction to Machine Learning"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Target Audience</FormLabel>
                      <Input
                        name="audience"
                        value={courseForm.audience}
                        onChange={handleInputChange}
                        placeholder="e.g., College students with basic programming knowledge"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Skill Level</FormLabel>
                      <Select
                        name="level"
                        value={courseForm.level}
                        onChange={handleInputChange}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Estimated Course Duration</FormLabel>
                      <Select
                        name="duration"
                        value={courseForm.duration}
                        onChange={handleInputChange}
                      >
                        <option value="1-2 hours">1-2 hours</option>
                        <option value="2-4 hours">2-4 hours</option>
                        <option value="4-6 hours">4-6 hours</option>
                        <option value="6-8 hours">6-8 hours</option>
                        <option value="8+ hours">8+ hours</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>
                        Learning Goals
                        <Button 
                          ml={2} 
                          size="xs" 
                          colorScheme="blue" 
                          isLoading={isGeneratingObjectives}
                          onClick={generateObjectives}
                        >
                          Get AI Suggestions
                        </Button>
                      </FormLabel>
                      <Textarea
                        name="goals"
                        value={courseForm.goals}
                        onChange={handleInputChange}
                        placeholder="What will students learn in this course? List specific skills or knowledge they will gain."
                        rows={4}
                      />
                    </FormControl>
                    
                    {suggestedObjectives.length > 0 && (
                      <Card variant="outline" p={2} mt={2}>
                        <CardHeader pb={1}>
                          <Heading size="xs">AI-Suggested Learning Objectives</Heading>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack align="stretch" spacing={2}>
                            {suggestedObjectives.map((objective, index) => (
                              <HStack key={index} p={2} borderWidth="1px" borderRadius="md" justify="space-between">
                                <Text fontSize="sm">{objective}</Text>
                                <IconButton
                                  icon={<AddIcon />}
                                  size="xs"
                                  colorScheme="green"
                                  aria-label="Add objective"
                                  onClick={() => addObjectiveToGoals(objective)}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                    
                    <Button
                      colorScheme="purple"
                      size="lg"
                      onClick={generateCourseOutline}
                      isLoading={isGenerating}
                      loadingText="Generating..."
                      rightIcon={<ChevronRightIcon />}
                    >
                      Generate Course Outline
                    </Button>
                  </VStack>
                </Box>
                
                <Box flex={1}>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Tips for Better Results</Heading>
                      <VStack align="start" spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Be specific with your topic</Text>
                          <Text fontSize="sm">
                            "Data Visualization with D3.js" is better than just "Data Visualization"
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">Define your audience clearly</Text>
                          <Text fontSize="sm">
                            Include their background, existing knowledge, and motivation
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">Set concrete learning goals</Text>
                          <Text fontSize="sm">
                            "Build a responsive website with HTML/CSS" is better than "Learn web development"
                          </Text>
                        </Box>
                        
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box fontSize="sm">
                            <Text fontWeight="bold">Free Tier Usage</Text>
                            <Text>The free tier allows 10 requests per minute. You've used {requestCount} requests.</Text>
                          </Box>
                        </Alert>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </HStack>
            </VStack>
          </TabPanel>

          {/* Tab 2: Course Structure */}
          <TabPanel>
            {generatedCourse && (
              <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl">{generatedCourse.title}</Heading>
                <Text fontSize="lg" color="gray.600">
                  {generatedCourse.description}
                </Text>
                
                <Box>
                  <Heading size="md" mb={3}>Learning Objectives</Heading>
                  <VStack align="start" spacing={2}>
                    {generatedCourse.learningObjectives.map((objective, i) => (
                      <HStack key={i}>
                        <CheckCircleIcon color="green.500" />
                        <Text>{objective}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                
                <Box>
                  <Heading size="md" mb={3}>Prerequisites</Heading>
                  <VStack align="start" spacing={2}>
                    {generatedCourse.prerequisites.map((prereq, i) => (
                      <HStack key={i}>
                        <InfoIcon color="blue.500" />
                        <Text>{prereq}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                
                <Divider />
                
                <Heading size="md" mb={3} ref={moduleRef}>Modules</Heading>
                <Accordion allowToggle defaultIndex={[0]}>
                  {generatedCourse.modules.map((module, moduleIndex) => (
                    <AccordionItem key={moduleIndex}>
                      <AccordionButton py={4}>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="bold">{module.title}</Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack align="start" spacing={4}>
                          <Text>{module.description}</Text>
                          
                          <Heading size="sm" mt={2}>Sprints</Heading>
                          {module.sprints.map((sprint, sprintIndex) => (
                            <Card key={sprintIndex} w="100%" variant="outline">
                              <CardBody>
                                <VStack align="start" spacing={2}>
                                  <Flex justify="space-between" width="100%" align="center">
                                    <Heading size="sm">{sprint.title}</Heading>
                                    <HStack>
                                      <Badge colorScheme="purple">
                                        {sprint.duration}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        leftIcon={<EditIcon />}
                                        onClick={() => {
                                          generateSprintContent(moduleIndex, sprintIndex);
                                          setSelectedTab(2);
                                        }}
                                      >
                                        Edit Content
                                      </Button>
                                    </HStack>
                                  </Flex>
                                  
                                  <Text fontSize="sm">{sprint.description}</Text>
                                  
                                  <VStack align="start" spacing={1} mt={2}>
                                    <Text fontSize="sm" fontWeight="medium">Content Outline:</Text>
                                    {sprint.contentOutline.map((point, i) => (
                                      <Text key={i} fontSize="sm" ml={4}>• {point}</Text>
                                    ))}
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                <HStack spacing={4} justify="flex-end">
                  <Button
                    onClick={() => setSelectedTab(0)}
                    variant="outline"
                  >
                    Back to Details
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={() => setSelectedTab(2)}
                    rightIcon={<ChevronRightIcon />}
                  >
                    Continue to Sprint Content
                  </Button>
                </HStack>
              </VStack>
            )}
          </TabPanel>

          {/* Tab 3: Sprint Content */}
          <TabPanel>
            {generatedCourse && (
              <VStack spacing={8} align="stretch">
                <HStack justify="space-between">
                  <Heading as="h1" size="xl">Sprint Content Editor</Heading>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => setSelectedTab(1)}
                  >
                    Back to Structure
                  </Button>
                </HStack>
                
                <HStack align="flex-start" spacing={6}>
                  {/* Left side: Module/Sprint selector */}
                  <Box width="300px">
                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Heading size="md">Select a Sprint</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Click on a sprint to edit its content
                          </Text>
                          
                          <Accordion allowToggle width="100%" ref={sprintRef}>
                            {generatedCourse.modules.map((module, moduleIndex) => (
                              <AccordionItem key={moduleIndex}>
                                <AccordionButton>
                                  <Box flex="1" textAlign="left">
                                    {module.title}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                  <VStack align="start" spacing={2}>
                                    {module.sprints.map((sprint, sprintIndex) => (
                                      <Button
                                        key={sprintIndex}
                                        variant={
                                          activeModule === moduleIndex && 
                                          activeSprint === sprintIndex 
                                            ? "solid" 
                                            : "ghost"
                                        }
                                        colorScheme={
                                          activeModule === moduleIndex && 
                                          activeSprint === sprintIndex 
                                            ? "purple" 
                                            : "gray"
                                        }
                                        justifyContent="flex-start"
                                        width="100%"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        whiteSpace="nowrap"
                                        size="sm"
                                        leftIcon={
                                          sprintContent[`${moduleIndex}-${sprintIndex}`] 
                                            ? <CheckCircleIcon color="green.500" /> 
                                            : <InfoIcon />
                                        }
                                        onClick={() => generateSprintContent(moduleIndex, sprintIndex)}
                                      >
                                        {sprint.title}
                                      </Button>
                                    ))}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Box>
                  
                  {/* Right side: Content editor */}
                  <Box flex={1}>
                    {activeModule !== null && 
                     activeSprint !== null && 
                     generatedCourse.modules[activeModule] && 
                     generatedCourse.modules[activeModule].sprints[activeSprint] ? (
                      isLoadingSprint ? (
                        <VStack py={12} spacing={4}>
                          <Spinner size="xl" color="purple.500" />
                          <Text>Generating sprint content...</Text>
                        </VStack>
                      ) : (
                        <VStack align="stretch" spacing={6}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Heading size="lg">
                                {sprintContent[`${activeModule}-${activeSprint}`]?.title || 
                                 generatedCourse.modules[activeModule].sprints[activeSprint].title}
                              </Heading>
                              <Text color="gray.600">
                                Module: {generatedCourse.modules[activeModule].title}
                              </Text>
                            </VStack>
                            
                            <Button
                              colorScheme="purple"
                              variant="outline"
                              onClick={() => improveContent(activeModule, activeSprint)}
                              isDisabled={!sprintContent[`${activeModule}-${activeSprint}`]}
                            >
                              Improve with AI
                            </Button>
                          </HStack>
                          
                          {sprintContent[`${activeModule}-${activeSprint}`] ? (
                            <VStack align="stretch" spacing={6}>
                              <Card>
                                <CardBody>
                                  <Heading size="md" mb={2}>Introduction</Heading>
                                  <Text>
                                    {sprintContent[`${activeModule}-${activeSprint}`].introduction}
                                  </Text>
                                </CardBody>
                              </Card>
                              
                              <Card>
                                <CardBody>
                                  <Heading size="md" mb={4}>Content</Heading>
                                  <VStack align="stretch" spacing={4}>
                                    {sprintContent[`${activeModule}-${activeSprint}`].content.map((item, i) => 
                                      renderContentItem(item, i)
                                    )}
                                  </VStack>
                                </CardBody>
                              </Card>
                              
                              <Card>
                                <CardBody>
                                  <Heading size="md" mb={4}>Quiz Questions</Heading>
                                  {sprintContent[`${activeModule}-${activeSprint}`].quiz.map((quiz, i) => 
                                    renderQuizQuestion(quiz, i)
                                  )}
                                </CardBody>
                              </Card>
                              
                              <Card>
                                <CardBody>
                                  <VStack align="stretch" spacing={4}>
                                    <Box>
                                      <Heading size="md" mb={2}>Summary</Heading>
                                      <Text>{sprintContent[`${activeModule}-${activeSprint}`].summary}</Text>
                                    </Box>
                                    
                                    <Box>
                                      <Heading size="md" mb={2}>Next Steps</Heading>
                                      <Text>{sprintContent[`${activeModule}-${activeSprint}`].nextSteps}</Text>
                                    </Box>
                                  </VStack>
                                </CardBody>
                              </Card>
                            </VStack>
                          ) : (
                            <VStack py={8} spacing={4}>
                              <InfoIcon boxSize={8} color="blue.500" />
                              <Text>
                                No content generated yet. Click the button below to generate content.
                              </Text>
                              <Button
                                colorScheme="purple"
                                onClick={() => generateSprintContent(activeModule, activeSprint)}
                              >
                                Generate Content
                              </Button>
                            </VStack>
                          )}
                        </VStack>
                      )
                    ) : (
                      <VStack py={12} spacing={4}>
                        <InfoIcon boxSize={8} color="blue.500" />
                        <Text>
                          Select a sprint from the left panel to generate and edit its content.
                        </Text>
                      </VStack>
                    )}
                  </Box>
                </HStack>
                
                <HStack spacing={4} justify="flex-end">
                  <Button
                    onClick={() => setSelectedTab(1)}
                    variant="outline"
                  >
                    Back to Structure
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={() => setSelectedTab(3)}
                    rightIcon={<ChevronRightIcon />}
                  >
                    Continue to Review
                  </Button>
                </HStack>
              </VStack>
            )}
          </TabPanel>

          {/* Tab 4: Review & Publish */}
          <TabPanel>
            {generatedCourse && (
              <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl">Review & Publish Course</Heading>
                
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      <HStack>
                        <VStack align="start" flex={1}>
                          <Heading size="lg">{generatedCourse.title}</Heading>
                          <Text color="gray.600">{generatedCourse.description}</Text>
                        </VStack>
                        
                        <Tag size="lg" colorScheme="purple">
                          <TagLabel>{courseForm.level}</TagLabel>
                        </Tag>
                      </HStack>
                      
                      <Divider />
                      
                      <HStack spacing={6} align="flex-start">
                        <VStack align="start" flex={1} spacing={4}>
                          <Heading size="md">Course Structure</Heading>
                          <VStack align="start" spacing={2} width="100%">
                            {generatedCourse.modules.map((module, i) => (
                              <Box key={i} width="100%">
                                <Text fontWeight="bold">{module.title}</Text>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  {module.sprints.length} Sprints
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </VStack>
                        
                        <VStack align="start" flex={1} spacing={4}>
                          <Heading size="md">Content Status</Heading>
                          <VStack align="start" spacing={3} width="100%">
                            <HStack width="100%" justify="space-between">
                              <Text>Modules:</Text>
                              <Badge colorScheme="green">{generatedCourse.modules.length} Created</Badge>
                            </HStack>
                            
                            <HStack width="100%" justify="space-between">
                              <Text>Sprints:</Text>
                              <Badge colorScheme="green">
                                {generatedCourse.modules.reduce((acc, module) => acc + module.sprints.length, 0)} Created
                              </Badge>
                            </HStack>
                            
                            <HStack width="100%" justify="space-between">
                              <Text>Content Generated:</Text>
                              <Badge 
                                colorScheme={Object.keys(sprintContent).length > 0 ? "green" : "red"}
                              >
                                {Object.keys(sprintContent).length} / 
                                {generatedCourse.modules.reduce((acc, module) => acc + module.sprints.length, 0)} Sprints
                              </Badge>
                            </HStack>
                          </VStack>
                        </VStack>
                      </HStack>
                      
                      <Box>
                        <Heading size="md" mb={3}>Missing Content</Heading>
                        {Object.keys(sprintContent).length < generatedCourse.modules.reduce(
                          (acc, module) => acc + module.sprints.length, 0
                        ) ? (
                          <VStack align="start" spacing={2}>
                            {generatedCourse.modules.map((module, moduleIndex) => 
                              module.sprints.map((sprint, sprintIndex) => 
                                !sprintContent[`${moduleIndex}-${sprintIndex}`] ? (
                                  <HStack key={`${moduleIndex}-${sprintIndex}`}>
                                    <WarningIcon color="orange.500" />
                                    <Text>
                                      {module.title} - {sprint.title}
                                    </Text>
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      onClick={() => {
                                        generateSprintContent(moduleIndex, sprintIndex);
                                        setSelectedTab(2);
                                      }}
                                    >
                                      Generate
                                    </Button>
                                  </HStack>
                                ) : null
                              )
                            )}
                          </VStack>
                        ) : (
                          <Alert status="success" borderRadius="md">
                            <AlertIcon />
                            All sprint content has been generated!
                          </Alert>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
                
                <HStack spacing={4} justify="flex-end">
                  <Button
                    onClick={() => setSelectedTab(2)}
                    variant="outline"
                  >
                    Back to Content Editor
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={saveCourse}
                    leftIcon={<CheckCircleIcon />}
                    isDisabled={Object.keys(sprintContent).length === 0}
                  >
                    Publish Course
                  </Button>
                </HStack>
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Rate limit warning modal */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={8}>
            <BulkGenerationProgress 
              current={Object.keys(sprintContent).length} 
              total={generatedCourse?.modules.reduce((acc, module) => acc + module.sprints.length, 0) || 0}
              isComplete={!isGenerating}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default CourseBuilderPage; 