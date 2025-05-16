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
  useColorModeValue
} from '@chakra-ui/react';

function PathCard({ path }) {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const tagBg = useColorModeValue('gray.100', 'gray.700');

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
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        transition: 'all 0.2s',
      }}
    >
      <Image
        src={path.image}
        alt={path.title}
        height="200px"
        objectFit="cover"
      />
      <CardBody>
        <VStack align="start" spacing={3}>
          <Flex justify="space-between" width="100%">
            <Badge colorScheme={path.level === 'Beginner' ? 'green' : path.level === 'Intermediate' ? 'blue' : 'purple'}>
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
          
          <HStack spacing={2}>
            {path.tags.map((tag, index) => (
              <Tag key={index} size="sm" bg={tagBg}>
                {tag}
              </Tag>
            ))}
          </HStack>
          
          <Flex width="100%" justify="space-between" align="center">
            <HStack>
              <Avatar size="sm" src={path.instructor.avatar} name={path.instructor.name} />
              <Text fontSize="sm">{path.instructor.name}</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {path.students_count.toLocaleString()} students
            </Text>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default PathCard; 