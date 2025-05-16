import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  useColorModeValue,
  HStack,
  Divider,
  Container,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';

function DashboardPage() {
  // Mock data - in a real app, this would come from an API
  const userStats = {
    streakDays: 7,
    completedSprints: 42,
    totalPoints: 2150,
    nextLevel: 3000,
    skillsInProgress: 4,
  };

  const learningPaths = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals',
      progress: 65,
      nextSession: 'Neural Networks Basics',
      estimatedTime: 12,
    },
    {
      id: 2,
      title: 'Web Development with React',
      progress: 30,
      nextSession: 'React Hooks Deep Dive',
      estimatedTime: 8,
    },
    {
      id: 3,
      title: 'Business Communication',
      progress: 90,
      nextSession: 'Persuasive Presentations',
      estimatedTime: 15,
    },
    {
      id: 4,
      title: 'Functional Anatomy Fundamentals',
      progress: 15,
      nextSession: 'Skeletal System Basics',
      estimatedTime: 10,
    },
  ];

  const recentSprints = [
    {
      id: 1,
      title: 'Introduction to Artificial Neural Networks',
      date: '2 hours ago',
      score: 95,
      time: '12 min',
    },
    {
      id: 2,
      title: 'React Components and Props',
      date: 'Yesterday',
      score: 88,
      time: '8 min',
    },
    {
      id: 201,
      title: 'Introduction to Functional Anatomy',
      date: 'Today',
      score: 100,
      time: '10 min',
    },
  ];

  const recommendedSprints = [
    {
      id: 1,
      title: 'Deep Learning: Convolutional Networks',
      path: 'Machine Learning Fundamentals',
      time: '10 min',
    },
    {
      id: 2,
      title: 'React State Management',
      path: 'Web Development with React',
      time: '12 min',
    },
    {
      id: 202,
      title: 'Skeletal System Basics',
      path: 'Functional Anatomy Fundamentals',
      time: '10 min',
    },
  ];

  // Define color mode values ONCE at the top
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="7xl" py={8}>
      {/* User welcome section */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Welcome, {user?.user_metadata?.full_name || 'Learner'}!
          </Heading>
          <Text color="gray.600">
            Continue your learning journey or explore new skills
          </Text>
        </Box>
        
        <Link as={RouterLink} to="/build-course">
          <Button 
            colorScheme="purple" 
            leftIcon={<AddIcon />}
          >
            Create Course
          </Button>
        </Link>
      </Flex>

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="md"
          border="1px"
          borderColor={cardBorder}
          rounded="lg"
          bg={cardBg}
        >
          <StatLabel fontWeight="medium">Daily Streak</StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {userStats.streakDays} days
          </StatNumber>
          <StatHelpText>Keep it going!</StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="md"
          border="1px"
          borderColor={cardBorder}
          rounded="lg"
          bg={cardBg}
        >
          <StatLabel fontWeight="medium">Completed Sprints</StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {userStats.completedSprints}
          </StatNumber>
          <StatHelpText>+3 this week</StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="md"
          border="1px"
          borderColor={cardBorder}
          rounded="lg"
          bg={cardBg}
        >
          <StatLabel fontWeight="medium">XP Points</StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {userStats.totalPoints}
          </StatNumber>
          <StatHelpText>
            {userStats.nextLevel - userStats.totalPoints} until next level
          </StatHelpText>
          <Progress value={70} colorScheme="purple" size="sm" mt={2} />
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="md"
          border="1px"
          borderColor={cardBorder}
          rounded="lg"
          bg={cardBg}
        >
          <StatLabel fontWeight="medium">Active Paths</StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {userStats.skillsInProgress}
          </StatNumber>
          <StatHelpText>Skills in progress</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Learning Paths Progress */}
      <Box mb={8}>
        <Heading size="md" mb={4}>
          Your Learning Paths
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {learningPaths.map((path) => (
            <Card
              key={path.id}
              bg={cardBg}
              shadow="md"
              border="1px"
              borderColor={cardBorder}
            >
              <CardHeader pb={0}>
                <Heading size="sm">{path.title}</Heading>
              </CardHeader>
              <CardBody py={3}>
                <Text mb={2} fontSize="sm">
                  Progress: {path.progress}%
                </Text>
                <Progress
                  value={path.progress}
                  colorScheme="purple"
                  size="sm"
                  mb={3}
                />
                <Text fontSize="sm" fontWeight="medium">
                  Next Sprint: {path.nextSession}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Estimated time: {path.estimatedTime} min
                </Text>
              </CardBody>
              <CardFooter pt={0}>
                <Button colorScheme="purple" size="sm" variant="outline">
                  Continue
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Recent and Recommended Sections */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Recent Sprints */}
        <Box>
          <Heading size="md" mb={4}>
            Recent Sprints
          </Heading>
          <Card
            bg={cardBg}
            shadow="md"
            border="1px"
            borderColor={cardBorder}
          >
            {recentSprints.map((sprint, index) => (
              <React.Fragment key={sprint.id}>
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="medium">{sprint.title}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {sprint.date} • {sprint.time}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={
                        sprint.score >= 90
                          ? 'green'
                          : sprint.score >= 70
                          ? 'yellow'
                          : 'red'
                      }
                      fontSize="0.9em"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {sprint.score}%
                    </Badge>
                  </Flex>
                </Box>
                {index < recentSprints.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Box>

        {/* Recommended Sprints */}
        <Box>
          <Heading size="md" mb={4}>
            Recommended for You
          </Heading>
          <Card
            bg={cardBg}
            shadow="md"
            border="1px"
            borderColor={cardBorder}
          >
            {recommendedSprints.map((sprint, index) => (
              <React.Fragment key={sprint.id}>
                <Box p={4}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="medium">{sprint.title}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {sprint.path} • {sprint.time}
                      </Text>
                    </Box>
                    <Button size="sm" colorScheme="purple">
                      Start
                    </Button>
                  </Flex>
                </Box>
                {index < recommendedSprints.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Box>
      </SimpleGrid>
    </Container>
  );
}

export default DashboardPage; 