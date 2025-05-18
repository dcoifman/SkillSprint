import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Badge,
  Select,
  useColorModeValue,
  Progress,
  SimpleGrid,
  Tag,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { CheckIcon, RepeatIcon, StarIcon, InfoOutlineIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.js';

function PersonalizedPathGenerator({ onPathCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState('');
  const [availablePaths, setAvailablePaths] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch available learning paths
  React.useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const { data, error } = await supabase
          .from('learning_paths')
          .select('id, title, level, category')
          .order('title');
          
        if (error) throw error;
        
        setAvailablePaths(data || []);
        // Set default selected path to the first one
        if (data && data.length > 0 && !selectedPathId) {
          setSelectedPathId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        toast({
          title: 'Error fetching learning paths',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchLearningPaths();
  }, [toast, selectedPathId]);
  
  const generatePersonalizedPath = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to generate a personalized learning path.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Call the Supabase Edge Function to generate a personalized path
      const { data, error } = await supabase.functions.invoke('generate-personalized-path', {
        body: { userId: user.id, basePathId: selectedPathId },
      });
      
      if (error) throw error;
      
      // Handle successful path creation
      toast({
        title: 'Personalized learning path created',
        description: 'Your personalized learning journey has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Notify parent component about the new path
      if (onPathCreated && data.personalizedPath) {
        onPathCreated(data.personalizedPath);
      }
      
    } catch (error) {
      console.error('Error generating personalized path:', error);
      toast({
        title: 'Error generating personalized path',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="xl" 
      overflow="hidden"
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg' }}
    >
      <CardHeader>
        <Heading size="md">Generate Personalized Learning Path</Heading>
        <Text fontSize="sm" mt={1} color="gray.500">
          Create a custom learning journey adapted to your strengths and areas for improvement
        </Text>
      </CardHeader>
      <Divider />
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={2} fontWeight="medium">Select a base learning path:</Text>
            <Select
              value={selectedPathId}
              onChange={e => setSelectedPathId(e.target.value)}
              placeholder="Choose a learning path"
              disabled={isGenerating}
            >
              {availablePaths.map(path => (
                <option key={path.id} value={path.id}>
                  {path.title} ({path.level} - {path.category})
                </option>
              ))}
            </Select>
          </Box>
          
          <Box>
            <Text fontSize="sm" color="gray.500" mb={3}>
              <HStack>
                <InfoOutlineIcon />
                <Text>
                  Your personalized path will be created based on your performance data and adapted to your learning needs.
                </Text>
              </HStack>
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <HStack spacing={2} alignItems="center">
                <Icon as={CheckIcon} color="green.500" />
                <Text fontSize="sm">Analyzes your strengths</Text>
              </HStack>
              <HStack spacing={2} alignItems="center">
                <Icon as={RepeatIcon} color="blue.500" />
                <Text fontSize="sm">Adapts as you learn</Text>
              </HStack>
              <HStack spacing={2} alignItems="center">
                <Icon as={StarIcon} color="yellow.500" />
                <Text fontSize="sm">Custom quizzes</Text>
              </HStack>
              <HStack spacing={2} alignItems="center">
                <Icon as={InfoOutlineIcon} color="purple.500" />
                <Text fontSize="sm">AI-powered guidance</Text>
              </HStack>
            </SimpleGrid>
          </Box>
          
          <Button
            colorScheme="purple"
            size="md"
            width="full"
            onClick={generatePersonalizedPath}
            isLoading={isGenerating}
            loadingText="Generating your personalized path..."
            leftIcon={<ArrowForwardIcon />}
          >
            Generate My Personalized Path
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default PersonalizedPathGenerator; 