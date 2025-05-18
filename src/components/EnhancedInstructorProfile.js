import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Progress,
  Tag,
  TagLabel,
  Tooltip,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiAward,
  FiStar,
  FiUsers,
  FiBookOpen,
  FiTrendingUp,
  FiCheckCircle,
  FiMessageCircle,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiTwitter,
} from 'react-icons/fi';

const TeachingStyle = ({ style, score }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box p={4} bg={bgColor} borderRadius="lg">
      <Text fontWeight="medium" mb={2}>{style}</Text>
      <Progress 
        value={score} 
        size="sm" 
        colorScheme="purple" 
        borderRadius="full"
      />
      <Text fontSize="sm" mt={1} color="gray.600">
        {score}% match
      </Text>
    </Box>
  );
};

const Testimonial = ({ student, content, course, rating }) => {
  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack>
            <Avatar size="sm" name={student} />
            <Box>
              <Text fontWeight="medium">{student}</Text>
              <Text fontSize="sm" color="gray.600">
                Student in {course}
              </Text>
            </Box>
          </HStack>
          
          <Text fontSize="sm" fontStyle="italic">
            "{content}"
          </Text>
          
          <HStack>
            {Array.from({ length: rating }).map((_, i) => (
              <FiStar key={i} color="#805AD5" />
            ))}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const Achievement = ({ title, description, date, icon }) => {
  return (
    <HStack spacing={4} p={4} borderWidth="1px" borderRadius="lg">
      <Box
        p={2}
        borderRadius="full"
        bg="purple.100"
        color="purple.500"
      >
        {icon}
      </Box>
      
      <Box>
        <Text fontWeight="medium">{title}</Text>
        <Text fontSize="sm" color="gray.600">{description}</Text>
        <Text fontSize="xs" color="gray.500">{date}</Text>
      </Box>
    </HStack>
  );
};

const EnhancedInstructorProfile = ({ instructor }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Mock data
  const teachingStyles = [
    { style: 'Interactive & Engaging', score: 95 },
    { style: 'Project-Based Learning', score: 88 },
    { style: 'Clear Communication', score: 92 },
    { style: 'Practical Application', score: 85 },
  ];

  const testimonials = [
    {
      student: 'John Doe',
      content: 'An exceptional instructor who makes complex topics easy to understand.',
      course: 'Advanced React Development',
      rating: 5,
    },
    {
      student: 'Jane Smith',
      content: 'The hands-on projects really helped cement the concepts.',
      course: 'Web Development Fundamentals',
      rating: 5,
    },
  ];

  const achievements = [
    {
      title: 'Top Rated Instructor',
      description: 'Maintained 4.8+ rating for 6 months',
      date: 'March 2024',
      icon: <FiAward size={20} />,
    },
    {
      title: '1000+ Students Milestone',
      description: 'Reached 1000 enrolled students',
      date: 'February 2024',
      icon: <FiUsers size={20} />,
    },
    {
      title: 'Course Excellence Award',
      description: 'Recognized for outstanding course quality',
      date: 'January 2024',
      icon: <FiStar size={20} />,
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
        {/* Left Column - Profile Info */}
        <VStack spacing={6} align="stretch">
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4} align="center">
                <Avatar 
                  size="2xl" 
                  src={instructor.avatar} 
                  name={instructor.name}
                />
                <Box textAlign="center">
                  <Heading size="lg">{instructor.name}</Heading>
                  <Text color="gray.600">{instructor.title}</Text>
                </Box>
                
                <HStack>
                  <IconButton
                    icon={<FiGlobe />}
                    aria-label="Website"
                    variant="ghost"
                    colorScheme="purple"
                  />
                  <IconButton
                    icon={<FiLinkedin />}
                    aria-label="LinkedIn"
                    variant="ghost"
                    colorScheme="purple"
                  />
                  <IconButton
                    icon={<FiGithub />}
                    aria-label="GitHub"
                    variant="ghost"
                    colorScheme="purple"
                  />
                  <IconButton
                    icon={<FiTwitter />}
                    aria-label="Twitter"
                    variant="ghost"
                    colorScheme="purple"
                  />
                </HStack>
                
                <Button 
                  leftIcon={<FiEdit2 />} 
                  colorScheme="purple" 
                  variant="outline"
                  width="full"
                >
                  Edit Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Teaching Style</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                {teachingStyles.map((style, index) => (
                  <TeachingStyle
                    key={index}
                    style={style.style}
                    score={style.score}
                  />
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Expertise</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} spacing={2}>
                {['React', 'JavaScript', 'Node.js', 'TypeScript', 'GraphQL', 'AWS'].map((skill) => (
                  <Tag
                    key={skill}
                    size="lg"
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="purple"
                  >
                    <TagLabel>{skill}</TagLabel>
                  </Tag>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column - Content */}
        <VStack spacing={6} align="stretch">
          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Students</StatLabel>
                  <StatNumber>1,234</StatNumber>
                  <StatHelpText>
                    <FiTrendingUp /> Growing steadily
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Active Courses</StatLabel>
                  <StatNumber>8</StatNumber>
                  <StatHelpText>
                    <FiBookOpen /> Published
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Avg. Rating</StatLabel>
                  <StatNumber>4.8</StatNumber>
                  <StatHelpText>
                    <FiStar /> From 450+ reviews
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Completion Rate</StatLabel>
                  <StatNumber>85%</StatNumber>
                  <StatHelpText>
                    <FiCheckCircle /> Above average
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs Content */}
          <Card bg={cardBg}>
            <CardBody>
              <Tabs 
                variant="enclosed" 
                colorScheme="purple" 
                index={activeTab} 
                onChange={setActiveTab}
              >
                <TabList>
                  <Tab>About</Tab>
                  <Tab>Achievements</Tab>
                  <Tab>Testimonials</Tab>
                  <Tab>Teaching History</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Text>{instructor.bio}</Text>
                      
                      <Box>
                        <Heading size="sm" mb={2}>Teaching Philosophy</Heading>
                        <Text>
                          I believe in hands-on, project-based learning that 
                          emphasizes practical skills and real-world applications.
                        </Text>
                      </Box>
                      
                      <Box>
                        <Heading size="sm" mb={2}>Education & Certifications</Heading>
                        <List spacing={2}>
                          <ListItem>
                            <ListIcon as={FiCheckCircle} color="green.500" />
                            Master's in Computer Science, Stanford University
                          </ListItem>
                          <ListItem>
                            <ListIcon as={FiCheckCircle} color="green.500" />
                            AWS Certified Solutions Architect
                          </ListItem>
                        </List>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {achievements.map((achievement, index) => (
                        <Achievement key={index} {...achievement} />
                      ))}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {testimonials.map((testimonial, index) => (
                        <Testimonial key={index} {...testimonial} />
                      ))}
                    </SimpleGrid>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {instructor.courses?.map((course, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Heading size="sm">{course.title}</Heading>
                                <Text fontSize="sm" color="gray.600">
                                  {course.students} students enrolled
                                </Text>
                              </VStack>
                              <Badge colorScheme="green">
                                {course.rating} ★
                              </Badge>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Container>
  );
};

export default EnhancedInstructorProfile; 