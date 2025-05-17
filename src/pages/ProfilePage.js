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
  Skeleton,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="6xl" py={8}>
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Profile</Tab>
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
                      <Avatar 
                        size="2xl" 
                        src={user?.user_metadata?.avatar_url || 'https://bit.ly/broken-link'} 
                        name={user?.user_metadata?.full_name || user?.email || 'User'}
                      />
                      <Box textAlign="center">
                        <Heading size="md">{user?.user_metadata?.full_name || 'User'}</Heading>
                        <Text color="gray.500">Member since {new Date(user?.created_at).toLocaleDateString()}</Text>
                      </Box>
                      <HStack>
                        <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                          Level 1
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
                        <Text fontWeight="bold">0</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Current Streak</Text>
                        <Text fontWeight="bold">0 days</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>XP Points</Text>
                        <Text fontWeight="bold">0</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Next Level</Text>
                        <Text fontWeight="bold">1000 XP needed</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
              
              {/* Right Column - Learning Activity */}
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
                    <Heading size="md">Skills in Progress</Heading>
                  </CardHeader>
                  <CardBody>
                    {/* Empty state */}
                    <Box p={6} textAlign="center">
                      <Text mb={4}>You haven't started learning any skills yet</Text>
                      <Button colorScheme="purple" as="a" href="/explore">
                        Explore Skills
                      </Button>
                          </Box>
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
                    {/* Empty state */}
                    <Box p={6} textAlign="center">
                      <Text mb={4}>No learning activity yet</Text>
                      <Button colorScheme="purple" as="a" href="/dashboard">
                        Go to Dashboard
                      </Button>
                      </Box>
                  </CardBody>
                </Card>
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
                        <Input defaultValue={user?.user_metadata?.full_name || ''} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input defaultValue={user?.email || ''} isReadOnly />
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
                        <FormLabel>Preferred Content Format</FormLabel>
                        <Select defaultValue="mixed">
                          <option value="text">Mostly text</option>
                          <option value="visual">Mostly visual</option>
                          <option value="mixed">Mixed formats</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                  
                  <Divider />
                  
                  <Box mt={4}>
                    <Heading size="sm" mb={4}>Notifications</Heading>
                    <VStack align="start" spacing={4}>
                      <HStack width="100%" justify="space-between">
                        <Box>
                          <Text fontWeight="medium">Daily Reminder</Text>
                          <Text fontSize="sm" color="gray.500">Get a daily reminder to practice your skills</Text>
                        </Box>
                        <FormControl display="flex" justifyContent="flex-end">
                          <Switch id="daily-reminder" defaultChecked />
                        </FormControl>
                      </HStack>
                      <HStack width="100%" justify="space-between">
                        <Box>
                          <Text fontWeight="medium">New Content</Text>
                          <Text fontSize="sm" color="gray.500">Be notified when new courses are available</Text>
                        </Box>
                        <FormControl display="flex" justifyContent="flex-end">
                          <Switch id="new-content" defaultChecked />
                        </FormControl>
                      </HStack>
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