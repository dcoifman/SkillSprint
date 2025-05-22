import React, { lazy, Suspense } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { ChevronRightIcon, StarIcon, ChatIcon, TimeIcon, CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { FiZap, FiGitMerge, FiMessageCircle, FiTarget, FiRepeat, FiAward } from 'react-icons/fi';
import { fetchLearningPaths } from '../services/supabaseClient.js';
import CourseCarousel from '../components/CourseCarousel.js';
import LoadingSkeleton from '../components/LoadingSkeleton.js';
import { useAuth } from '../contexts/AuthContext.js';
import useApiErrorHandler from '../hooks/useApiErrorHandler.js';

// Lazy load below-the-fold components
const CommunitySpotlight = lazy(() => import('../components/CommunitySpotlight.js'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection.js'));

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 var(--primary-color-opacified); } /* Updated to use CSS var concept */
  70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
`;

const LoadingSpinner = () => (
  <Flex justify="center" align="center" minH="400px">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="var(--primary-color)" 
      size="xl"
    />
  </Flex>
);

const getImagePath = (path) => {
  return path && path.startsWith('/') ? path : `/${path || 'images/placeholder-course.jpg'}`; // Fallback image
};

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Theme colors using CSS variables
  const pageBg = useColorModeValue('var(--background-color)', 'var(--chakra-colors-gray-800)');
  const heroBg = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-800)'); 
  const cardBg = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-700)');
  const borderColor = useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-600)');
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');
  const primaryColor = useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)');
  const secondaryColor = useColorModeValue('var(--secondary-color)', 'var(--chakra-colors-teal-300)');
  const accentColor = useColorModeValue('var(--accent-color)', 'var(--chakra-colors-orange-300)');
  const primaryButtonBg = primaryColor;
  const primaryButtonColor = useColorModeValue('white', 'var(--chakra-colors-gray-900)');
  const subtleBg = useColorModeValue('var(--chakra-colors-gray-50)', 'var(--chakra-colors-gray-700)');
  const heroHeadlineColor = useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)');
  // For pulse animation, if we can't directly use CSS vars in keyframes with Chakra without theme extension:
  // We might need to accept this rgba or use a theme-defined value.
  // For now, this is a placeholder. Actual implementation might require theme setup for keyframes.
  const primaryColorOpacified = "rgba(74, 144, 226, 0.4)"; // Fallback for pulse animation


  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { handleApiError } = useApiErrorHandler();

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await fetchLearningPaths({});
      if (fetchError) {
        handleApiError(fetchError, 'Failed to fetch learning paths');
        setError(fetchError.message);
        return;
      }
      console.log('Fetched courses:', data);
      setCourses(data || []);
    } catch (err) {
      console.error('Error loading courses:', err);
      handleApiError(err, 'An unexpected error occurred while fetching courses');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => loadCourses();

  React.useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = () => {
    if (!user) navigate('/login');
    else navigate('/course-builder/new');
  };

  return (
    <Box bg={pageBg}> {/* Applied pageBg */}
      <Helmet>
        <title>SkillSprint - Master Any Skill with AI-Powered Micro-Learning</title>
        <meta name="description" content="Master any skill with personalized, AI-powered adaptive micro-learning. SkillSprint delivers concise sessions tailored to your learning style and goals." />
      </Helmet>

      {/* Hero Section */}
      <Box 
        bg={heroBg}
        py={{ base: 'var(--spacing-xl)', md: 'var(--spacing-xxl)' }}
        as="section" 
        aria-label="Hero section"
        position="relative"
        overflow="hidden"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Box
          position="absolute" top="-10%" right="-5%" width="300px" height="300px" borderRadius="full"
          bg={primaryColor} filter="blur(100px)" opacity={useColorModeValue(0.2, 0.15)} animation={`${float} 8s ease-in-out infinite alternate`}
        />
        <Box
          position="absolute" bottom="-15%" left="-10%" width="400px" height="400px" borderRadius="full"
          bg={secondaryColor} filter="blur(120px)" opacity={useColorModeValue(0.15, 0.1)} animation={`${float} 10s ease-in-out infinite alternate-reverse`}
        />

        <Container maxW={'7xl'} minH={{base: "auto", md: "70vh"}} position="relative" zIndex={1} display="flex" alignItems="center">
          <Stack direction={{ base: 'column', lg: 'row' }} spacing={'var(--spacing-xl)'} align="center" w="full">
            <Stack flex={1} spacing={'var(--spacing-lg)'} py={{ base: 'var(--spacing-md)', md: 'var(--spacing-xl)' }}>
              <Heading as="h1" lineHeight={1.1} fontWeight="bold" fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }} color={textColor}>
                <Text as={'span'} position={'relative'} color={heroHeadlineColor} _after={{ content: "''", width: 'full', height: '20%', position: 'absolute', bottom: 1, left: 0, bg: useColorModeValue('blue.100', 'rgba(74,144,226,0.1)'), zIndex: -1, borderRadius: 'var(--border-radius-sm)' }}>
                  Short bursts.
                </Text>
                <br />
                <Text as={'span'} color={heroHeadlineColor}>Big skills.</Text>
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color={textLightColor} maxW="xl">
                Master any skill with personalized, AI-powered adaptive micro-learning. SkillSprint delivers concise sessions tailored to your learning style and goals.
              </Text>
              <Stack spacing={'var(--spacing-md)'} direction={{ base: 'column', sm: 'row' }}>
                <Button
                  as={RouterLink} to="/signup" size="lg" fontSize={{ base: "md", md: "lg" }} fontWeight="bold" px={8} py={7}
                  bg={primaryButtonBg} color={primaryButtonColor} borderRadius="var(--border-radius-md)" boxShadow="var(--shadow-lg)"
                  _hover={{ transform: 'translateY(-2px)', bg: accentColor, boxShadow: 'var(--shadow-xl)' }}
                  _active={{ transform: 'scale(0.98)', bg: accentColor }} rightIcon={<CheckCircleIcon boxSize={5} />}
                >
                  Start Learning Free
                </Button>
                <Button
                  as={RouterLink} to="/how-it-works" size="lg" fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" px={8} py={7}
                  bg={useColorModeValue('whiteAlpha.800', 'whiteAlpha.100')} color={textColor} borderWidth="1px"
                  borderColor={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')} borderRadius="var(--border-radius-md)" boxShadow="var(--shadow-sm)"
                  _hover={{ bg: useColorModeValue('white', 'whiteAlpha.200'), transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)'}}
                  _active={{ transform: 'scale(0.98)' }} leftIcon={<Icon as={InfoIcon} boxSize={5} />}
                >
                  Learn More
                </Button>
              </Stack>
              <Box bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.300')} borderRadius="var(--border-radius-lg)" p={'var(--spacing-sm)'} borderWidth="1px" borderColor={borderColor}>
                <HStack spacing={'var(--spacing-sm)'} aria-label="Trusted by companies">
                  <Text fontSize="sm" fontWeight="semibold" color={textLightColor}>Trusted by:</Text>
                  <HStack spacing={3}>
                    {[1, 2, 3].map((i) => ( <Avatar key={i} size="sm" name={`Company ${i}`} src={`https://via.placeholder.com/40x40/gray/fff?text=C${i}`} boxShadow="var(--shadow-sm)" _hover={{ transform: 'scale(1.1)', boxShadow: 'var(--shadow-md)'}} transition="all 0.2s"/> ))}
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium" color={textLightColor} px={3} py={1} borderRadius="full" bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.100')}>
                    +10,000 professionals
                  </Text>
                </HStack>
              </Box>
            </Stack>
            <Box flex={1} position="relative" display={{ base: 'none', lg: 'flex' }} justifyContent="center" alignItems="center">
              <Image src="https://via.placeholder.com/550x550/EDF2F7/4A5568?Text=Engaging+Visual" alt="Engaging learning visual" borderRadius="var(--border-radius-xl)" boxShadow="var(--shadow-xl)" objectFit="cover"/>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box bg={subtleBg} py={'var(--spacing-xxl)'}>
        <Container maxW={'7xl'}>
          <Heading textAlign="center" fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }} fontWeight="bold" mb={'var(--spacing-lg)'} color={textColor}>
            Featured Learning Paths
          </Heading>
          {isLoading && <LoadingSkeleton />}
          {error && (
            <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" borderRadius="var(--border-radius-lg)" bg={useColorModeValue('red.50', 'red.900')}>
              <AlertIcon boxSize="40px" mr={0} color={useColorModeValue('red.500', 'red.200')} />
              <AlertTitle mt={4} mb={1} fontSize="lg">Failed to Load Courses</AlertTitle>
              <AlertDescription maxWidth="sm" mb={4}>{error}</AlertDescription>
              <Button onClick={handleRetry} colorScheme="red" size="sm">Try Again</Button>
            </Alert>
          )}
          {!isLoading && !error && courses.length === 0 && (
            <Alert status="info" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" borderRadius="var(--border-radius-lg)" bg={useColorModeValue('blue.50', 'blue.900')}>
              <AlertIcon boxSize="40px" mr={0} color={useColorModeValue('blue.500', 'blue.200')} />
              <AlertTitle mt={4} mb={1} fontSize="lg">No Courses Available</AlertTitle>
              <AlertDescription maxWidth="sm">Check back soon for new courses!</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && courses.length > 0 && <CourseCarousel courses={courses} />}
        </Container>
      </Box>

      <Box bg={pageBg} py={'var(--spacing-xxl)'} position="relative">
        <Container maxW={'7xl'}>
          <Box mb={'var(--spacing-xl)'} textAlign="center">
            <chakra.h2 fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }} fontWeight="bold" mb={'var(--spacing-md)'} bgGradient={`linear(to-r, ${primaryColor}, ${secondaryColor})`} bgClip="text">
              Everything you need to master new skills
            </chakra.h2>
            <Text color={textLightColor} maxW={'2xl'} mx={'auto'} fontSize={{ base: "md", md: "lg" }}>
              Our AI-powered platform adapts to your learning style, delivering personalized micro-lessons that fit perfectly into your busy schedule.
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={'var(--spacing-lg)'} mb={'var(--spacing-xl)'}>
            <Feature icon={FiZap} title='Adaptive Micro-Learning' text='Short, engaging 5-15 minute sessions that adapt to your skill level in real-time.' iconColor={primaryColor} iconBg={useColorModeValue('blue.100', 'blue.900')} />
            <Feature icon={FiGitMerge} title='AI-Curated Pathways' text='Personalized learning roadmaps based on your goals, existing skills, and learning style.' iconColor={secondaryColor} iconBg={useColorModeValue('teal.100', 'teal.900')} />
            <Feature icon={FiMessageCircle} title='24/7 AI Tutor' text='Get answers, explanations, and guidance from your personal AI tutor anytime.' iconColor={accentColor} iconBg={useColorModeValue('orange.100', 'orange.900')} />
          </SimpleGrid>
        </Container>
      </Box>

      <Box bg={subtleBg} py={'var(--spacing-xxl)'}>
        <Container maxW={'7xl'}>
          <Box mb={'var(--spacing-xl)'} textAlign="center">
            <chakra.h2 fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }} fontWeight="bold" mb={'var(--spacing-md)'} color={textColor}>
              How SkillSprint Works
            </chakra.h2>
            <Text color={textLightColor} maxW={'2xl'} mx={'auto'} fontSize={{ base: "md", md: "lg" }}>
              Our proven learning methodology helps you build skills faster and retain knowledge longer.
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 'var(--spacing-lg)', md: 'var(--spacing-xl)' }}>
            <HowItWorksStep number={1} icon={FiTarget} title="Set your learning goals" description="Tell us what you want to learn, and our AI will design a personalized learning path just for you."/>
            <HowItWorksStep number={2} icon={FiRepeat} title="Complete daily sprints" description="Short, focused learning sessions that adapt to your progress and keep you engaged."/>
            <HowItWorksStep number={3} icon={FiAward} title="Master new skills" description="Track your progress, earn certificates, and apply your new skills in real-world scenarios."/>
          </SimpleGrid>
          <Box textAlign="center" mt={'var(--spacing-xl)'}>
            <Button as={RouterLink} to="/signup" size="lg" bg={primaryButtonBg} color={primaryButtonColor} _hover={{ bg: accentColor }} boxShadow="var(--shadow-md)" rightIcon={<ChevronRightIcon />} borderRadius="var(--border-radius-md)">
              Start Your Learning Journey
            </Button>
          </Box>
        </Container>
      </Box>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Box bg={pageBg} py={'var(--spacing-xxl)'}><CommunitySpotlight /></Box>
        <Box bg={subtleBg} py={'var(--spacing-xxl)'}><TestimonialsSection /></Box>
      </Suspense>

      <Box bg={primaryColor} py={'var(--spacing-xl)'} color="white">
        <Container maxW={'7xl'} textAlign="center">
          <Heading as="h2" size="xl" mb={'var(--spacing-lg)'}>Ready to accelerate your learning?</Heading>
          <Text fontSize="lg" mb={'var(--spacing-xl)'} maxW="2xl" mx="auto">
            Join SkillSprint today and start building valuable skills in just minutes a day. Our personalized approach ensures you'll learn efficiently and effectively.
          </Text>
          <Button
            as={RouterLink} to="/signup" size="lg" bg={useColorModeValue('white', 'gray.900')} color={primaryColor}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.700'), transform: 'translateY(-2px)', boxShadow: 'var(--shadow-lg)' }}
            px={8} py={7} fontSize="md" fontWeight="bold" leftIcon={<CheckCircleIcon />} transition="all 0.2s" borderRadius="var(--border-radius-md)"
          >
            Start Learning for Free
          </Button>
        </Container>
      </Box>

      <Button
        onClick={handleCreateCourse} bg={primaryButtonBg} color={primaryButtonColor} size="lg"
        rightIcon={<ChevronRightIcon />} position="fixed" bottom="var(--spacing-lg)" right="var(--spacing-lg)"
        boxShadow="var(--shadow-xl)" borderRadius="var(--border-radius-md)" _hover={{ bg: accentColor }}
      >
        Start Teaching
      </Button>
    </Box>
  );
}

