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
  Icon
} from '@chakra-ui/react';
import { StarIcon, TimeIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

// Create a gentle sway animation for leaves
const sway = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
`;

// Create a gentle grow animation
const grow = keyframes`
  0% { transform: scale(0.95); }
  50% { transform: scale(1.02); }
  100% { transform: scale(0.95); }
`;

function LeafIcon(props) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
      />
    </Icon>
  );
}

function PathCard({ path }) {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('green.300', 'green.600');
  const leafBg = useColorModeValue('green.50', 'green.900');
  const branchColor = useColorModeValue('brown.300', 'brown.600');
  
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
      leaves: 1,
      color: 'green',
      scale: 0.9
    },
    'Intermediate': {
      leaves: 2,
      color: 'blue',
      scale: 1
    },
    'Advanced': {
      leaves: 3,
      color: 'purple',
      scale: 1.1
    }
  };
  
  const config = levelConfig[path.level] || levelConfig.Beginner;

  const handleClick = () => {
    navigate(`/path/${path.id}`);
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
    >
      {/* Tree branch decoration */}
      <Box
        position="absolute"
        top="0"
        left="15px"
        width="3px"
        height="100%"
        bg={branchColor}
        zIndex={1}
      />
      
      {/* Leaf decorations based on level */}
      {Array(config.leaves).fill(0).map((_, i) => (
        <Box
          key={i}
          position="absolute"
          top={`${20 + i * 25}%`}
          left="5px"
          zIndex={2}
          animation={`${sway} ${3 + i}s ease-in-out infinite`}
          transform="rotate(30deg)"
          transformOrigin="center center"
        >
          <LeafIcon 
            color={`${colorScheme}.500`} 
            boxSize={6} 
          />
        </Box>
      ))}
      
      <Image
        src={path.image}
        alt={path.title}
        height="180px"
        objectFit="cover"
      />
      
      <CardBody>
        <VStack align="start" spacing={3}>
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
          
          <HStack spacing={2} flexWrap="wrap">
            {path.tags && path.tags.map((tag, index) => (
              <Tag key={index} size="sm" colorScheme={colorScheme} variant="subtle" my={1}>
                {tag}
              </Tag>
            ))}
          </HStack>
          
          <Flex width="100%" justify="space-between" align="center">
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
                <TimeIcon color="gray.500" />
                <Text fontSize="xs">{path.total_sprints || '12'} sprints</Text>
              </HStack>
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