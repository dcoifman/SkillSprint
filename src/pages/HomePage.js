import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  chakra,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ChevronRightIcon, StarIcon, ChatIcon, TimeIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { fetchLearningPaths } from '../services/supabaseClient';
import CourseCarousel from '../components/CourseCarousel';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0.4);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(98, 0, 234, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0);
  }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

function HomePage() {
  const pulseAnimation = `${pulse} 2s infinite`;
  const heroBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await fetchLearningPaths({});
        if (error) {
          console.error('Error loading courses:', error);
        } else {
          setCourses(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={heroBg} py={{ base: 10, md: 0 }}>
        <Container maxW={'7xl'} minH={{base: "auto", md: "80vh"}} display="flex" alignItems="center" pt={{ base: 10, md: 0 }}>
          <Stack
            direction={{ base: 'column', lg: 'row' }}
            spacing={{ base: 10, lg: 20 }}
            align="center"
            w="full"
          >
            <Stack
              flex={1}
              spacing={{ base: 5, md: 10 }}
              py={{ base: 5, md: 20 }}
            >
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
              >
                <Text
                  as={'span'}
                  position={'relative'}
                  _after={{
                    content: "''",
                    width: 'full',
                    height: '20%',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    bg: useColorModeValue('secondary.100', 'secondary.700'),
                    zIndex: -1,
                  }}>
                  Short bursts.
                </Text>
                <br />
                <Text as={'span'} color={'primary.600'}>
                  Big skills.
                </Text>
              </Heading>
              <Text color={'gray.500'} fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} maxW="600px">
                Master any skill with personalized, AI-powered adaptive micro-learning.
                SkillSprint delivers concise sessions tailored to your learning style and goals.
              </Text>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: 'column', sm: 'row' }}
              >
                <Button
                  size={'lg'}
                  fontWeight={'extrabold'}
                  fontSize={'xl'}
                  px={8}
                  py={7}
                  as={RouterLink}
                  to="/signup"
                  borderRadius="full"
                  bgGradient="linear(to-r, primary.500, secondary.500)"
                  color="white"
                  boxShadow="0 4px 24px 0 rgba(98, 0, 234, 0.25)"
                  rightIcon={<CheckCircleIcon boxSize={6} />}
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 32px 0 rgba(98, 0, 234, 0.35)',
                    bgGradient: 'linear(to-r, primary.600, secondary.400)',
                  }}
                  _active={{
                    transform: 'scale(0.98)',
                  }}
                  transition="all 0.2s"
                >
                  Start Learning Free
                </Button>
                <Button
                  as={RouterLink}
                  to="/how-it-works"
                  size={'lg'}
                  fontWeight={'bold'}
                  variant={'outline'}
                  colorScheme={'primary'}
                  leftIcon={<Icon boxSize={5} viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                    />
                  </Icon>}
                      >
                  Learn More
                </Button>
              </Stack>
              
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">Trusted by:</Text>
                <Image
                  src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069"
                  boxSize="30px"
                  borderRadius="full"
                  objectFit="cover"
                  alt="Company A"
                          />
                <Image
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073"
                  boxSize="30px"
                  borderRadius="full"
                  objectFit="cover"
                  alt="Company B"
                />
                <Image
                  src="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=2673"
                  boxSize="30px"
                  borderRadius="full"
                  objectFit="cover"
                  alt="Company C"
                          />
                <Text fontSize="sm" color="gray.500">+ 10,000 professionals</Text>
              </HStack>
            </Stack>
            <Flex
              flex={1}
              justify={'center'}
              align={'center'}
              position={'relative'}
              w={'full'}
              display={{ base: 'none', lg: 'flex' }}
            >
              <Box
                position={'relative'}
                height={'550px'}
                width={'full'}
                overflow={'hidden'}
                borderRadius={'2xl'}
                boxShadow={'2xl'}
              >
                <Image
                  alt={'Hero Image'}
                  fit={'cover'}
                  align={'center'}
                  w={'100%'}
                  h={'100%'}
                  src={'https://images.unsplash.com/photo-1522881193457-37ae97c905bf?q=80&w=2070'}
                  fallbackSrc="https://placehold.co/800x600/e2e8f0/1a202c?text=SkillSprint"
                />
                <Box
                  position="absolute"
                  bottom="20px"
                  left="20px"
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  boxShadow="lg"
                  width="60%"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontWeight="bold" mb={2}>
                    Machine Learning Fundamentals
                  </Text>
                  <HStack mb={2}>
                    <Badge colorScheme="purple">12 min</Badge>
                    <Badge colorScheme="green">Beginner</Badge>
                  </HStack>
                  <Box height="6px" bg="gray.100" borderRadius="full" mb={2}>
                    <Box height="6px" width="60%" bg="primary.500" borderRadius="full" />
                  </Box>
                  <Text fontSize="sm" color="gray.500">
                    60% Complete
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
        <Container maxW={'7xl'}>
          <Heading
            textAlign="center"
            fontSize={{ base: '2xl', sm: '4xl' }}
            fontWeight="bold"
            mb={8}
          >
            Featured Courses
          </Heading>
          {isLoading ? (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="primary.500" />
            </Flex>
          ) : (
            <CourseCarousel courses={courses} />
          )}
        </Container>
      </Box>

      {/* Stats Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
            <VStack bg={cardBg} p={6} borderRadius="lg" boxShadow="md" spacing={2} 
                    transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                1M+
              </Text>
              <Text fontWeight="medium">Active Learners</Text>
            </VStack>
            <VStack bg={cardBg} p={6} borderRadius="lg" boxShadow="md" spacing={2}
                    transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                5K+
              </Text>
              <Text fontWeight="medium">Learning Paths</Text>
            </VStack>
            <VStack bg={cardBg} p={6} borderRadius="lg" boxShadow="md" spacing={2}
                    transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                15M+
              </Text>
              <Text fontWeight="medium">Sprints Completed</Text>
                            </VStack>
            <VStack bg={cardBg} p={6} borderRadius="lg" boxShadow="md" spacing={2}
                    transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                93%
                </Text>
              <Text fontWeight="medium">Completion Rate</Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20}>
        <Container maxW={'7xl'}>
          <Box mb={20} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              Everything you need to master new skills
            </chakra.h2>
            <Text 
              color={'gray.500'} 
              maxW={'3xl'} 
              mx={'auto'}
            >
              Our AI-powered platform adapts to your learning style, delivering personalized micro-lessons 
              that fit perfectly into your busy schedule.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
            <Feature
              icon={'🚀'}
              title={'Adaptive Micro-Learning'}
              text={'Short, engaging 5-15 minute sessions that adapt to your skill level in real-time.'}
                />
            <Feature
              icon={'🧠'}
              title={'AI-Curated Pathways'}
              text={'Personalized learning roadmaps based on your goals, existing skills, and learning style.'}
                />
            <Feature
              icon={'💬'}
              title={'24/7 AI Tutor'}
              text={'Get answers, explanations, and guidance from your personal AI tutor anytime.'}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
            <Feature
              icon={'🔄'}
              title={'Spaced Repetition'}
              text={'Automatically scheduled review sessions at optimal intervals for maximum retention.'}
                />
            <Feature
              icon={'📊'}
              title={'Progress Tracking'}
              text={'Comprehensive visual analytics that track your skill mastery and identify areas for improvement.'}
                />
            <Feature
              icon={'📱'}
              title={'Cross-Platform Access'}
              text={'Seamless learning across all your devices, with offline mode for on-the-go learning.'}
                />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW={'7xl'}>
          <Box mb={16} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              How SkillSprint Works
            </chakra.h2>
            <Text 
              color={'gray.500'} 
              maxW={'3xl'} 
              mx={'auto'}
            >
              Our proven learning methodology helps you build skills faster and retain knowledge longer.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 10, md: 20 }}>
            <HowItWorksStep 
              number={1}
              title="Set your learning goals"
              description="Tell us what you want to learn, and our AI will design a personalized learning path just for you."
            />
            <HowItWorksStep 
              number={2}
              title="Complete daily sprints"
              description="Short, focused learning sessions that adapt to your progress and keep you engaged."
            />
            <HowItWorksStep 
              number={3}
              title="Master new skills"
              description="Track your progress, earn certificates, and apply your new skills in real-world scenarios."
            />
          </SimpleGrid>

          <Box textAlign="center" mt={16}>
            <Button
              as={RouterLink}
              to="/signup"
              size="lg"
              colorScheme="primary"
              rightIcon={<ChevronRightIcon />}
            >
              Start Your Learning Journey
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Community Spotlight Section - NEW SECTION */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20}>
        <Container maxW={'7xl'}>
          <Box mb={16} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              Community Spotlight
            </chakra.h2>
            <Text 
              color={'gray.500'} 
              maxW={'3xl'} 
              mx={'auto'}
            >
              Join thousands of learners sharing knowledge, celebrating wins, and supporting each other.
            </Text>
          </Box>

          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={8}>
            {/* Community Card 1 */}
            <GridItem>
              <Card borderRadius="lg" overflow="hidden" boxShadow="md" borderWidth="1px" 
                    borderColor={borderColor} height="100%">
                <CardBody p={0}>
                  <Box bg="purple.50" p={4}>
                    <HStack>
                      <Avatar 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974" 
                        name="Sarah Johnson" 
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">Sarah Johnson</Text>
                        <Text fontSize="sm" color="gray.500">Data Scientist</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box p={5}>
                    <Text fontSize="md" mb={4}>
                      "Just completed the Advanced SQL Learning Path! The bite-sized sprints made it so easy to fit learning into my busy schedule. Now applying these skills to optimize our customer database."
                    </Text>
                    <HStack>
                      <Badge colorScheme="green">SQL</Badge>
                      <Badge colorScheme="purple">Data</Badge>
                    </HStack>
                  </Box>
                </CardBody>
                <CardFooter bg="gray.50" p={4}>
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <Tooltip label="42 likes">
                        <IconButton 
                          aria-label="Like" 
                          icon={<StarIcon />} 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="purple"
                        />
                      </Tooltip>
                      <Text fontSize="sm">42</Text>
                    </HStack>
                    <HStack>
                      <Tooltip label="18 comments">
                        <IconButton 
                          aria-label="Comment" 
                          icon={<ChatIcon />} 
                          size="sm" 
                          variant="ghost"
                          colorScheme="purple"
                        />
                      </Tooltip>
                      <Text fontSize="sm">18</Text>
                    </HStack>
                    <HStack>
                      <TimeIcon color="gray.400" />
                      <Text fontSize="sm" color="gray.500">2 days ago</Text>
                    </HStack>
                  </HStack>
                </CardFooter>
              </Card>
            </GridItem>

            {/* Community Card 2 */}
            <GridItem>
              <Card borderRadius="lg" overflow="hidden" boxShadow="md" borderWidth="1px" 
                    borderColor={borderColor} height="100%">
                <CardBody p={0}>
                  <Box bg="blue.50" p={4}>
                    <HStack>
                      <Avatar 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974" 
                        name="Michael Chen" 
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">Michael Chen</Text>
                        <Text fontSize="sm" color="gray.500">UX Designer</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box p={5}>
                    <Text fontSize="md" mb={4}>
                      "The UX Research learning path completely changed how I approach user interviews. I've created a resource guide for our team based on what I learned in the sprints."
                    </Text>
                    <HStack>
                      <Badge colorScheme="blue">UX</Badge>
                      <Badge colorScheme="orange">Research</Badge>
                    </HStack>
                  </Box>
                </CardBody>
                <CardFooter bg="gray.50" p={4}>
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <Tooltip label="36 likes">
                        <IconButton 
                          aria-label="Like" 
                          icon={<StarIcon />} 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="blue"
                        />
                      </Tooltip>
                      <Text fontSize="sm">36</Text>
                    </HStack>
                    <HStack>
                      <Tooltip label="14 comments">
                        <IconButton 
                          aria-label="Comment" 
                          icon={<ChatIcon />} 
                          size="sm" 
                          variant="ghost"
                          colorScheme="blue"
                        />
                      </Tooltip>
                      <Text fontSize="sm">14</Text>
                    </HStack>
                    <HStack>
                      <TimeIcon color="gray.400" />
                      <Text fontSize="sm" color="gray.500">5 days ago</Text>
                    </HStack>
                  </HStack>
                </CardFooter>
              </Card>
            </GridItem>

            {/* Community Card 3 */}
            <GridItem>
              <Card borderRadius="lg" overflow="hidden" boxShadow="md" borderWidth="1px" 
                    borderColor={borderColor} height="100%">
                <CardBody p={0}>
                  <Box bg="green.50" p={4}>
                    <HStack>
                      <Avatar 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974" 
                        name="James Wilson" 
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">James Wilson</Text>
                        <Text fontSize="sm" color="gray.500">Product Manager</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box p={5}>
                    <Text fontSize="md" mb={4}>
                      "After completing the 'Agile Product Management' path, I reorganized our entire workflow. Our team's velocity increased by 40% in just one sprint!"
                    </Text>
                    <HStack>
                      <Badge colorScheme="green">Agile</Badge>
                      <Badge colorScheme="teal">Management</Badge>
                    </HStack>
                  </Box>
                </CardBody>
                <CardFooter bg="gray.50" p={4}>
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <Tooltip label="58 likes">
                        <IconButton 
                          aria-label="Like" 
                          icon={<StarIcon />} 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="green"
                        />
                      </Tooltip>
                      <Text fontSize="sm">58</Text>
                    </HStack>
                    <HStack>
                      <Tooltip label="24 comments">
                        <IconButton 
                          aria-label="Comment" 
                          icon={<ChatIcon />} 
                          size="sm" 
                          variant="ghost"
                          colorScheme="green"
                        />
                      </Tooltip>
                      <Text fontSize="sm">24</Text>
                    </HStack>
                    <HStack>
                      <TimeIcon color="gray.400" />
                      <Text fontSize="sm" color="gray.500">1 week ago</Text>
                    </HStack>
                  </HStack>
                </CardFooter>
              </Card>
            </GridItem>
          </Grid>

          <Box textAlign="center" mt={10}>
            <Button
              as={RouterLink}
              to="/community"
              size="md"
              colorScheme="purple"
              variant="outline"
              rightIcon={<ChevronRightIcon />}
            >
              Join Our Community
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW={'7xl'}>
          <Box mb={16} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              What Our Learners Say
            </chakra.h2>
            <Text 
              color={'gray.500'} 
              maxW={'3xl'} 
              mx={'auto'}
            >
              Join thousands of satisfied learners who have transformed their skills with SkillSprint.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Testimonial 
              name="Samantha Lee"
              role="Marketing Specialist"
              content="The bite-sized learning approach is perfect for my busy schedule. I've learned more in 2 weeks with SkillSprint than in 2 months with traditional courses."
              avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070"
            />
            <Testimonial 
              name="David Rodriguez"
              role="Software Engineer"
              content="The AI tutor is incredible! It answered all my questions and helped me understand complex programming concepts better than any human instructor ever has."
              avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070"
            />
            <Testimonial 
              name="Alex Kumar"
              role="Product Manager"
              content="SkillSprint's personalized pathways helped me fill specific knowledge gaps for my new role. The analytics showed me exactly where to focus my efforts."
              avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg={useColorModeValue('primary.500', 'primary.600')} py={16} color="white">
        <Container maxW={'7xl'} textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to accelerate your learning?
          </Heading>
          <Text fontSize="lg" mb={10} maxW="2xl" mx="auto">
            Join SkillSprint today and start building valuable skills in just minutes a day.
            Our personalized approach ensures you'll learn efficiently and effectively.
          </Text>
          <Button
            as={RouterLink}
            to="/signup"
            size="lg"
            bg="white"
            color="primary.500"
            _hover={{
              bg: 'gray.100',
              transform: 'translateY(-2px)', 
              boxShadow: 'lg'
            }}
            px={8}
            py={7}
            fontSize="md"
            fontWeight="bold"
            leftIcon={<CheckCircleIcon />}
            transition="all 0.2s"
          >
            Start Learning for Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

