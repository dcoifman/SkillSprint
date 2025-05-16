import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Divider,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';

function ProfilePage() {
  // Mock user data
  const userData = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    joinDate: 'January 2023',
    level: 8,
    xpPoints: 2150,
    nextLevelPoints: 3000,
    completedSprints: 42,
    learningStreak: 7,
  };

  // Mock skill badges
  const skillBadges = [
    { id: 1, name: 'Python Basics', level: 'Advanced', image: '🐍', color: 'green' },
    { id: 2, name: 'Machine Learning', level: 'Intermediate', image: '🧠', color: 'blue' },
    { id: 3, name: 'Data Analysis', level: 'Advanced', image: '📊', color: 'purple' },
    { id: 4, name: 'Web Development', level: 'Beginner', image: '🌐', color: 'orange' },
    { id: 5, name: 'Public Speaking', level: 'Intermediate', image: '🎤', color: 'pink' },
    { id: 6, name: 'Technical Writing', level: 'Beginner', image: '✏️', color: 'teal' },
  ];

  // Mock certificates
  const certificates = [
    { id: 1, name: 'Python Programming Mastery', issueDate: 'March 12, 2023', image: '🏆' },
    { id: 2, name: 'Data Science Foundations', issueDate: 'April 30, 2023', image: '🎓' },
  ];

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="6xl" py={8}>
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Achievements</Tab>
          <Tab>Settings</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel p={0} pt={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {/* Left Column - User Info */}
              <Box gridColumn="span 1">
                <Card
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                  mb={4}
                >
                  <CardBody>
                    <VStack spacing={4} align="center">
                      <Avatar size="2xl" src={userData.avatar} />
                      <Box textAlign="center">
                        <Heading size="md">{userData.name}</Heading>
                        <Text color="gray.500">Member since {userData.joinDate}</Text>
                      </Box>
                      <HStack>
                        <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                          Level {userData.level}
                        </Badge>
                        <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                          {userData.learningStreak} day streak
                        </Badge>
                      </HStack>
                      <Button colorScheme="purple" size="sm">
                        Edit Profile
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                >
                  <CardHeader pb={0}>
                    <Heading size="sm">Learning Stats</Heading>
                  </CardHeader>
                  <CardBody pt={2}>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text>Completed Sprints</Text>
                        <Text fontWeight="bold">{userData.completedSprints}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Current Streak</Text>
                        <Text fontWeight="bold">{userData.learningStreak} days</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>XP Points</Text>
                        <Text fontWeight="bold">{userData.xpPoints}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Next Level</Text>
                        <Text fontWeight="bold">{userData.nextLevelPoints - userData.xpPoints} XP needed</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
              
              {/* Right Column - Achievements & Learning */}
              <Box gridColumn="span 2">
                <Card
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                  mb={6}
                >
                  <CardHeader pb={1}>
                    <Heading size="md">Skill Progress</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      {skillBadges.map((badge) => (
                        <HStack key={badge.id} p={3} borderWidth="1px" borderRadius="md">
                          <Box fontSize="2xl">{badge.image}</Box>
                          <Box>
                            <Text fontWeight="medium">{badge.name}</Text>
                            <Badge colorScheme={badge.color}>{badge.level}</Badge>
                          </Box>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
                
                <Card
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                >
                  <CardHeader pb={1}>
                    <Heading size="md">Recent Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Box p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">Completed "Neural Networks Basics" sprint</Text>
                        <Text fontSize="sm" color="gray.500">2 hours ago • Score: 95%</Text>
                      </Box>
                      <Box p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">Earned "Python Intermediate" badge</Text>
                        <Text fontSize="sm" color="gray.500">Yesterday</Text>
                      </Box>
                      <Box p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">Started "Web Development with React" path</Text>
                        <Text fontSize="sm" color="gray.500">3 days ago</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </TabPanel>
          
          {/* Achievements Tab */}
          <TabPanel p={0} pt={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Heading size="md" mb={4}>Skill Badges</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  {skillBadges.map((badge) => (
                    <Card
                      key={badge.id}
                      bg={bgColor}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                    >
                      <CardBody>
                        <HStack>
                          <Box
                            w={12}
                            h={12}
                            borderRadius="full"
                            bg={`${badge.color}.100`}
                            color={`${badge.color}.500`}
                            fontSize="2xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {badge.image}
                          </Box>
                          <Box>
                            <Text fontWeight="medium">{badge.name}</Text>
                            <Badge colorScheme={badge.color}>{badge.level}</Badge>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
              
              <Box>
                <Heading size="md" mb={4}>Certificates</Heading>
                {certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    mb={4}
                  >
                    <CardBody>
                      <HStack>
                        <Box
                          w={12}
                          h={12}
                          borderRadius="full"
                          bg="yellow.100"
                          color="yellow.500"
                          fontSize="2xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {cert.image}
                        </Box>
                        <Box>
                          <Text fontWeight="medium">{cert.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Issued on {cert.issueDate}
                          </Text>
                        </Box>
                      </HStack>
                      <Button size="sm" colorScheme="purple" variant="outline" mt={3}>
                        View Certificate
                      </Button>
                    </CardBody>
                  </Card>
                ))}
                
                <Box textAlign="center" py={6}>
                  <Text mb={3}>Complete more learning paths to earn certificates</Text>
                  <Button colorScheme="purple" size="sm">
                    Explore Paths
                  </Button>
                </Box>
              </Box>
            </SimpleGrid>
          </TabPanel>
          
          {/* Settings Tab */}
          <TabPanel p={0} pt={6}>
            <Card
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
            >
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="sm" mb={4}>Account Settings</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input defaultValue={userData.name} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input defaultValue={userData.email} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input type="password" defaultValue="************" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Profile Picture</FormLabel>
                        <Button>Change Picture</Button>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb={4}>Learning Preferences</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Sprint Duration</FormLabel>
                        <Select defaultValue="medium">
                          <option value="short">Short (5 min)</option>
                          <option value="medium">Medium (10 min)</option>
                          <option value="long">Long (15+ min)</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Daily Learning Goal</FormLabel>
                        <Select defaultValue="2">
                          <option value="1">1 sprint per day</option>
                          <option value="2">2 sprints per day</option>
                          <option value="3">3 sprints per day</option>
                          <option value="4">4+ sprints per day</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Preferred Content Format</FormLabel>
                        <Select defaultValue="mixed">
                          <option value="text">Mostly text</option>
                          <option value="visual">Mostly visual</option>
                          <option value="mixed">Mixed formats</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select defaultValue="adaptive">
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                          <option value="adaptive">Adaptive (recommended)</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb={4}>Notifications</Heading>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between">
                        <FormLabel htmlFor="daily-reminder" mb={0}>Daily learning reminders</FormLabel>
                        <Switch id="daily-reminder" defaultChecked />
                      </Flex>
                      <Flex justify="space-between">
                        <FormLabel htmlFor="streak-alert" mb={0}>Streak alerts</FormLabel>
                        <Switch id="streak-alert" defaultChecked />
                      </Flex>
                      <Flex justify="space-between">
                        <FormLabel htmlFor="achievement" mb={0}>Achievement notifications</FormLabel>
                        <Switch id="achievement" defaultChecked />
                      </Flex>
                      <Flex justify="space-between">
                        <FormLabel htmlFor="new-content" mb={0}>New content recommendations</FormLabel>
                        <Switch id="new-content" defaultChecked />
                      </Flex>
                    </VStack>
                  </Box>
                  
                  <Box pt={4}>
                    <Button colorScheme="purple">Save Changes</Button>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default ProfilePage; 