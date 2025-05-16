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
} from '@chakra-ui/react';

function DashboardPage() {
  // Mock data - in a real app, this would come from an API
  const userStats = {
    streakDays: 7,
    completedSprints: 42,
    totalPoints: 2150,
    nextLevel: 3000,
    skillsInProgress: 3,
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
      id: 3,
      title: 'Effective Email Communication',
      date: '2 days ago',
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
      id: 3,
      title: 'Data Visualization Principles',
      path: 'Data Analytics',
      time: '8 min',
    },
  ];

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8, lg: 12 }} py={8}>
      {/* Welcome Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={8}
      >
        <Box mb={{ base: 4, md: 0 }}>
          <Heading size="lg">Welcome back, Jane!</Heading>
          <Text color="gray.600">Ready for your learning sprint today?</Text>
        </Box>
        <HStack spacing={4}>
          <Button colorScheme="purple" variant="solid" bg="primary.600">
            Start Sprint
          </Button>
          <Button colorScheme="purple" variant="outline">
            View All Paths
          </Button>
        </HStack>
      </Flex>

      {/* Stats Section */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="md"
          border="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          rounded="lg"
          bg={useColorModeValue('white', 'gray.800')}
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
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          rounded="lg"
          bg={useColorModeValue('white', 'gray.800')}
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
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          rounded="lg"
          bg={useColorModeValue('white', 'gray.800')}
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
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          rounded="lg"
          bg={useColorModeValue('white', 'gray.800')}
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
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {learningPaths.map((path) => (
            <Card
              key={path.id}
              bg={useColorModeValue('white', 'gray.800')}
              shadow="md"
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
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
            bg={useColorModeValue('white', 'gray.800')}
            shadow="md"
            border="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
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
            bg={useColorModeValue('white', 'gray.800')}
            shadow="md"
            border="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
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
    </Box>
  );
}

export default DashboardPage; 