const Feature = ({ title, text, icon }) => {
  return (
    <VStack
      align={'center'}
      p={8}
      borderWidth="1px"
      borderRadius="xl"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="base"
      transition="all 0.3s"
      _hover={{ 
        boxShadow: 'xl', 
        transform: 'translateY(-5px)', 
        borderColor: 'primary.300' 
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'primary.500'}
        mb={4}
      >
        <Text fontSize="3xl">{icon}</Text>
      </Flex>
      <Heading fontSize={'xl'} fontWeight={700} mb={2}>
        {title}
      </Heading>
      <Text textAlign={'center'} color={'gray.600'}>
        {text}
      </Text>
    </VStack>
  );
};

const HowItWorksStep = ({ number, title, description }) => {
  return (
    <VStack spacing={4} align="center">
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        fontWeight="bold"
        rounded="full"
        bg="primary.500"
        fontSize="xl"
      >
        {number}
      </Flex>
      <Heading fontSize="xl">{title}</Heading>
      <Text textAlign="center" color="gray.600">
        {description}
      </Text>
    </VStack>
  );
};

const Testimonial = ({ name, role, content, avatar }) => {
  return (
    <VStack
      spacing={4}
      p={8}
      borderWidth="1px"
      borderRadius="lg"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ 
        boxShadow: 'xl',
        transform: 'translateY(-5px)'
      }}
      align="start"
    >
      <Text fontSize="md" color="gray.600" fontStyle="italic">
        "{content}"
      </Text>
      <HStack spacing={4}>
        <Avatar src={avatar} name={name} size="md" />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">{name}</Text>
          <Text fontSize="sm" color="gray.500">{role}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default HomePage;