const Feature = ({ title, text, icon, iconBgColor, iconColor }) => {
  const cardBg = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-800)');
  const borderColor = useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-700)');
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');
  
  return (
    <VStack
      align={'center'} p={'var(--spacing-lg)'} borderWidth="1px" borderRadius="var(--border-radius-xl)"
      bg={cardBg} borderColor={borderColor} boxShadow="var(--shadow-md)" transition="all 0.3s"
      _hover={{ boxShadow: 'var(--shadow-xl)', transform: 'translateY(-5px)', borderColor: useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)') }}
    >
      <Flex w={16} h={16} align={'center'} justify={'center'} color={iconColor} rounded={'full'} bg={iconBgColor} mb={'var(--spacing-sm)'}>
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Heading fontSize={'xl'} fontWeight="bold" mb={2} color={textColor}>
        {title}
      </Heading>
      <Text textAlign={'center'} color={textLightColor}>
        {text}
      </Text>
    </VStack>
  );
};

const HowItWorksStep = ({ number, title, description, icon }) => {
  const primaryColor = useColorModeValue('var(--primary-color)', 'var(--chakra-colors-blue-300)');
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');

  return (
    <VStack spacing={'var(--spacing-md)'} align="center">
      <Flex
        w={20} h={20} align="center" justify="center" color={'white'} fontWeight="bold"
        rounded="full" bg={primaryColor} fontSize="2xl" boxShadow="var(--shadow-lg)"
      >
        {icon ? <Icon as={icon} w={10} h={10}/> : number}
      </Flex>
      <Heading fontSize="xl" color={textColor}>{title}</Heading>
      <Text textAlign="center" color={textLightColor}>{description}</Text>
    </VStack>
  );
};

const Testimonial = ({ name, role, content, avatar }) => {
  const cardBg = useColorModeValue('var(--surface-color)', 'var(--chakra-colors-gray-800)');
  const borderColor = useColorModeValue('var(--chakra-colors-gray-200)', 'var(--chakra-colors-gray-700)');
  const textColor = useColorModeValue('var(--text-color)', 'whiteAlpha.900');
  const textLightColor = useColorModeValue('var(--text-light-color)', 'var(--chakra-colors-gray-400)');

  return (
    <VStack
      spacing={'var(--spacing-md)'} p={'var(--spacing-lg)'} borderWidth="1px" borderRadius="var(--border-radius-lg)"
      bg={cardBg} borderColor={borderColor} boxShadow="var(--shadow-md)" transition="all 0.3s"
      _hover={{ boxShadow: 'var(--shadow-xl)', transform: 'translateY(-5px)'}} align="start"
    >
      <Text fontSize="md" color={textLightColor} fontStyle="italic">"{content}"</Text>
      <HStack spacing={'var(--spacing-sm)'}>
        <Avatar src={avatar} name={name} size="md" />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" color={textColor}>{name}</Text>
          <Text fontSize="sm" color={textLightColor}>{role}</Text>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default HomePage;