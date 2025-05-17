import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Card,
  CardBody,
  CardFooter,
  IconButton,
  useColorModeValue,
  Divider,
  Select,
  Tooltip,
  Image,
  Wrap,
  WrapItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import {
  SearchIcon,
  StarIcon,
  ChatIcon,
  TimeIcon,
  AddIcon,
  BellIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext.js';

function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const lightBg = useColorModeValue('gray.50', 'gray.700');
  
  // Mock users for community members spotlight
  const featuredMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974',
      role: 'Data Scientist',
      skillLevel: 'Advanced',
      paths: 12,
      contributions: 47
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974',
      role: 'UX Designer',
      skillLevel: 'Intermediate',
      paths: 8,
      contributions: 32
    },
    {
      id: 3,
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974',
      role: 'Product Manager',
      skillLevel: 'Expert',
      paths: 15,
      contributions: 63
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961',
      role: 'Marketing Specialist',
      skillLevel: 'Intermediate',
      paths: 10,
      contributions: 28
    },
  ];
  
  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'AI for Product Managers',
      date: 'June 15, 2024',
      time: '2:00 PM - 3:30 PM EST',
      host: 'Sarah Johnson',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974',
      participants: 42,
      image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=2070',
      tags: ['AI', 'Product Management']
    },
    {
      id: 2,
      title: 'UX Research Fundamentals Workshop',
      date: 'June 18, 2024',
      time: '1:00 PM - 4:00 PM EST',
      host: 'Michael Chen',
      hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974',
      participants: 36,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070',
      tags: ['UX', 'Research', 'Design']
    },
    {
      id: 3,
      title: 'Data Visualization Community Sprint',
      date: 'June 25, 2024',
      time: '11:00 AM - 12:30 PM EST',
      host: 'James Wilson',
      hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974',
      participants: 28,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
      tags: ['Data', 'Visualization', 'Community Sprint']
    },
  ];
  
  // Mock community posts
  const communityPosts = [
    {
      id: 1,
      author: 'Sarah Johnson',
      authorRole: 'Data Scientist',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974',
      content: "Just completed the Advanced SQL Learning Path! The bite-sized sprints made it so easy to fit learning into my busy schedule. Now applying these skills to optimize our customer database.",
      tags: ['SQL', 'Data'],
      likes: 42,
      comments: 18,
      timeAgo: '2 days ago',
      pathReference: 'Advanced SQL for Data Scientists'
    },
    {
      id: 2,
      author: 'Michael Chen',
      authorRole: 'UX Designer',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974',
      content: "The UX Research learning path completely changed how I approach user interviews. I've created a resource guide for our team based on what I learned in the sprints.",
      tags: ['UX', 'Research'],
      likes: 36,
      comments: 14,
      timeAgo: '5 days ago',
      pathReference: 'UX Research Fundamentals'
    },
    {
      id: 3,
      author: 'James Wilson',
      authorRole: 'Product Manager',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974',
      content: "After completing the 'Agile Product Management' path, I reorganized our entire workflow. Our team's velocity increased by 40% in just one sprint!",
      tags: ['Agile', 'Management'],
      likes: 58,
      comments: 24,
      timeAgo: '1 week ago',
      pathReference: 'Agile Product Management'
    },
    {
      id: 4,
      author: 'Emily Rodriguez',
      authorRole: 'Marketing Specialist',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961',
      content: "The 'Digital Marketing Analytics' path helped me identify key metrics we weren't tracking. Implemented new dashboards and already seeing better campaign performance!",
      tags: ['Marketing', 'Analytics'],
      likes: 29,
      comments: 12,
      timeAgo: '3 days ago',
      pathReference: 'Digital Marketing Analytics'
    },
    {
      id: 5,
      author: 'David Kim',
      authorRole: 'Frontend Developer',
      authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974',
      content: "Just finished the React Performance Optimization path. Reduced our app's loading time by 40% by implementing the lazy loading and memoization techniques from Sprint 3.",
      tags: ['React', 'Performance', 'Frontend'],
      likes: 47,
      comments: 21,
      timeAgo: '4 days ago',
      pathReference: 'React Performance Optimization'
    },
  ];
  
  // Mock discussion topics
  const discussions = [
    {
      id: 1,
      title: "How are you implementing AI in your workflow?",
      author: "Sarah Johnson",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974",
      replies: 24,
      views: 156,
      lastActivity: "2 hours ago",
      tags: ["AI", "Workflow"]
    },
    {
      id: 2,
      title: "Resources for improving data visualization skills?",
      author: "James Wilson",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974",
      replies: 18,
      views: 132,
      lastActivity: "6 hours ago",
      tags: ["Data", "Visualization"]
    },
    {
      id: 3,
      title: "Career transition from marketing to UX design",
      author: "Emily Rodriguez",
      authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961",
      replies: 32,
      views: 201,
      lastActivity: "1 day ago",
      tags: ["Career Change", "UX Design"]
    },
    {
      id: 4,
      title: "How to stay motivated during long learning paths?",
      author: "Michael Chen",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974",
      replies: 46,
      views: 312,
      lastActivity: "2 days ago",
      tags: ["Motivation", "Learning Tips"]
    },
    {
      id: 5,
      title: "What's your favorite sprint in the Python Data Science path?",
      author: "David Kim",
      authorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974",
      replies: 29,
      views: 178,
      lastActivity: "3 days ago",
      tags: ["Python", "Data Science"]
    },
  ];
  
  // Popular skill tags
  const popularTags = [
    "Python", "React", "Data Science", "UX Design", "Marketing", 
    "Management", "SQL", "Machine Learning", "Leadership", "AI", 
    "Communication", "Product Management", "Design", "JavaScript"
  ];

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box 
        position="relative"
        overflow="hidden"
        py={16}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-br, purple.600, primary.500, secondary.400)',
          opacity: 0.95,
          zIndex: 0,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 
            'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 40%), ' +
            'radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
          zIndex: 1,
        }}
      >
        {/* Animated gradient orbs */}
        <Box
          position="absolute"
          top="-20%"
          left="-10%"
          width="40%"
          height="40%"
          borderRadius="full"
          bg="pink.400"
          filter="blur(80px)"
          opacity="0.15"
          animation="float 8s ease-in-out infinite"
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="-5%"
          width="30%"
          height="30%"
          borderRadius="full"
          bg="blue.400"
          filter="blur(80px)"
          opacity="0.15"
          animation="float 6s ease-in-out infinite"
          zIndex={1}
        />
        
        <Container maxW="7xl" position="relative" zIndex={2}>
          <VStack spacing={8} align="start">
            <Heading 
              as="h1" 
              size="2xl"
              bgGradient="linear(to-r, white, whiteAlpha.800)"
              bgClip="text"
              letterSpacing="tight"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            >
              SkillSprint Community
            </Heading>
            <Text 
              fontSize="xl" 
              maxW="2xl"
              color="whiteAlpha.900"
              lineHeight="tall"
              fontWeight="medium"
              textShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              Connect with fellow learners, share your achievements, join events, and grow together. Our community helps you learn faster and build lasting connections.
            </Text>
            {!isAuthenticated && (
              <Button 
                size="lg" 
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                _hover={{
                  bg: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                }}
                _active={{
                  bg: 'whiteAlpha.800',
                  transform: 'scale(0.98)',
                }}
                fontWeight="bold"
                px={8}
                py={6}
                leftIcon={<AddIcon />}
                boxShadow="0 8px 16px rgba(0,0,0,0.1)"
                backdropFilter="blur(8px)"
                transition="all 0.2s"
              >
                Join Community
              </Button>
            )}
          </VStack>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Container maxW="7xl" py={10}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          {/* Left Sidebar */}
          <VStack width={{ base: '100%', lg: '25%' }} spacing={8} align="stretch">
            {/* Search Box */}
            <Card borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Search community..." />
                </InputGroup>
              </CardBody>
            </Card>
            
            {/* Community Stats */}
            <Card borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={5}>
                <Heading size="md" mb={4}>Community Stats</Heading>
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" width="100%">
                    <Text>Members:</Text>
                    <Text fontWeight="bold">24,689</Text>
                  </HStack>
                  <HStack justify="space-between" width="100%">
                    <Text>Posts this week:</Text>
                    <Text fontWeight="bold">3,245</Text>
                  </HStack>
                  <HStack justify="space-between" width="100%">
                    <Text>Active discussions:</Text>
                    <Text fontWeight="bold">182</Text>
                  </HStack>
                  <HStack justify="space-between" width="100%">
                    <Text>Upcoming events:</Text>
                    <Text fontWeight="bold">12</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
            
            {/* Popular Tags */}
            <Card borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={5}>
                <Heading size="md" mb={4}>Popular Tags</Heading>
                <Wrap spacing={2}>
                  {popularTags.map((tag, index) => (
                    <WrapItem key={index}>
                      <Tag 
                        size="md" 
                        borderRadius="full" 
                        variant="subtle" 
                        colorScheme="primary"
                        cursor="pointer"
                        _hover={{ bg: 'primary.100' }}
                      >
                        {tag}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </CardBody>
            </Card>
            
            {/* Community Leaders */}
            <Card borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={5}>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Community Leaders</Heading>
                  <Button size="xs" rightIcon={<ExternalLinkIcon />} variant="link">
                    View All
                  </Button>
                </HStack>
                <VStack spacing={4} align="stretch">
                  {featuredMembers.slice(0, 3).map((member) => (
                    <HStack key={member.id} spacing={3}>
                      <Avatar src={member.avatar} name={member.name} size="sm" />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="medium" fontSize="sm">{member.name}</Text>
                        <Text fontSize="xs" color={mutedColor}>{member.role}</Text>
                      </VStack>
                      <Badge ml="auto" colorScheme="green" variant="subtle" fontSize="xs">
                        {member.contributions} contributions
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
          
          {/* Main Content Area */}
          <Box width={{ base: '100%', lg: '75%' }}>
            {/* Community Tabs */}
            <Tabs colorScheme="primary" onChange={(index) => setActiveTab(index)}>
              <TabList>
                <Tab>Feed</Tab>
                <Tab>Discussions</Tab>
                <Tab>Events</Tab>
                <Tab>Members</Tab>
              </TabList>
              
              <TabPanels>
                {/* Feed Tab */}
                <TabPanel px={0}>
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md">Community Feed</Heading>
                    <HStack>
                      <Select size="sm" width="150px" placeholder="Filter by">
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="following">Following</option>
                      </Select>
                      
                      <Button colorScheme="primary" leftIcon={<AddIcon />} onClick={onOpen}>
                        New Post
                      </Button>
                    </HStack>
                  </HStack>
                  
                  <VStack spacing={6} align="stretch">
                    {communityPosts.map((post) => (
                      <Card key={post.id} borderRadius="lg" overflow="hidden" boxShadow="md" borderWidth="1px" borderColor={borderColor}>
                        <CardBody p={0}>
                          <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                            <HStack>
                              <Avatar src={post.authorAvatar} name={post.author} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{post.author}</Text>
                                <Text fontSize="sm" color={mutedColor}>{post.authorRole}</Text>
                              </VStack>
                              <Text ml="auto" fontSize="sm" color={mutedColor}>{post.timeAgo}</Text>
                            </HStack>
                          </Box>
                          
                          <Box p={5}>
                            <Text fontSize="md" mb={4}>
                              {post.content}
                            </Text>
                            
                            {post.pathReference && (
                              <Box 
                                p={3} 
                                borderRadius="md" 
                                bg={lightBg} 
                                mb={4}
                                borderLeftWidth="4px"
                                borderLeftColor="primary.500"
                              >
                                <HStack>
                                  <Text fontWeight="medium" fontSize="sm">Learning Path:</Text>
                                  <Text fontSize="sm" color="primary.500">{post.pathReference}</Text>
                                </HStack>
                              </Box>
                            )}
                            
                            <HStack>
                              {post.tags.map((tag, i) => (
                                <Badge key={i} colorScheme="primary">{tag}</Badge>
                              ))}
                            </HStack>
                          </Box>
                        </CardBody>
                        <CardFooter bg={lightBg} p={4}>
                          <HStack justify="space-between" width="100%">
                            <Button variant="ghost" leftIcon={<StarIcon />} size="sm">
                              {post.likes}
                            </Button>
                            <Button variant="ghost" leftIcon={<ChatIcon />} size="sm">
                              {post.comments} Comments
                            </Button>
                            <Button variant="ghost" size="sm">
                              Share
                            </Button>
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Discussions Tab */}
                <TabPanel px={0}>
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md">Community Discussions</Heading>
                    <HStack>
                      <Select size="sm" width="150px" placeholder="Sort by">
                        <option value="recent">Most Recent</option>
                        <option value="active">Most Active</option>
                        <option value="viewed">Most Viewed</option>
                      </Select>
                      
                      <Button colorScheme="primary" leftIcon={<AddIcon />}>
                        New Discussion
                      </Button>
                    </HStack>
                  </HStack>
                  
                  <Card borderRadius="lg" overflow="hidden">
                    <CardBody p={0}>
                      {discussions.map((discussion, i) => (
                        <React.Fragment key={discussion.id}>
                          <Box p={4} cursor="pointer" _hover={{ bg: lightBg }}>
                            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                              <VStack align="start" flex="1">
                                <Heading size="sm" color="primary.600">{discussion.title}</Heading>
                                <HStack>
                                  <Avatar size="xs" src={discussion.authorAvatar} name={discussion.author} />
                                  <Text fontSize="sm">{discussion.author}</Text>
                                  <Text fontSize="xs" color={mutedColor}>{discussion.lastActivity}</Text>
                                </HStack>
                                <HStack>
                                  {discussion.tags.map((tag, i) => (
                                    <Tag key={i} size="sm" colorScheme="primary" variant="subtle">
                                      {tag}
                                    </Tag>
                                  ))}
                                </HStack>
                              </VStack>
                              
                              <HStack spacing={6} alignSelf={{ base: 'start', md: 'center' }}>
                                <VStack spacing={0}>
                                  <Text fontWeight="bold">{discussion.replies}</Text>
                                  <Text fontSize="xs" color={mutedColor}>Replies</Text>
                                </VStack>
                                <VStack spacing={0}>
                                  <Text fontWeight="bold">{discussion.views}</Text>
                                  <Text fontSize="xs" color={mutedColor}>Views</Text>
                                </VStack>
                              </HStack>
                            </Flex>
                          </Box>
                          {i < discussions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </CardBody>
                  </Card>
                </TabPanel>
                
                {/* Events Tab */}
                <TabPanel px={0}>
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md">Upcoming Events</Heading>
                    <Button colorScheme="primary" leftIcon={<AddIcon />}>
                      Create Event
                    </Button>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} borderRadius="lg" overflow="hidden" boxShadow="md">
                        <Image
                          src={event.image}
                          alt={event.title}
                          height="160px"
                          objectFit="cover"
                        />
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Heading size="md">{event.title}</Heading>
                            <HStack>
                              <TimeIcon color="primary.500" />
                              <Text fontSize="sm">{event.date}</Text>
                            </HStack>
                            <Text fontSize="sm">{event.time}</Text>
                            <HStack>
                              <Avatar size="xs" src={event.hostAvatar} name={event.host} />
                              <Text fontSize="sm">Hosted by {event.host}</Text>
                            </HStack>
                            <HStack>
                              {event.tags.map((tag, i) => (
                                <Badge key={i} colorScheme="primary">{tag}</Badge>
                              ))}
                            </HStack>
                          </VStack>
                        </CardBody>
                        <CardFooter bg={lightBg} p={4}>
                          <HStack justify="space-between" width="100%">
                            <Text fontSize="sm">{event.participants} participants</Text>
                            <Button size="sm" colorScheme="primary" variant="outline">
                              RSVP
                            </Button>
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                </TabPanel>
                
                {/* Members Tab */}
                <TabPanel px={0}>
                  <HStack justify="space-between" mb={6}>
                    <Heading size="md">Community Members</Heading>
                    <Select size="sm" width="200px" placeholder="Sort by contributions">
                      <option value="contributions">Most Contributions</option>
                      <option value="recent">Recently Joined</option>
                      <option value="paths">Most Paths Completed</option>
                    </Select>
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    {featuredMembers.map((member) => (
                      <Card key={member.id} borderRadius="lg" overflow="hidden" boxShadow="md" borderWidth="1px" borderColor={borderColor}>
                        <Box bg="primary.50" p={5} textAlign="center">
                          <Avatar
                            size="xl"
                            src={member.avatar}
                            name={member.name}
                            mb={3}
                            border="4px solid white"
                          />
                          <Heading size="md">{member.name}</Heading>
                          <Text color={mutedColor}>{member.role}</Text>
                          <Badge mt={2} colorScheme="primary">{member.skillLevel}</Badge>
                        </Box>
                        <CardBody>
                          <SimpleGrid columns={2} spacing={4}>
                            <VStack>
                              <Text fontSize="2xl" fontWeight="bold" color="primary.500">{member.paths}</Text>
                              <Text fontSize="sm" color={mutedColor}>Paths Completed</Text>
                            </VStack>
                            <VStack>
                              <Text fontSize="2xl" fontWeight="bold" color="primary.500">{member.contributions}</Text>
                              <Text fontSize="sm" color={mutedColor}>Contributions</Text>
                            </VStack>
                          </SimpleGrid>
                        </CardBody>
                        <CardFooter bg={lightBg} p={4}>
                          <Button width="100%" size="sm" variant="outline">View Profile</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Container>
      
      {/* New Post Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel>Share something with the community</FormLabel>
                <Textarea 
                  placeholder="What would you like to share? Achievements, questions, or resources..." 
                  rows={6}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Add tags (optional)</FormLabel>
                <Input placeholder="Add tags separated by commas (e.g., Python, Data Science)" />
              </FormControl>
              
              <FormControl>
                <FormLabel>Related learning path (optional)</FormLabel>
                <Select placeholder="Select a learning path">
                  <option value="python">Python for Data Science</option>
                  <option value="ux">UX Research Fundamentals</option>
                  <option value="agile">Agile Product Management</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="primary" leftIcon={<CheckCircleIcon />}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default CommunityPage; 