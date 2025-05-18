import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  HStack,
  Progress,
  useColorModeValue,
  Icon,
  Tooltip,
  Tag,
  TagLabel,
  TagRightIcon
} from '@chakra-ui/react';
import { 
  CheckIcon, 
  ChevronRightIcon, 
  StarIcon, 
  TimeIcon,
  InfoOutlineIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { FaBrain, FaRoute, FaPuzzlePiece } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

function PersonalizedPathCard({ path, progress = 0 }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const tagBg = useColorModeValue('purple.50', 'purple.900');
  
  // Count modules and sprints
  const moduleCount = path.personalized_modules ? path.personalized_modules.length : 0;
  const sprintCount = path.personalized_modules ? 
    path.personalized_modules.reduce((count, module) => {
      return count + (module.personalized_sprints ? module.personalized_sprints.length : 0);
    }, 0) : 0;
  
  // Count AI-generated content
  const aiGeneratedCount = path.personalized_modules ? 
    path.personalized_modules.reduce((count, module) => {
      return module.personalized_sprints ? 
        count + module.personalized_sprints.filter(sprint => sprint.is_generated).length : 
        count;
    }, 0) : 0;
  
  return (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="xl" 
      overflow="hidden"
      shadow="md"
      _hover={{ shadow: 'lg', borderColor: accentColor }}
      transition="all 0.3s"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center" width="100%">
          <Box>
            <HStack mb={1}>
              <Heading size="md" fontWeight="bold">{path.title}</Heading>
              <Badge colorScheme="purple" fontSize="0.7em" borderRadius="full" px={2}>
                Personalized
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">{path.description}</Text>
          </Box>
          
          <Tag size="sm" variant="subtle" colorScheme="purple" borderRadius="full">
            <Icon as={FaBrain} mr={1} />
            <TagLabel>AI Enhanced</TagLabel>
          </Tag>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <Divider my={3} />
        
        <Flex direction="column" gap={3} mb={4}>
          <HStack justify="space-between" fontSize="sm">
            <HStack>
              <Icon as={FaRoute} color={accentColor} />
              <Text>Modules</Text>
            </HStack>
            <Text fontWeight="semibold">{moduleCount}</Text>
          </HStack>
          
          <HStack justify="space-between" fontSize="sm">
            <HStack>
              <Icon as={FaPuzzlePiece} color={accentColor} />
              <Text>Sprints</Text>
            </HStack>
            <Text fontWeight="semibold">{sprintCount}</Text>
          </HStack>
          
          <HStack justify="space-between" fontSize="sm">
            <HStack>
              <RepeatIcon color={accentColor} />
              <Text>Progress</Text>
            </HStack>
            <Text fontWeight="semibold">{progress}%</Text>
          </HStack>
          
          <HStack justify="space-between" fontSize="sm">
            <HStack>
              <StarIcon color={accentColor} />
              <Text>AI-Generated Content</Text>
            </HStack>
            <Text fontWeight="semibold">{aiGeneratedCount} sprints</Text>
          </HStack>
        </Flex>
        
        <Progress 
          value={progress} 
          colorScheme="purple" 
          size="sm" 
          borderRadius="full" 
          mb={4}
        />
        
        <Flex justify="space-between" mt={2}>
          <HStack spacing={2}>
            <Tooltip label="This path is tailored to your learning needs">
              <Tag size="sm" variant="subtle" colorScheme="green" borderRadius="full">
                <TagRightIcon as={CheckIcon} />
                <TagLabel>Personalized</TagLabel>
              </Tag>
            </Tooltip>
            
            {aiGeneratedCount > 0 && (
              <Tooltip label="Contains AI-generated content based on your performance">
                <Tag size="sm" variant="subtle" colorScheme="blue" borderRadius="full">
                  <TagRightIcon as={InfoOutlineIcon} />
                  <TagLabel>Adaptive</TagLabel>
                </Tag>
              </Tooltip>
            )}
          </HStack>
          
          <RouterLink to={`/personalized-path/${path.id}`}>
            <Button
              size="sm"
              colorScheme="purple"
              rightIcon={<ChevronRightIcon />}
              variant="outline"
            >
              View Path
            </Button>
          </RouterLink>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default PersonalizedPathCard; 