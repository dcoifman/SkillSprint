import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Image,
  Divider,
  List,
  ListItem,
  ListIcon,
  chakra,
  Badge,
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  CheckCircleIcon, 
  TimeIcon, 
  StarIcon, 
  InfoOutlineIcon, 
  RepeatIcon, 
  ChatIcon, 
  BellIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons';

function HowItWorksPage() {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionBg = useColorModeValue('white', 'gray.800');
  const altSectionBg = useColorModeValue('gray.50', 'gray.900');
  const accentBg = useColorModeValue('primary.50', 'primary.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pillColor = useColorModeValue('primary.100', 'primary.800');
  const highlightText = useColorModeValue('primary.500', 'primary.300');
  const quoteBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={sectionBg} pt={20} pb={12}>
        <Container maxW="7xl">
          <Stack direction={{ base: 'column', lg: 'row' }} spacing={12} align="center">
            <Box maxW={{ base: 'full', lg: '50%' }}>
              <Badge colorScheme="primary" fontSize="sm" mb={4} borderRadius="full" px={3} py={1}>
                Our Learning Approach
              </Badge>
              <Heading 
                as="h1" 
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                mb={6}
                lineHeight="1.2"
              >
                Master skills faster with 
                <Text as="span" color="primary.500"> adaptive micro-learning</Text>
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.500" mb={8}>
                SkillSprint's innovative approach combines cutting-edge AI technology with proven 
                learning science to help you master new skills quickly and effectively, 
                all in bite-sized sessions that fit into your busy schedule.
              </Text>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/signup"
                  size="lg"
                  colorScheme="primary"
                  rightIcon={<ArrowForwardIcon />}
                  px={8}
                  py={7}
                  fontWeight="bold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  Start Learning Free
                </Button>
                <Button
                  as="a"
                  href="#how-it-works"
                  size="lg"
                  variant="outline"
                  colorScheme="primary"
                  px={8}
                  py={7}
                >
                  Learn More
                </Button>
              </Stack>
            </Box>
            <Flex flex={1} justify="center">
              <Image
                src="https://images.unsplash.com/photo-1573495627361-d9b87960b12d?q=80&w=2069"
                alt="Person learning on device"
                borderRadius="xl"
                objectFit="cover"
                boxShadow="2xl"
                width="100%"
                height="400px"
              />
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* What is Micro-Learning Section */}
      <Box bg={altSectionBg} py={20}>
        <Container maxW="7xl">
          <VStack spacing={12} align="stretch">
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }}>
                What is Micro-Learning?
              </Heading>
              <Text maxW="3xl" fontSize={{ base: 'md', md: 'lg' }} color="gray.500">
                Micro-learning breaks down complex topics into digestible, bite-sized sessions designed for maximum retention and engagement.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={8}>
              <FeatureCard 
                icon={<TimeIcon boxSize={10} />}
                title="Short, Focused Sessions"
                description="5-15 minute learning sprints that target specific skills and concepts, perfect for busy schedules."
                accentBg={accentBg}
              />
              <FeatureCard 
                icon={<RepeatIcon boxSize={10} />}
                title="Spaced Repetition"
                description="Strategic review intervals based on cognitive science to maximize long-term memory retention."
                accentBg={accentBg}
              />
              <FeatureCard 
                icon={<StarIcon boxSize={10} />}
                title="Active Learning"
                description="Interactive exercises, quizzes, and practical applications that reinforce concepts through active engagement."
                accentBg={accentBg}
              />
            </SimpleGrid>

            <Box mt={12} p={8} bg={quoteBg} borderRadius="xl" borderLeft="4px solid" borderColor="primary.500">
              <Text fontSize={{ base: 'md', md: 'lg' }} fontStyle="italic">
                "Research shows that micro-learning can improve focus by 
                <Text as="span" fontWeight="bold" color={highlightText}> up to 80%</Text> and 
                increase knowledge retention by 
                <Text as="span" fontWeight="bold" color={highlightText}> up to 20%</Text> compared 
                to traditional learning methods."
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* AI-Powered Adaptive Learning Section */}
      <Box bg={sectionBg} py={20} id="how-it-works">
        <Container maxW="7xl">
          <Stack direction={{ base: 'column', lg: 'row' }} spacing={12} align="center">
            <Box flex={1} order={{ base: 2, lg: 1 }}>
              <Badge colorScheme="purple" fontSize="sm" mb={4} borderRadius="full" px={3} py={1}>
                AI-Powered Learning
              </Badge>
              <Heading 
                as="h2" 
                fontSize={{ base: '2xl', md: '3xl' }}
                mb={6}
              >
                Personalized Learning That Adapts to You
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.500" mb={6}>
                Our sophisticated AI engine continuously analyzes your performance, learning style, and progress to create a completely personalized learning experience.
              </Text>
              
              <List spacing={4} mt={6}>
                <ListItem>
                  <HStack align="flex-start">
                    <Box as={CheckCircleIcon} color="green.500" mt={1} />
                    <Box>
                      <Text fontWeight="bold">Personalized Learning Paths</Text>
                      <Text color="gray.500">
                        Our AI identifies your skill gaps and creates custom learning pathways tailored to your goals.
                      </Text>
                    </Box>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="flex-start">
                    <Box as={CheckCircleIcon} color="green.500" mt={1} />
                    <Box>
                      <Text fontWeight="bold">Adaptive Difficulty</Text>
                      <Text color="gray.500">
                        Content automatically adjusts in complexity based on your performance, keeping you in the optimal learning zone.
                      </Text>
                    </Box>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="flex-start">
                    <Box as={CheckCircleIcon} color="green.500" mt={1} />
                    <Box>
                      <Text fontWeight="bold">Smart Review Scheduling</Text>
                      <Text color="gray.500">
                        AI-powered algorithms determine when you need to review concepts to ensure long-term retention.
                      </Text>
                    </Box>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="flex-start">
                    <Box as={CheckCircleIcon} color="green.500" mt={1} />
                    <Box>
                      <Text fontWeight="bold">Learning Style Adaptation</Text>
                      <Text color="gray.500">
                        Content delivery adapts to your preferred learning style—visual, auditory, reading/writing, or kinesthetic.
                      </Text>
                    </Box>
                  </HStack>
                </ListItem>
              </List>
            </Box>
            <Flex 
              flex={1} 
              justify="center" 
              align="center"
              order={{ base: 1, lg: 2 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1647585611385-615e098286b6?q=80&w=3570&auto=format&fit=crop"
                alt="AI Adaptive Learning"
                borderRadius="xl"
                objectFit="cover"
                boxShadow="xl"
                width="100%"
                height="400px"
              />
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* The Learning Process Section */}
      <Box bg={altSectionBg} py={20}>
        <Container maxW="7xl">
          <VStack spacing={10} textAlign="center" mb={16}>
            <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }}>
              The SkillSprint Learning Process
            </Heading>
            <Text maxW="3xl" fontSize={{ base: 'md', md: 'lg' }} color="gray.500">
              Our proven learning methodology is designed to take you from novice to master through a structured, engaging process.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 10, md: 8 }} mb={16}>
            <ProcessStep
              number="01"
              title="Assessment"
              description="Quick diagnostic tests identify your current knowledge level and learning goals."
              iconColor="blue.500"
            />
            <ProcessStep
              number="02"
              title="Personalization"
              description="AI creates a tailored learning path based on your goals, schedule, and existing skills."
              iconColor="purple.500"
            />
            <ProcessStep
              number="03"
              title="Daily Sprints"
              description="Complete focused, bite-sized learning sessions that adapt to your progress."
              iconColor="primary.500"
            />
            <ProcessStep
              number="04"
              title="Application"
              description="Apply your knowledge through practical exercises and real-world scenarios."
              iconColor="green.500"
            />
          </SimpleGrid>

          <Flex 
            bg="primary.500" 
            color="white" 
            p={8} 
            borderRadius="xl" 
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            boxShadow="lg"
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing={4} mb={{ base: 6, md: 0 }}>
              <Heading size="lg">Ready to experience adaptive learning?</Heading>
              <Text fontSize="lg">Join thousands of learners building valuable skills with SkillSprint.</Text>
            </VStack>
            <Button 
              as={RouterLink}
              to="/signup"
              size="lg"
              colorScheme="white"
              color="primary.500"
              px={8}
              py={7}
              fontWeight="bold"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Get Started Free
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Features and Benefits Section */}
      <Box bg={sectionBg} py={20}>
        <Container maxW="7xl">
          <VStack spacing={10} textAlign="center" mb={16}>
            <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }}>
              Features and Benefits
            </Heading>
            <Text maxW="3xl" fontSize={{ base: 'md', md: 'lg' }} color="gray.500">
              SkillSprint combines cutting-edge technology with proven learning methods to deliver an unmatched educational experience.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
            <BenefitCard
              icon={<ChatIcon boxSize={6} />}
              title="24/7 AI Tutor"
              description="Get instant explanations and answers to your questions from our AI tutor at any time."
              accentColor="blue.500"
              borderColor={borderColor}
            />
            <BenefitCard
              icon={<StarIcon boxSize={6} />}
              title="Interactive Content"
              description="Engage with dynamic 3D models, interactive exercises, and multimedia learning materials."
              accentColor="purple.500"
              borderColor={borderColor}
            />
            <BenefitCard
              icon={<InfoOutlineIcon boxSize={6} />}
              title="Comprehensive Analytics"
              description="Track your progress with detailed analytics showing skill development and knowledge mastery."
              accentColor="green.500"
              borderColor={borderColor}
            />
            <BenefitCard
              icon={<RepeatIcon boxSize={6} />}
              title="Spaced Repetition"
              description="Scientifically optimized review schedules ensure long-term retention of what you learn."
              accentColor="orange.500"
              borderColor={borderColor}
            />
            <BenefitCard
              icon={<BellIcon boxSize={6} />}
              title="Smart Notifications"
              description="Gentle reminders and progress alerts keep you on track toward your learning goals."
              accentColor="red.500"
              borderColor={borderColor}
            />
            <BenefitCard
              icon={<CheckCircleIcon boxSize={6} />}
              title="Skill Certification"
              description="Earn verifiable certificates as you achieve mastery in specific skill areas."
              accentColor="teal.500"
              borderColor={borderColor}
            />
          </SimpleGrid>

          <Box mt={16} p={8} bg={pillColor} borderRadius="xl">
            <VStack spacing={4} textAlign="center">
              <Heading as="h3" size="lg">
                Our Approach Works
              </Heading>
              <Text fontSize="xl" fontWeight="medium">
                Users who learn with SkillSprint achieve:
              </Text>
              <HStack spacing={{ base: 4, md: 10 }} justify="center" wrap="wrap">
                <Stat number="87%" label="Completion Rate" />
                <Stat number="65%" label="Faster Skill Acquisition" />
                <Stat number="92%" label="Reported Satisfaction" />
              </HStack>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* FAQs Section */}
      <Box bg={altSectionBg} py={20}>
        <Container maxW="4xl">
          <VStack spacing={10} textAlign="center" mb={12}>
            <Heading as="h2" fontSize={{ base: '2xl', md: '3xl' }}>
              Frequently Asked Questions
            </Heading>
            <Text maxW="3xl" fontSize={{ base: 'md', md: 'lg' }} color="gray.500">
              Got questions about SkillSprint? Here are answers to some common inquiries.
            </Text>
          </VStack>

          <VStack spacing={6} align="stretch" mt={8}>
            <FaqItem
              question="How much time do I need to commit each day?"
              answer="SkillSprint works with your schedule. Our micro-learning sessions typically take 5-15 minutes to complete, making it easy to fit learning into even the busiest days. Our AI will recommend an optimal study schedule based on your goals and availability."
            />
            <FaqItem
              question="What subjects and skills can I learn on SkillSprint?"
              answer="SkillSprint offers a wide range of subjects from professional skills like programming, data science, and business management to personal development areas like language learning, creative skills, and health & wellness. New content is added regularly based on user requests and trending topics."
            />
            <FaqItem
              question="How does the AI personalization actually work?"
              answer="Our AI analyzes multiple data points including your learning goals, performance on assessments, engagement patterns, and learning preferences. It uses this information to customize the content difficulty, presentation style, review frequency, and learning path progression to optimize your learning outcomes."
            />
            <FaqItem
              question="Are the certificates recognized by employers?"
              answer="SkillSprint certificates verify your demonstrated skill proficiency through our comprehensive assessment system. Many employers recognize these certificates as evidence of practical skill mastery. We also partner with industry leaders and educational institutions to enhance the credibility of our certification program."
            />
            <FaqItem
              question="Can I access SkillSprint on multiple devices?"
              answer="Absolutely! SkillSprint is fully accessible across all your devices, including smartphones, tablets, and computers. Your progress automatically syncs across devices, and you can even download content for offline learning when you don't have internet access."
            />
          </VStack>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box bg="primary.500" py={16} color="white">
        <Container maxW="7xl" textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Start your learning journey today
          </Heading>
          <Text fontSize="lg" mb={10} maxW="2xl" mx="auto">
            Join thousands of learners who are mastering new skills faster and more effectively with SkillSprint's adaptive micro-learning approach.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
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
              transition="all 0.2s"
            >
              Create Free Account
            </Button>
            <Button
              as={RouterLink}
              to="/explore"
              size="lg"
              variant="outline"
              colorScheme="white"
              borderWidth="2px"
              _hover={{
                bg: 'whiteAlpha.200',
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              px={8}
              py={7}
              fontSize="md"
              fontWeight="bold"
              transition="all 0.2s"
            >
              Explore Learning Paths
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description, accentBg }) => {
  return (
    <VStack
      align="center"
      p={8}
      borderRadius="xl"
      bg={accentBg}
      opacity="0.95"
      boxShadow="md"
      spacing={4}
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl'
      }}
    >
      <Box color="primary.500">{icon}</Box>
      <Heading as="h3" size="md" mb={2}>
        {title}
      </Heading>
      <Text>{description}</Text>
    </VStack>
  );
};

