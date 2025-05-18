import React, { lazy, Suspense } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Image,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Flex,
  Badge,
  Spinner,
  chakra,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ChevronRightIcon, StarIcon, ChatIcon, TimeIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { fetchLearningPaths } from '../services/supabaseClient.js';
import CourseCarousel from '../components/CourseCarousel.js';
import LoadingSkeleton from '../components/LoadingSkeleton.js';
import { css } from '@emotion/react';

// Lazy load below-the-fold components
const CommunitySpotlight = lazy(() => import('../components/CommunitySpotlight.js'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection.js'));

// Add these animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(98, 0, 234, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(98, 0, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(98, 0, 234, 0); }
`;

// Loading spinner component
const LoadingSpinner = () => (
  <Flex justify="center" align="center" minH="400px">
    <Box
      width="50px"
      height="50px"
      borderRadius="full"
      border="3px solid"
      borderColor="transparent"
      borderTopColor="primary.500"
      animation="spin 1s linear infinite"
      sx={{
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }}
    />
  </Flex>
);

// Add this function at the top level of the file, before the HomePage component
const getImagePath = (path) => {
  // Ensure the path starts with a forward slash
  return path.startsWith('/') ? path : `/${path}`;
};

function HomePage() {
  const heroBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchLearningPaths({});
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      console.log('Fetched courses:', data);
      setCourses(data || []);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadCourses();
  };

  React.useEffect(() => {
    loadCourses();
  }, []);

  // Update the image rendering in the courses section
  const renderCourseImage = (course) => {
    return (
      <Image
        src={getImagePath(course.image)}
        alt={course.title}
        borderRadius="lg"
        width="100%"
        height="250px"
        objectFit="cover"
        fallbackSrc="https://placehold.co/500x300/e2e8f0/1a202c?text=No+Image"
      />
    );
  };

  return (
    <Box>
      <Helmet>
        <title>SkillSprint - Master Any Skill with AI-Powered Micro-Learning</title>
        <meta name="description" content="Master any skill with personalized, AI-powered adaptive micro-learning. SkillSprint delivers concise sessions tailored to your learning style and goals." />
        <meta property="og:title" content="SkillSprint - Master Any Skill with AI-Powered Micro-Learning" />
        <meta property="og:description" content="Master any skill with personalized, AI-powered adaptive micro-learning." />
      </Helmet>

      {/* Hero Section */}
      <Box 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        py={{ base: 10, md: 0 }} 
        as="section" 
        aria-label="Hero section"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: useColorModeValue(
            'linear(to-br, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            'linear(to-br, rgba(26,32,44,0.8), rgba(26,32,44,0.4))'
          ),
          backdropFilter: 'blur(10px)',
          zIndex: 0,
        }}
      >
        {/* Add decorative elements */}
        <Box
          position="absolute"
          top="-10%"
          right="-5%"
          width="300px"
          height="300px"
          borderRadius="full"
          bg="primary.500"
          filter="blur(80px)"
          opacity="0.2"
          animation={`${float} 6s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="-15%"
          left="-10%"
          width="400px"
          height="400px"
          borderRadius="full"
          bg="secondary.500"
          filter="blur(100px)"
          opacity="0.15"
          animation={`${float} 8s ease-in-out infinite`}
        />

        <Container maxW={'7xl'} minH={{base: "auto", md: "80vh"}} position="relative" zIndex={1}>
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
                as="h1"
                lineHeight={1.1}
                fontWeight={700}
                fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
                color={useColorModeValue('gray.900', 'white')}
              >
                <Text
                  as={'span'}
                  position={'relative'}
                  color={useColorModeValue('primary.700', 'primary.300')}
                  _after={{
                    content: "''",
                    width: 'full',
                    height: '20%',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    bg: useColorModeValue('primary.100', 'primary.900'),
                    zIndex: -1,
                  }}>
                  Short bursts.
                </Text>
                <br />
                <Text 
                  as={'span'} 
                  color={useColorModeValue('primary.700', 'primary.300')}
                >
                  Big skills.
                </Text>
              </Heading>

              {/* Call to Action Button with enhanced design */}
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: 'column', sm: 'row' }}
              >
                <Button
                  as={RouterLink}
                  to="/signup"
                  size="lg"
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight={700}
                  letterSpacing="0.02em"
                  px={8}
                  py={6}
                  bg={useColorModeValue('gray.900', 'white')}
                  color={useColorModeValue('white', 'gray.900')}
                  borderRadius="xl"
                  position="relative"
                  overflow="hidden"
                  boxShadow="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    bg: useColorModeValue('black', 'gray.100'),
                    boxShadow: 'xl',
                    _before: {
                      opacity: 0.4,
                    },
                  }}
                  _active={{
                    transform: 'scale(0.98)',
                    bg: useColorModeValue('gray.800', 'gray.200'),
                  }}
                  rightIcon={<CheckCircleIcon boxSize={5} />}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                    opacity: 0.3,
                    transition: 'opacity 0.2s',
                  }}
                >
                  Start Learning Free
                </Button>

                {/* Learn More button with glass effect */}
                <Button
                  as={RouterLink}
                  to="/how-it-works"
                  size="lg"
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight={600}
                  px={8}
                  bg={useColorModeValue('white', 'whiteAlpha.200')}
                  color={useColorModeValue('gray.800', 'white')}
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
                  borderRadius="xl"
                  _hover={{
                    bg: useColorModeValue('gray.50', 'whiteAlpha.300'),
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    transform: 'scale(0.98)',
                  }}
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

              {/* Trusted By section with enhanced design */}
              <Box
                bg={useColorModeValue('white', 'whiteAlpha.200')}
                borderRadius="2xl"
                p={4}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
              >
                <HStack spacing={4} aria-label="Trusted by companies">
                  <Text fontSize="sm" fontWeight={600} color={useColorModeValue('gray.700', 'white')}>
                    Trusted by:
                  </Text>
                  <HStack spacing={3}>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        position="relative"
                        width="40px"
                        height="40px"
                        borderRadius="full"
                        overflow="hidden"
                        boxShadow="md"
                        _hover={{
                          transform: 'scale(1.1)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Image
                          src={`/images/company-${i}-logo.webp`}
                          alt={`Company ${i} Logo`}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          loading="eager"
                        />
                      </Box>
                    ))}
                  </HStack>
                  <Text
                    fontSize="sm"
                    fontWeight={500}
                    color={useColorModeValue('gray.700', 'white')}
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={useColorModeValue('gray.100', 'whiteAlpha.200')}
                  >
                    +10,000 professionals
                  </Text>
                </HStack>
              </Box>
            </Stack>

            {/* Hero Image Card with enhanced design */}
            <Box
              flex={1}
              position="relative"
              display={{ base: 'block', lg: 'flex' }}
            >
              <Box
                position="relative"
                height={{ base: '300px', lg: '550px' }}
                width="full"
                overflow="hidden"
                borderRadius="3xl"
                bg={useColorModeValue('white', 'gray.800')}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                boxShadow="2xl"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: useColorModeValue(
                    'linear(to-br, whiteAlpha.900, whiteAlpha.700)',
                    'linear(to-br, gray.800, gray.900)'
                  ),
                  backdropFilter: 'blur(10px)',
                  zIndex: 0,
                }}
              >
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    srcSet="/images/hero-desktop.webp"
                  />
                  <source
                    media="(min-width: 640px)"
                    srcSet="/images/hero-tablet.webp"
                  />
                  <Image
                    alt="Student learning on SkillSprint platform"
                    fit="cover"
                    align="center"
                    w="100%"
                    h="100%"
                    src="/images/hero-mobile.webp"
                    loading="eager"
                    position="relative"
                    zIndex={1}
                  />
                </picture>

                {/* Progress Card with enhanced glass effect */}
                <Box
                  position="absolute"
                  bottom="20px"
                  left="20px"
                  width={{ base: '80%', lg: '60%' }}
                  bg={useColorModeValue('whiteAlpha.900', 'gray.800')}
                  backdropFilter="blur(16px)"
                  borderRadius="xl"
                  p={4}
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  boxShadow="xl"
                  zIndex={2}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'xl',
                    padding: '2px',
                    background: 'linear-gradient(45deg, primary.500, secondary.500)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                >
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">
                      Machine Learning Fundamentals
                    </Text>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme="purple"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={useColorModeValue('purple.100', 'purple.900')}
                        color={useColorModeValue('purple.700', 'purple.200')}
                      >
                        12 min
                      </Badge>
                      <Badge
                        colorScheme="green"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={useColorModeValue('green.100', 'green.900')}
                        color={useColorModeValue('green.700', 'green.200')}
                      >
                        Beginner
                      </Badge>
                    </HStack>
                    <Box width="full">
                      <Box
                        width="full"
                        height="8px"
                        bg={useColorModeValue('gray.100', 'gray.700')}
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box
                          height="full"
                          width="60%"
                          bgGradient="linear(to-r, primary.500, secondary.500)"
                          borderRadius="full"
                          animation={`${pulse} 2s infinite`}
                        />
                      </Box>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        60% Complete
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </Box>
            </Box>
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
            <LoadingSkeleton />
          ) : error ? (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Failed to Load Courses
              </AlertTitle>
              <AlertDescription maxWidth="sm" mb={4}>
                {error}
              </AlertDescription>
              <Button onClick={handleRetry} colorScheme="red" size="sm">
                Try Again
              </Button>
            </Alert>
          ) : courses.length === 0 ? (
            <Alert
              status="info"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                No Courses Available
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Check back soon for new courses!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {console.log('Rendering courses:', courses)}
              <CourseCarousel courses={courses} />
            </>
          )}
        </Container>
      </Box>

      {/* Stats Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12} position="relative" overflow="hidden">
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="50%"
          left="0"
          right="0"
          height="1px"
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="200px"
          bgGradient={useColorModeValue(
            'linear(to-b, whiteAlpha.300, transparent)',
            'linear(to-b, whiteAlpha.100, transparent)'
          )}
          pointerEvents="none"
        />

        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
            {[
              { number: '1M+', label: 'Active Learners', color: 'blue' },
              { number: '5K+', label: 'Learning Paths', color: 'purple' },
              { number: '15M+', label: 'Sprints Completed', color: 'green' },
              { number: '93%', label: 'Completion Rate', color: 'orange' }
            ].map((stat, index) => (
              <Box
                key={index}
                bg={useColorModeValue('white', 'gray.800')}
                p={6}
                borderRadius="xl"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bg: useColorModeValue(
                    `${stat.color}.50`,
                    `${stat.color}.900`
                  ),
                  opacity: 0.1,
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'xl',
                  border: '1px solid',
                  borderColor: useColorModeValue(
                    `${stat.color}.200`,
                    `${stat.color}.700`
                  ),
                }}
                transform="auto"
                _hover={{ translateY: -2 }}
                transition="all 0.3s"
              >
                <VStack spacing={2} position="relative" zIndex={1}>
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    bgGradient={`linear(to-r, ${stat.color}.500, ${stat.color}.300)`}
                    bgClip="text"
                  >
                    {stat.number}
                  </Text>
                  <Text
                    fontWeight="medium"
                    color={useColorModeValue('gray.600', 'gray.300')}
                  >
                    {stat.label}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20} position="relative">
        {/* Decorative background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient={useColorModeValue(
            'radial(circle at 30% 20%, gray.50 0%, transparent 70%)',
            'radial(circle at 30% 20%, gray.700 0%, transparent 70%)'
          )}
          opacity={0.6}
        />

        <Container maxW={'7xl'} position="relative">
          <Box mb={20} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
              bgGradient="linear(to-r, primary.500, secondary.500)"
              bgClip="text"
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
            {[
              {
                icon: '🚀',
                title: 'Adaptive Micro-Learning',
                text: 'Short, engaging 5-15 minute sessions that adapt to your skill level in real-time.',
                color: 'blue'
              },
              {
                icon: '🧠',
                title: 'AI-Curated Pathways',
                text: 'Personalized learning roadmaps based on your goals, existing skills, and learning style.',
                color: 'purple'
              },
              {
                icon: '💬',
                title: '24/7 AI Tutor',
                text: 'Get answers, explanations, and guidance from your personal AI tutor anytime.',
                color: 'green'
              }
            ].map((feature, index) => (
              <Box
                key={index}
                bg={useColorModeValue('white', 'gray.800')}
                p={8}
                borderRadius="xl"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bg: useColorModeValue(
                    `${feature.color}.50`,
                    `${feature.color}.900`
                  ),
                  opacity: 0.1,
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'xl',
                  border: '1px solid',
                  borderColor: useColorModeValue(
                    `${feature.color}.200`,
                    `${feature.color}.700`
                  ),
                }}
                transform="auto"
                _hover={{
                  translateY: -2,
                  boxShadow: 'xl',
                  _before: {
                    opacity: 0.15,
                  },
                }}
                transition="all 0.3s"
              >
                <VStack spacing={4} position="relative" zIndex={1}>
                  <Flex
                    w={16}
                    h={16}
                    align={'center'}
                    justify={'center'}
                    borderRadius="xl"
                    bg={useColorModeValue(`${feature.color}.50`, `${feature.color}.900`)}
                    color={useColorModeValue(`${feature.color}.600`, `${feature.color}.200`)}
                    fontSize="3xl"
                    boxShadow="inner"
                    mb={4}
                  >
                    {feature.icon}
                  </Flex>
                  <Heading
                    fontSize={'xl'}
                    fontWeight={700}
                    bgGradient={`linear(to-r, ${feature.color}.500, ${feature.color}.300)`}
                    bgClip="text"
                  >
                    {feature.title}
                  </Heading>
                  <Text
                    textAlign={'center'}
                    color={useColorModeValue('gray.600', 'gray.300')}
                  >
                    {feature.text}
                  </Text>
                </VStack>
              </Box>
            ))}
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

      {/* Below the fold content wrapped in Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <CommunitySpotlight />
        <TestimonialsSection />
      </Suspense>
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