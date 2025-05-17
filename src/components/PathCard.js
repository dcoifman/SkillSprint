import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Image,
  VStack,
  Flex,
  Badge,
  Heading,
  Text,
  HStack,
  Tag,
  Avatar,
  useColorModeValue,
  Box,
  useToast
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { isValidUUID } from '../utils/uuid.js';

function PathCard({ path }) {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Color mapping for different categories
  const categoryColors = {
    'Anatomy': 'green',
    'Medicine': 'blue',
    'Healthcare': 'pink',
    'Biology': 'purple',
    'Physiology': 'orange',
  };
  
  const colorScheme = categoryColors[path.category] || 'green';
  
  // Level-specific styling
  const levelConfig = {
    'Beginner': {
      color: 'green',
    },
    'Intermediate': {
      color: 'blue',
    },
    'Advanced': {
      color: 'purple',
    }
  };
  
  const config = levelConfig[path.level] || levelConfig.Beginner;

  const handleClick = () => {
    if (isValidUUID(path.id)) {
      navigate(`/path/${path.id}`);
    } else {
      toast({
        title: 'Demo Path',
        description: 'This is a demo path. Please select a real path to view details.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Card
      bg={cardBg}
      overflow="hidden"
      variant="outline"
      cursor="pointer"
      onClick={handleClick}
      position="relative"
      borderTopWidth="4px"
      borderTopColor={`${colorScheme}.500`}
      borderRadius="lg"
      boxShadow="md"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
        borderTopColor: `${colorScheme}.600`,
      }}
      transition="all 0.3s ease"
      height="100%"
    >
      <Image
        src={path.image}
        alt={path.title}
        height="180px"
        objectFit="cover"
      />
      
      <CardBody>
        <VStack align="start" spacing={3} height="100%">
          <Flex justify="space-between" width="100%">
            <Badge colorScheme={config.color} px={2} py={1} borderRadius="md">
              {path.level}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {path.estimated_time}
            </Text>
          </Flex>
          
          <Heading size="md" noOfLines={2}>
            {path.title}
          </Heading>
          
          <Text noOfLines={2} color="gray.500">
            {path.description}
          </Text>
          
          <Box mt={2}>
            {path.tags && path.tags.map((tag, index) => (
              <Tag key={index} size="sm" colorScheme={colorScheme} variant="subtle" mr={2} mb={2}>
                {tag}
              </Tag>
            ))}
          </Box>
          
          <Flex width="100%" justify="space-between" align="center" mt="auto">
            <HStack>
              <Avatar 
                size="sm" 
                src={path.instructor.avatar} 
                name={path.instructor.name} 
                border="2px solid"
                borderColor={`${colorScheme}.200`}
              />
              <Text fontSize="sm">{path.instructor.name}</Text>
            </HStack>
            
            <HStack spacing={3}>
              <HStack spacing={1}>
                <StarIcon color="yellow.500" />
                <Text fontSize="xs">{path.rating || '4.8'}</Text>
              </HStack>
            </HStack>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default PathCard; 