// Process Step Component
const ProcessStep = ({ number, title, description, iconColor }) => {
  return (
    <VStack align="center" spacing={4}>
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg={iconColor}
        fontSize="xl"
        fontWeight="bold"
        mb={2}
      >
        {number}
      </Flex>
      <Heading as="h3" size="md" textAlign="center">
        {title}
      </Heading>
      <Text textAlign="center" color="gray.500">
        {description}
      </Text>
    </VStack>
  );
};

// Benefit Card Component
const BenefitCard = ({ icon, title, description, accentColor, borderColor }) => {
  return (
    <Box
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="md"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl'
      }}
    >
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg={accentColor}
        mb={4}
      >
        {icon}
      </Flex>
      <Heading as="h3" size="md" mb={3}>
        {title}
      </Heading>
      <Text color="gray.500">
        {description}
      </Text>
    </Box>
  );
};

// Stat Component
const Stat = ({ number, label }) => {
  return (
    <VStack spacing={0} p={4}>
      <Text fontSize="3xl" fontWeight="bold" color="primary.500">
        {number}
      </Text>
      <Text color="gray.600" fontWeight="medium">
        {label}
      </Text>
    </VStack>
  );
};

// FAQ Item Component
const FaqItem = ({ question, answer }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box as="button" textAlign="left" width="100%" p={4}>
        <HStack justify="space-between">
          <Heading as="h3" size="md">
            {question}
          </Heading>
          <Icon as={ChevronRightIcon} boxSize={6} />
        </HStack>
      </Box>
      <Divider />
      <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
        <Text color="gray.600">{answer}</Text>
      </Box>
    </Box>
  );
};

export default HowItWorksPage; 