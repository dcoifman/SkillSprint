import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Center,
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.js';
import PersonalizedPathCard from './PersonalizedPathCard.js';
import PersonalizedPathGenerator from './PersonalizedPathGenerator.js';

const MotionBox = motion(Box);

function PersonalizedPathsSection() {
  const [loading, setLoading] = useState(true);
  const [personalizedPaths, setPersonalizedPaths] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    // Fetch personalized learning paths for the user
    const fetchPersonalizedPaths = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('personalized_learning_paths')
          .select(`
            *,
            personalized_modules (
              *,
              personalized_sprints (*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPersonalizedPaths(data || []);
      } catch (error) {
        console.error('Error fetching personalized paths:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonalizedPaths();
  }, [user]);
  
  const handlePathCreated = (newPath) => {
    // Add the new path to the list
    setPersonalizedPaths(prev => [newPath, ...prev]);
    onClose();
  };
  
  // Display spinner while loading
  if (loading) {
    return (
      <Box p={5} rounded="md" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4}>Your Personalized Learning Paths</Heading>
        <Center py={10}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Center>
      </Box>
    );
  }
  
  return (
    <MotionBox
      p={5}
      rounded="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="md">Your Personalized Learning Paths</Heading>
          <Text fontSize="sm" color="gray.500">
            Learning paths adapted to your strengths and areas for improvement
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="purple"
          size="sm"
          onClick={onOpen}
        >
          Create New Path
        </Button>
      </Flex>
      
      {personalizedPaths.length === 0 ? (
        <Box py={8} textAlign="center">
          <Text mb={4}>You don't have any personalized learning paths yet.</Text>
          <Button
            colorScheme="purple"
            onClick={onOpen}
            leftIcon={<AddIcon />}
          >
            Create Your First Personalized Path
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mt={4}>
          {personalizedPaths.map((path) => (
            <MotionBox
              key={path.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalizedPathCard 
                path={path} 
                progress={path.progress || 0}
              />
            </MotionBox>
          ))}
        </SimpleGrid>
      )}
      
      {/* Modal for generating a new personalized path */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Personalized Learning Path</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PersonalizedPathGenerator onPathCreated={handlePathCreated} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
}

export default PersonalizedPathsSection; 