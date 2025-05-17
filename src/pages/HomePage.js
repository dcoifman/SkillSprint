import React, { useEffect, useState, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Circle,
  AspectRatio,
  useBreakpointValue,
  List,
  ListItem,
  ListIcon,
  Input,
  InputGroup,
  InputRightElement,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  ScaleFade,
  SlideFade,
  Fade,
  Skeleton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  ModalFooter,
  Spacer,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes, css } from '@emotion/react';
import { 
  ChevronRightIcon, 
  StarIcon, 
  ChatIcon, 
  TimeIcon, 
  CheckCircleIcon, 
  SearchIcon,
  ArrowForwardIcon,
  DownloadIcon,
  ExternalLinkIcon,
  InfoOutlineIcon,
  RepeatIcon,
  LockIcon,
  UnlockIcon,
  ViewIcon,
  EmailIcon,
  PhoneIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';
import { FaGraduationCap, FaRocket, FaBrain, FaChartLine, FaLightbulb, FaUserGraduate, FaUsers, FaClock, FaCode, FaMobileAlt, FaUser } from 'react-icons/fa';
import { GiArtificialIntelligence, GiMagnifyingGlass, GiTargetArrows, GiBrain } from 'react-icons/gi';
import { BiCodeAlt, BiAnalyse, BiBarChartAlt2, BiBookOpen } from 'react-icons/bi';
import { fetchLearningPaths } from '../services/supabaseClient';
import CourseCarousel from '../components/CourseCarousel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-fade';
import ThreeDAnatomyModel from '../components/ThreeDAnatomyModel';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import { TypeAnimation } from 'react-type-animation';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';
import { ErrorBoundary } from 'react-error-boundary';

// Animation keyframes
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

const float = keyframes`
  0% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(0px) translateX(10px);
  }
  75% {
    transform: translateY(10px) translateX(5px);
  }
  100% {
    transform: translateY(0px) translateX(0px);
  }
`;

const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 5px 0px rgba(98, 0, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(98, 0, 234, 0.6);
  }
  100% {
    box-shadow: 0 0 5px 0px rgba(98, 0, 234, 0.4);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const typewriterCursor = keyframes`
  from {
    border-right-color: rgba(98, 0, 234, 0.8);
  }
  to {
    border-right-color: transparent;
  }
`;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const cardVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 },
  },
};

// Utility Functions
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Particle Background Configuration
const particlesConfig = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 900,
      },
    },
    color: {
      value: "#6200ea",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
      polygon: {
        nb_sides: 5,
      },
    },
    opacity: {
      value: 0.3,
      random: true,
      anim: {
        enable: true,
        speed: 0.5,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 5,
      random: true,
      anim: {
        enable: true,
        speed: 2,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#6200ea",
      opacity: 0.2,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: true,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "grab",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: {
          opacity: 0.5,
        },
      },
      push: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
};

// Animated Stat Card Component
const StatCard = ({ icon, accentColor, value, suffix, label, delay, isVisible }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
    transition={{ duration: 0.7, delay }}
  >
    <VStack 
      p={8} 
      borderRadius="xl" 
      bg="whiteAlpha.100"
      backdropFilter="blur(8px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      spacing={4}
      height="100%"
      boxShadow="0 10px 30px -5px rgba(0, 0, 0, 0.1)"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
    >
      <Circle 
        size={14} 
        bg={accentColor} 
        color="white" 
        opacity={0.9}
      >
        <Icon as={icon} boxSize={6} />
      </Circle>
      
      <Box textAlign="center">
        <HStack justify="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color="white">
          <VisibilitySensor partialVisibility offset={{ bottom: 50 }}>
            {({ isVisible: isCounterVisible }) => (
              <Text display="flex" alignItems="baseline">
                <CountUp 
                  start={0} 
                  end={isVisible && isCounterVisible ? value : 0}
                  duration={2.5}
                  separator=","
                  decimals={value < 100 ? 1 : 0}
                  decimal="."
                />
                <Text as="span" ml={1}>{suffix}</Text>
              </Text>
            )}
          </VisibilitySensor>
        </HStack>
        <Text mt={1} color="whiteAlpha.800" fontWeight="medium">{label}</Text>
      </Box>
    </VStack>
  </motion.div>
);

// Achievement Component
const Achievement = ({ icon, title, description, delay, isVisible }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
    transition={{ duration: 0.6, delay }}
  >
    <HStack 
      align="start" 
      spacing={4} 
      bg="whiteAlpha.100" 
      p={5} 
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(8px)"
      transition="transform 0.3s"
      _hover={{ transform: "translateY(-5px)" }}
    >
      <Circle size={10} bg="whiteAlpha.300" color="white">
        <Icon as={icon} boxSize={5} />
      </Circle>
      <Box>
        <Text color="white" fontWeight="bold" fontSize="lg" mb={1}>{title}</Text>
        <Text color="whiteAlpha.800" fontSize="sm">{description}</Text>
      </Box>
    </HStack>
  </motion.div>
);

function HomePage() {
  const pulseAnimation = `${pulse} 2s infinite`;
  const floatAnimation = `${float} 6s ease-in-out infinite`;
  const glowAnimation = `${glowPulse} 3s infinite`;
  const gradientAnimation = `${gradientShift} 5s ease infinite`;
  
  // Theme colors
  const heroBg = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const glassEffect = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(26, 32, 44, 0.8)'
  );
  const gradientBg = useColorModeValue(
    'linear-gradient(135deg, #6200ea 0%, #b388ff 100%)',
    'linear-gradient(135deg, #42389d 0%, #5b4cdb 100%)'
  );
  const accentGradient = 'linear-gradient(135deg, #6200ea 0%, #00e5ff 100%)';

  // State for data and UI management
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Refs for scrolling elements
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const heroRef = useRef(null);
  
  // Initialize particles
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };
  
  // Responsive values based on screen size
  const heroTextSize = useBreakpointValue({ base: '4xl', md: '5xl', lg: '6xl' });
  const heroWidth = useBreakpointValue({ base: '100%', md: '90%', lg: '80%' });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const featuredCoursesCount = useBreakpointValue({ base: 1, sm: 1, md: 2, lg: 3 });

  // Mock featured courses data (will be replaced by API data)
  const featuredCourses = [
    {
      id: 'ml-fundamentals',
      title: 'Machine Learning Fundamentals',
      description: 'Learn the core concepts of machine learning and build your first models',
      duration: '2 weeks',
      level: 'Beginner',
      rating: 4.9,
      students: 12345,
      image: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?q=80&w=2070',
      tags: ['AI', 'Python', 'Data Science'],
    },
    {
      id: 'ux-design',
      title: 'UX Design Principles',
      description: 'Master the fundamentals of user experience design and create intuitive interfaces',
      duration: '3 weeks',
      level: 'Intermediate',
      rating: 4.8,
      students: 8765,
      image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=2036',
      tags: ['Design', 'UI/UX', 'Prototyping'],
    },
    {
      id: 'data-science',
      title: 'Data Science Bootcamp',
      description: 'Comprehensive data science training from statistical analysis to visualization',
      duration: '4 weeks',
      level: 'Advanced',
      rating: 4.7,
      students: 6543,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070',
      tags: ['Data', 'Python', 'Statistics'],
    },
    {
      id: 'frontend-dev',
      title: 'Frontend Development Mastery',
      description: 'Build modern, responsive interfaces with React, CSS and modern JavaScript',
      duration: '3 weeks',
      level: 'Intermediate',
      rating: 4.9,
      students: 9876,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072',
      tags: ['React', 'JavaScript', 'CSS'],
    },
  ];

  // Load course data
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await fetchLearningPaths({});
        if (error) {
          console.error('Error loading courses:', error);
          // Show fallback data
          setTimeout(() => {
            setCourses(featuredCourses);
            setIsLoading(false);
          }, 1500);
        } else {
          // Format API data if needed
          const formattedData = data?.length > 0 ? data : featuredCourses;
          setCourses(formattedData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        // Show fallback data
        setTimeout(() => {
          setCourses(featuredCourses);
        setIsLoading(false);
        }, 1500);
      }
    };

    loadCourses();
    
    // Add scroll event listener for animations
    const handleScroll = () => {
      if (statsRef.current) {
        const statsPosition = statsRef.current.getBoundingClientRect();
        setStatsVisible(statsPosition.top < window.innerHeight * 0.8);
      }
      
      if (featuresRef.current) {
        const featuresPosition = featuresRef.current.getBoundingClientRect();
        setFeaturesVisible(featuresPosition.top < window.innerHeight * 0.8);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle course preview
  const handleShowPreview = (course) => {
    setPreviewData(course);
    setShowPreview(true);
    onOpen();
  };
  
  // Handle email signup
  const handleEmailSignup = (e) => {
    e.preventDefault();
    toast({
      title: "Welcome aboard!",
      description: "Thanks for joining! Check your email for next steps.",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <ParallaxProvider>
      <Box position="relative" overflow="hidden">
        {/* Floating Navigation Menu */}
        <Box 
          position="fixed" 
          bottom="20px" 
          right="20px" 
          zIndex={999}
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
        >
          <Button
            as={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            mb={2}
            size="md"
            colorScheme="primary"
            boxShadow="lg"
            borderRadius="full"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowForwardIcon />}
          >
            Join Free
          </Button>
          
          <HStack spacing={2}>
            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              size="md"
              colorScheme="teal"
              aria-label="Contact us"
              icon={<EmailIcon />}
              boxShadow="lg"
              borderRadius="full"
              onClick={() => navigate('/contact')}
            />
            
            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              size="md"
              colorScheme="blue"
              aria-label="Search courses"
              icon={<SearchIcon />}
              boxShadow="lg"
              borderRadius="full"
              onClick={() => navigate('/courses')}
            />
            
            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              size="md"
              colorScheme="purple"
              aria-label="Scroll to top"
              icon={<ChevronUpIcon />}
              boxShadow="lg"
              borderRadius="full"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </HStack>
        </Box>

        {/* Particle Background */}
        <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1} opacity={0.7} pointerEvents="none">
          <Particles id="tsparticles" init={particlesInit} options={particlesConfig} />
        </Box>

      {/* Hero Section */}
        <Box 
          position="relative" 
          minH="100vh" 
          py={{ base: 20, lg: 0 }}
          display="flex" 
          alignItems="center"
          zIndex={2}
          ref={heroRef}
          overflow="hidden"
          bg={`linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.6)), url('https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=2074') center/cover no-repeat`}
          _dark={{
            bg: `linear-gradient(rgba(26,32,44,0.9), rgba(26,32,44,0.6)), url('https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=2074') center/cover no-repeat`
          }}
        >
          <Container maxW={'7xl'} zIndex={3}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={10} alignItems="center">
              {/* Hero Text Content */}
              <GridItem>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <VStack spacing={6} align="flex-start" maxW="650px">
                    <Badge
                      as={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      colorScheme="purple"
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="bold"
                      boxShadow="sm"
                    >
                      AI-Powered Learning Platform
                    </Badge>
                    
              <Heading
                      as={motion.h1}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                lineHeight={1.1}
                      fontWeight={700}
                      fontSize={heroTextSize}
                    >
                      <chakra.span display="block" mb={2}>
                        Master any skill
                      </chakra.span>
                      <chakra.span 
                        bgGradient={accentGradient}
                        bgClip="text"
                        animation={gradientAnimation}
                      >
                        in micro-sprints.
                      </chakra.span>
                    </Heading>
                    
                    <Box 
                      as={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <TypeAnimation
                        sequence={[
                          'Data Science. Machine Learning. UX Design.',
                          2000,
                          'Programming. Digital Marketing. Product Management.',
                          2000,
                          'Web Development. AI. Mobile Apps.',
                          2000,
                        ]}
                        wrapper="span"
                        speed={40}
                        style={{ 
                          fontSize: '1.25rem', 
                          display: 'inline-block',
                          fontWeight: 'medium',
                          color: 'var(--chakra-colors-purple-500)'
                        }}
                        repeat={Infinity}
                      />
                    </Box>
                    
                <Text
                      as={motion.p}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      fontSize={{ base: 'lg', md: 'xl' }}
                      color={useColorModeValue('gray.600', 'gray.300')}
                      pr={{ base: 0, md: 10 }}
                    >
                      SkillSprint's personalized AI learning platform delivers targeted micro-lessons
                      engineered for maximum retention and rapid skill acquisition.
                </Text>
                    
              <Stack
                      as={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                      spacing={5}
                direction={{ base: 'column', sm: 'row' }}
                      mt={2}
              >
                <Button
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        size="lg"
                        px={8}
                        fontSize="md"
                        fontWeight="bold"
                        colorScheme="primary"
                        bg={useColorModeValue('primary.500', 'primary.400')}
                        _hover={{
                          bg: useColorModeValue('primary.600', 'primary.300'),
                        }}
                        leftIcon={<Icon as={FaRocket} h={5} w={5} />}
                  position="relative"
                  _after={{
                    content: "''",
                    width: '100%',
                    height: '100%',
                    borderRadius: '50px',
                          position: 'absolute',
                    zIndex: -1,
                    animation: pulseAnimation,
                  }}
                        onClick={() => navigate('/signup')}
                >
                        Start Free Trial
                </Button>
                      
                <Button
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        size="lg"
                        px={8}
                        fontSize="md"
                        fontWeight="bold"
                        variant="outline"
                        colorScheme="primary"
                        leftIcon={<Icon as={BiCodeAlt} h={5} w={5} />}
                        onClick={() => navigate('/courses')}
                      >
                        Browse Courses
                </Button>
              </Stack>
              
                    <HStack 
                      as={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      spacing={4} 
                      mt={4}
                    >
                      <HStack>
                        <Icon as={FaGraduationCap} color="primary.500" />
                        <Text fontWeight="medium" fontSize="sm">30+ Learning Paths</Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaUsers} color="primary.500" />
                        <Text fontWeight="medium" fontSize="sm">1M+ Learners</Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaClock} color="primary.500" />
                        <Text fontWeight="medium" fontSize="sm">15min Daily</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </motion.div>
              </GridItem>
              
              {/* Hero Visuals */}
              <GridItem display={{ base: 'none', lg: 'block' }}>
                <Box position="relative" height="600px">
                  {/* 3D element or main image */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Box
                      position="absolute"
                      width="500px"
                      height="500px"
                      top="0"
                      right="0"
                      borderRadius="2xl"
                      overflow="hidden"
                      boxShadow="2xl"
                      zIndex={2}
                      animation={floatAnimation}
                    >
                      {/* 3D model preview for anatomy course */}
                      <ErrorBoundary fallback={
                <Image
                          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026"
                          alt="Learning dashboard"
                  objectFit="cover"
                          width="100%"
                          height="100%"
                        />
                      }>
                        {courses.some(c => c.id === 'ml-fundamentals') ? (
                          <ThreeDAnatomyModel 
                            systemType="skeletal"
                            initialView="anterior"
                          />
                        ) : (
                <Image
                            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026"
                            alt="Learning dashboard"
                  objectFit="cover"
                            width="100%"
                            height="100%"
                          />
                        )}
                      </ErrorBoundary>
                    </Box>
                  </motion.div>
                  
                  {/* Floating course card */}
                  <motion.div
                    initial={{ x: 50, y: 50, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Card
                      position="absolute"
                      bottom="80px"
                      left="0px"
                      width="320px"
                      boxShadow="2xl"
                      borderRadius="xl"
                      overflow="hidden"
                      bg={glassEffect}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.200', 'gray.700')}
                      backdropFilter="blur(10px)"
                      zIndex={3}
                      as={motion.div}
                      whileHover={{ y: -5, boxShadow: "0 20px 30px rgba(0,0,0,0.15)" }}
                      animation={`${floatAnimation} 8s infinite`}
                    >
                      <CardBody p={0}>
                        <AspectRatio ratio={16/9}>
                <Image
                            src="https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=2070"
                            alt="Machine Learning"
                  objectFit="cover"
                          />
                        </AspectRatio>
                        <Box p={4}>
                          <HStack mb={2}>
                            <Badge colorScheme="green">Trending</Badge>
                            <Badge colorScheme="purple">AI</Badge>
              </HStack>
                          <Heading size="md" mb={2}>Machine Learning Fundamentals</Heading>
                          <HStack mb={3}>
                            <Icon as={FaUser} color="gray.500" />
                            <Text fontSize="sm" color="gray.500">12.3k students</Text>
                            <Spacer />
                            <HStack>
                              <Icon as={StarIcon} color="yellow.400" />
                              <Text fontWeight="bold">4.9</Text>
                            </HStack>
                          </HStack>
                          <Box height="6px" bg="gray.100" borderRadius="full" mb={2}>
                            <Box height="6px" width="85%" bg="primary.500" borderRadius="full" />
                          </Box>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">12 of 14 sections</Text>
                            <Button
                              size="sm"
                              colorScheme="primary"
                              variant="ghost"
                              rightIcon={<ArrowForwardIcon />}
                            >
                              Continue
                            </Button>
                          </HStack>
                        </Box>
                      </CardBody>
                    </Card>
                  </motion.div>
                  
                  {/* Floating code snippet */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
            >
              <Box
                      position="absolute"
                      top="60px"
                      left="0"
                      width="300px"
                      p={4}
                      bg={useColorModeValue('blackAlpha.800', 'gray.800')}
                      color="white"
                      borderRadius="xl"
                      boxShadow="xl"
                      fontFamily="mono"
                      fontSize="sm"
                      zIndex={3}
                      as={motion.div}
                      whileHover={{ y: -5, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }}
                      animation={`${floatAnimation} 9s infinite`}
                    >
                      <HStack mb={2} color="gray.400">
                        <Circle size={3} bg="red.400" />
                        <Circle size={3} bg="yellow.400" />
                        <Circle size={3} bg="green.400" />
                        <Text ml={2}>python_ml.py</Text>
                      </HStack>
                      <Text color="purple.300">import <Text as="span" color="yellow.300">numpy</Text> as np</Text>
                      <Text color="purple.300">import <Text as="span" color="yellow.300">tensorflow</Text> as tf</Text>
                      <Text color="gray.400" my={1}># Build a simple neural network</Text>
                      <Text color="blue.300">model = tf.keras.Sequential([</Text>
                      <Text color="blue.300" ml={4}>tf.keras.layers.Dense(128, activation=<Text as="span" color="green.300">'relu'</Text>),</Text>
                      <Text color="blue.300" ml={4}>tf.keras.layers.Dense(10, activation=<Text as="span" color="green.300">'softmax'</Text>)</Text>
                      <Text color="blue.300">])</Text>
                    </Box>
                  </motion.div>
                  
                  {/* Notification toast */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                <Box
                  position="absolute"
                  bottom="20px"
                      right="40px"
                      width="250px"
                      bg={useColorModeValue('white', 'gray.800')}
                  borderRadius="lg"
                      boxShadow="xl"
                      p={3}
                      borderWidth="1px"
                      borderColor={useColorModeValue('gray.200', 'gray.700')}
                      zIndex={3}
                      as={motion.div}
                      whileHover={{ y: -5 }}
                      animation={`${float} 7s infinite`}
                    >
                      <HStack spacing={3}>
                        <Circle size={10} bg="green.100" color="green.500">
                          <CheckCircleIcon />
                        </Circle>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">Daily Goal Achieved!</Text>
                          <Text fontSize="xs" color="gray.500">You've completed today's learning sprint.</Text>
                        </Box>
                  </HStack>
                  </Box>
                  </motion.div>
                </Box>
              </GridItem>
            </Grid>
            
            {/* Trusted by companies */}
            <Box 
              mt={{ base: 12, lg: 20 }} 
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <Text textAlign="center" fontSize="sm" fontWeight="medium" mb={6} color="gray.500">
                TRUSTED BY LEADING COMPANIES WORLDWIDE
                  </Text>
              <SimpleGrid 
                columns={{ base: 2, md: 4, lg: 6 }} 
                spacing={10} 
                alignItems="center"
                opacity={0.7}
              >
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/microsoft-5.svg"
                  alt="Microsoft"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/google-2015.svg"
                  alt="Google"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/amazon-2.svg"
                  alt="Amazon"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg"
                  alt="Salesforce"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/adobe-2.svg"
                  alt="Adobe"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
                <Image
                  src="https://cdn.worldvectorlogo.com/logos/ibm-1.svg"
                  alt="IBM"
                  maxH="35px"
                  mx="auto"
                  filter={useColorModeValue("grayscale(100%)", "grayscale(100%) brightness(1.5)")}
                />
              </SimpleGrid>
                </Box>
        </Container>
      </Box>

      {/* Featured Courses Section */}
        <Box position="relative" py={20} bg={useColorModeValue('gray.50', 'gray.800')}>
          {/* Background decoration */}
          <Box
            position="absolute"
            top="0"
            right="0"
            height="300px"
            width="300px"
            bg={useColorModeValue('primary.50', 'primary.900')}
            opacity="0.4"
            filter="blur(70px)"
            borderRadius="full"
            zIndex={1}
          />
          <Box
            position="absolute"
            bottom="0"
            left="0"
            height="200px"
            width="200px"
            bg={useColorModeValue('secondary.50', 'secondary.900')}
            opacity="0.3"
            filter="blur(60px)"
            borderRadius="full"
            zIndex={1}
          />
          
          <Container maxW={'7xl'} position="relative" zIndex={2}>
            <VStack spacing={8} mb={12}>
              <Box textAlign="center">
                <Badge
                  px={3}
                  py={1}
                  mb={3}
                  colorScheme="secondary"
                  fontSize="sm"
                  borderRadius="full"
                  boxShadow="sm"
                >
                  Top-Rated Programs
                </Badge>
          <Heading
                  as={motion.h2}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="bold"
                  mb={4}
          >
                  Featured Learning Paths
          </Heading>
                <Text
                  color={useColorModeValue('gray.600', 'gray.400')}
                  maxW="800px"
                  mx="auto"
                  fontSize={{ base: 'md', md: 'lg' }}
                >
                  Explore our most popular paths designed by industry experts and continuously 
                  optimized by our AI to deliver the most effective learning experience.
                </Text>
              </Box>
              
              {/* Course cards slider */}
          {isLoading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} width="100%">
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} borderRadius="xl" overflow="hidden" height="450px">
                      <Skeleton height="200px" />
                      <Box p={5}>
                        <Skeleton height="20px" width="40%" mb={4} />
                        <Skeleton height="20px" width="90%" mb={3} />
                        <Skeleton height="20px" width="60%" mb={4} />
                        <Skeleton height="15px" width="80%" mb={2} />
                        <Skeleton height="15px" width="70%" mb={6} />
                        <Skeleton height="40px" width="100%" />
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Box width="100%" overflow="hidden">
                  <Swiper
                    slidesPerView={featuredCoursesCount}
                    spaceBetween={30}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    navigation={true}
                    effect="coverflow"
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 0,
                      depth: 100,
                      modifier: 1,
                      slideShadows: false,
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
                    className="mySwiper"
                    style={{ padding: '30px 0 50px' }}
                  >
                    {courses.map((course, index) => (
                      <SwiperSlide key={course.id || index}>
                        <motion.div whileHover="hover">
                          <Card
                            as={motion.div}
                            variants={cardVariants}
                            height="450px"
                            overflow="hidden"
                            borderRadius="xl"
                            bg={cardBg}
                            boxShadow="lg"
                            position="relative"
                            cursor="pointer"
                            onClick={() => handleShowPreview(course)}
                          >
                            <Box overflow="hidden" height="200px">
                              <Image
                                src={course.image || `https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974`}
                                alt={course.title}
                                objectFit="cover"
                                width="100%"
                                height="100%"
                                transition="transform 0.3s"
                                _groupHover={{ transform: "scale(1.05)" }}
                              />
                              <Box position="absolute" top={3} left={3}>
                                <Badge colorScheme={
                                  course.level === 'Beginner' ? 'green' :
                                  course.level === 'Intermediate' ? 'blue' : 'purple'
                                }>
                                  {course.level || 'All Levels'}
                                </Badge>
                              </Box>
                              <HStack 
                                position="absolute" 
                                top={3} 
                                right={3}
                                bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.700')}
                                borderRadius="full"
                                py={1}
                                px={2}
                              >
                                <Icon as={StarIcon} color="yellow.400" boxSize={3} />
                                <Text fontSize="xs" fontWeight="bold">
                                  {course.rating || '4.8'}
                                </Text>
                              </HStack>
                            </Box>
                            
                            <CardBody>
                              <HStack mb={2} wrap="wrap">
                                {(course.tags || ['Skill', 'Learning']).map((tag, i) => (
                                  <Badge 
                                    key={i} 
                                    colorScheme={
                                      tag === 'AI' ? 'purple' : 
                                      tag === 'Data' ? 'blue' : 
                                      tag === 'Design' ? 'pink' : 
                                      tag === 'Python' ? 'green' : 
                                      tag === 'JavaScript' ? 'yellow' : 
                                      'gray'
                                    }
                                    fontSize="xs"
                                    mt={1}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </HStack>
                              
                              <Heading size="md" mb={2} noOfLines={2}>
                                {course.title || 'Course Title'}
                              </Heading>
                              
                              <Text 
                                fontSize="sm" 
                                color={useColorModeValue('gray.600', 'gray.400')}
                                noOfLines={3}
                                mb={3}
                              >
                                {course.description || 'This course teaches you the essential skills needed to master this subject through engaging content and practical exercises.'}
                              </Text>
                              
                              <HStack mb={2}>
                                <Icon as={FaClock} color="gray.400" boxSize={4} />
                                <Text fontSize="sm" color="gray.500">
                                  {course.duration || '2-4 weeks'}
                                </Text>
                                <Spacer />
                                <Icon as={FaUsers} color="gray.400" boxSize={4} />
                                <Text fontSize="sm" color="gray.500">
                                  {course.students?.toLocaleString() || '8,234'} students
                                </Text>
                              </HStack>
                            </CardBody>
                            
                            <CardFooter
                              borderTop="1px"
                              borderColor={useColorModeValue('gray.200', 'gray.700')}
                              py={3}
                              px={5}
                              bg={useColorModeValue('gray.50', 'gray.700')}
                            >
                              <Button
                                colorScheme="primary"
                                size="sm"
                                width="full"
                                leftIcon={<Icon as={FaGraduationCap} />}
                              >
                                Enroll Now
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Box>
              )}
            </VStack>
            
            <Box textAlign="center">
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                size="lg"
                colorScheme="primary"
                variant="outline"
                rightIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/courses')}
              >
                View All Courses
              </Button>
            </Box>
        </Container>
      </Box>

        {/* Course Preview Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="5xl" motionPreset="slideInBottom">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
          <ModalContent borderRadius="xl" overflow="hidden">
            <ModalCloseButton />
            {previewData && (
              <>
                <Box position="relative" height="300px">
                  <Image
                    src={previewData.image || `https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974`}
                    alt={previewData.title}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={6}
                    bg="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                    color="white"
                  >
                    <Heading size="xl">{previewData.title}</Heading>
                    <HStack mt={2}>
                      <Badge colorScheme="green">{previewData.level || 'All Levels'}</Badge>
                      <Badge colorScheme="purple">{previewData.duration || '2-4 weeks'}</Badge>
                      <Badge colorScheme="blue">{previewData.students?.toLocaleString() || '8,234'} enrolled</Badge>
                    </HStack>
                  </Box>
                </Box>
                <ModalBody p={6}>
                  <Tabs colorScheme="primary" variant="soft-rounded">
                    <TabList mb={4}>
                      <Tab>Overview</Tab>
                      <Tab>Curriculum</Tab>
                      <Tab>Instructors</Tab>
                      <Tab>Reviews</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <VStack align="start" spacing={6}>
                          <Box>
                            <Heading size="md" mb={3}>About This Course</Heading>
                            <Text>{previewData.description || 'This comprehensive course is designed to take you from beginner to proficient in this subject area through carefully crafted lessons, hands-on exercises, and practical projects that reinforce learning.'}</Text>
                          </Box>
                          
                          <Box width="100%">
                            <Heading size="md" mb={3}>What You'll Learn</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {[
                                'Master the fundamental concepts and principles',
                                'Apply your knowledge to real-world projects',
                                'Develop critical thinking and problem-solving skills',
                                'Learn industry best practices and workflows',
                                'Build a professional portfolio of work',
                                'Gain confidence in your abilities and skills'
                              ].map((item, i) => (
                                <HStack key={i} align="start">
                                  <Icon as={CheckCircleIcon} color="green.500" mt={1} />
                                  <Text>{item}</Text>
                                </HStack>
                              ))}
                            </SimpleGrid>
                          </Box>
            </VStack>
                      </TabPanel>
                      <TabPanel>
                        <Heading size="md" mb={4}>Course Content</Heading>
                        <Accordion allowToggle>
                          {[
                            { title: 'Getting Started', lessons: 4, duration: '45 min' },
                            { title: 'Core Concepts', lessons: 6, duration: '1h 20min' },
                            { title: 'Advanced Techniques', lessons: 5, duration: '1h 15min' },
                            { title: 'Practical Applications', lessons: 7, duration: '2h 10min' },
                            { title: 'Final Projects', lessons: 3, duration: '1h 30min' }
                          ].map((section, i) => (
                            <AccordionItem key={i} border="1px" borderColor="gray.200" mb={2} borderRadius="md">
                              <h2>
                                <AccordionButton py={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                  <Box flex="1" textAlign="left" fontWeight="semibold">
                                    {section.title}
                                  </Box>
                                  <HStack>
                                    <Text mr={2} fontSize="sm" color="gray.500">
                                      {section.lessons} lessons • {section.duration}
              </Text>
                                    <AccordionIcon />
                                  </HStack>
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4} bg={useColorModeValue('gray.50', 'gray.700')}>
                                <VStack align="stretch" spacing={2}>
                                  {[...Array(section.lessons)].map((_, j) => (
                                    <HStack key={j} p={2} borderRadius="md" bg={useColorModeValue('white', 'gray.600')}>
                                      <Icon as={j === 0 ? UnlockIcon : LockIcon} color={j === 0 ? "green.500" : "gray.500"} />
                                      <Text fontWeight={j === 0 ? "medium" : "normal"}>
                                        Lesson {j + 1}: {section.title.replace(/s$/, '')} {j + 1}
              </Text>
                                      <Spacer />
                                      <Text fontSize="sm" color="gray.500">
                                        {Math.floor(5 + Math.random() * 15)} min
                                      </Text>
                                    </HStack>
                                  ))}
            </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </TabPanel>
                      <TabPanel>
                        <Heading size="md" mb={4}>Course Instructors</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                          <HStack align="start" spacing={4}>
                            <Avatar size="xl" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070" />
                            <Box>
                              <Heading size="sm">Dr. Michael Chen</Heading>
                              <Text color="gray.500" fontSize="sm" mb={2}>Senior Data Scientist, PhD</Text>
                              <Text fontSize="sm">
                                Expert in machine learning with over 10 years of experience in both academic and industry settings. 
                                Previously lead AI researcher at Tech Innovators Inc.
              </Text>
                            </Box>
                          </HStack>
                          <HStack align="start" spacing={4}>
                            <Avatar size="xl" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961" />
                            <Box>
                              <Heading size="sm">Sarah Johnson</Heading>
                              <Text color="gray.500" fontSize="sm" mb={2}>Lead Product Manager</Text>
                              <Text fontSize="sm">
                                Experienced product leader with expertise in translating complex technical concepts into 
                                practical applications. Former VP of Product at LearnTech.
                              </Text>
                            </Box>
                          </HStack>
                        </SimpleGrid>
                      </TabPanel>
                      <TabPanel>
                        <VStack align="stretch" spacing={6}>
                          <HStack>
                            <Heading size="xl" color="primary.500">4.9</Heading>
                            <VStack align="start" spacing={0}>
                              <HStack>
                                {[...Array(5)].map((_, i) => (
                                  <Icon key={i} as={StarIcon} color={i < 5 ? "yellow.400" : "gray.300"} />
                                ))}
                              </HStack>
                              <Text color="gray.500" fontSize="sm">Based on 342 reviews</Text>
                            </VStack>
                          </HStack>
                          
                          <Divider />
                          
                          {[
                            { name: "Alex Murphy", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974", rating: 5, comment: "This course exceeded my expectations. The content is well-structured and the practical exercises really helped solidify my understanding." },
                            { name: "Jamie Lee", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070", rating: 5, comment: "Excellent course! The instructors explain complex concepts in simple terms. I feel much more confident in my skills now." },
                            { name: "Robert Garcia", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974", rating: 4, comment: "Very informative and practical. I would have liked a bit more depth in the advanced sections, but overall it was great value." }
                          ].map((review, i) => (
                            <VStack key={i} align="start" spacing={3} p={4} borderWidth="1px" borderRadius="lg">
                              <HStack>
                                <Avatar size="sm" src={review.avatar} name={review.name} />
                                <Box>
                                  <Text fontWeight="bold">{review.name}</Text>
                                  <HStack>
                                    {[...Array(5)].map((_, j) => (
                                      <Icon key={j} as={StarIcon} boxSize={3} color={j < review.rating ? "yellow.400" : "gray.300"} />
                                    ))}
                                  </HStack>
                                </Box>
                              </HStack>
                              <Text fontSize="sm">{review.comment}</Text>
                            </VStack>
                          ))}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </ModalBody>
                <ModalFooter borderTop="1px" borderColor="gray.200">
                  <Button
                    colorScheme="primary"
                    size="lg"
                    leftIcon={<Icon as={FaGraduationCap} />}
                    onClick={() => {
                      onClose();
                      navigate(`/courses/${previewData.id || 'details'}`);
                    }}
                  >
                    Enroll Now
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Stats Section */}
        <Box 
          py={24} 
          position="relative" 
          overflow="hidden"
          bgGradient={gradientBg}
          ref={statsRef}
        >
          {/* Background geometric shapes */}
          <Box 
            position="absolute" 
            top="-10%" 
            left="-5%" 
            width="300px" 
            height="300px" 
            bg="white" 
            opacity="0.05" 
            borderRadius="full" 
            zIndex={1} 
          />
          <Box 
            position="absolute" 
            bottom="-15%" 
            right="-10%" 
            width="400px" 
            height="400px" 
            bg="white" 
            opacity="0.05" 
            borderRadius="full" 
            zIndex={1} 
          />
          <Box
            position="absolute"
            top="20%"
            right="15%"
            width="150px"
            height="150px"
            bg="white"
            opacity="0.05"
            borderRadius="full"
            zIndex={1}
          />
          
          <Container maxW={'7xl'} position="relative" zIndex={2}>
            <VStack spacing={16}>
              <Box textAlign="center" mb={6}>
                <Badge 
                  px={3} 
                  py={1} 
                  mb={3} 
                  colorScheme="secondary" 
                  fontSize="sm" 
                  borderRadius="full"
                  boxShadow="sm"
                >
                  Platform Impact
                </Badge>
                <Heading 
                  as={motion.h2}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  fontSize={{ base: '3xl', md: '4xl' }} 
                  fontWeight="bold" 
                  mb={4}
                  color="white"
                >
                  Our Impact in Numbers
                </Heading>
                <Text 
                  color="whiteAlpha.900" 
                  maxW="800px" 
                  mx="auto"
                  fontSize={{ base: 'md', md: 'lg' }}
                >
                  Join millions of learners who are already achieving their goals with our 
                  unique approach to skill development and micro-learning.
                </Text>
              </Box>
              
              <SimpleGrid 
                columns={{ base: 1, sm: 2, md: 4 }} 
                spacing={{ base: 10, md: 5 }} 
                maxW="1200px" 
                mx="auto" 
                w="full"
              >
                <StatCard 
                  isVisible={statsVisible}
                  icon={FaUsers} 
                  accentColor="purple.300"
                  value={1250000} 
                  label="Active Learners" 
                  delay={0}
                />
                <StatCard 
                  isVisible={statsVisible}
                  icon={BiBookOpen} 
                  accentColor="blue.300"
                  value={5840} 
                  label="Learning Paths" 
                  delay={0.2}
                />
                <StatCard 
                  isVisible={statsVisible}
                  icon={GiBrain} 
                  accentColor="green.300"
                  value={15200000} 
                  label="Sprints Completed" 
                  delay={0.4}
                />
                <StatCard 
                  isVisible={statsVisible}
                  icon={BiAnalyse} 
                  accentColor="yellow.300"
                  value={93} 
                  suffix="%" 
                  label="Completion Rate" 
                  delay={0.6}
                />
          </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={4} w="full">
                <Achievement 
                  isVisible={statsVisible}
                  icon={BiBarChartAlt2}
                  title="84% Skill Growth"
                  description="Average skill improvement after completing learning paths"
                  delay={0.3}
                />
                <Achievement 
                  isVisible={statsVisible}
                  icon={FaLightbulb}
                  title="98% Satisfaction"
                  description="Of our users would recommend SkillSprint to colleagues"
                  delay={0.5}
                />
                <Achievement 
                  isVisible={statsVisible}
                  icon={FaRocket}
                  title="3x Faster Learning"
                  description="Compared to traditional course formats and methods"
                  delay={0.7}
                />
              </SimpleGrid>
            </VStack>
        </Container>
      </Box>
        
        {/* Animated Stat Card Component */}
        const StatCard = ({ icon, accentColor, value, suffix, label, delay, isVisible }) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay }}
          >
            <VStack 
              p={8} 
              borderRadius="xl" 
              bg="whiteAlpha.100"
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              spacing={4}
              height="100%"
              boxShadow="0 10px 30px -5px rgba(0, 0, 0, 0.1)"
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
            >
              <Circle 
                size={14} 
                bg={accentColor} 
                color="white" 
                opacity={0.9}
              >
                <Icon as={icon} boxSize={6} />
              </Circle>
              
              <Box textAlign="center">
                <HStack justify="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color="white">
                  <VisibilitySensor partialVisibility offset={{ bottom: 50 }}>
                    {({ isVisible: isCounterVisible }) => (
                      <Text display="flex" alignItems="baseline">
                        <CountUp 
                          start={0} 
                          end={isVisible && isCounterVisible ? value : 0}
                          duration={2.5}
                          separator=","
                          decimals={value < 100 ? 1 : 0}
                          decimal="."
                        />
                        <Text as="span" ml={1}>{suffix}</Text>
                      </Text>
                    )}
                  </VisibilitySensor>
                </HStack>
                <Text mt={1} color="whiteAlpha.800" fontWeight="medium">{label}</Text>
              </Box>
            </VStack>
          </motion.div>
        );
        
        // Achievement Component
        const Achievement = ({ icon, title, description, delay, isVisible }) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay }}
          >
            <HStack 
              align="start" 
              spacing={4} 
              bg="whiteAlpha.100" 
              p={5} 
              borderRadius="lg"
              border="1px solid"
              borderColor="whiteAlpha.200"
              backdropFilter="blur(8px)"
              transition="transform 0.3s"
              _hover={{ transform: "translateY(-5px)" }}
            >
              <Circle size={10} bg="whiteAlpha.300" color="white">
                <Icon as={icon} boxSize={5} />
              </Circle>
              <Box>
                <Text color="white" fontWeight="bold" fontSize="lg" mb={1}>{title}</Text>
                <Text color="whiteAlpha.800" fontSize="sm">{description}</Text>
              </Box>
            </HStack>
          </motion.div>
        );

      {/* Features Section */}
        <Box 
          py={24} 
          position="relative" 
          overflow="hidden" 
          bg={useColorModeValue('white', 'gray.900')}
          ref={featuresRef}
        >
          {/* Background decoration */}
          <Box
            position="absolute"
            top="5%"
            right="-10%"
            width="600px"
            height="600px"
            borderRadius="full"
            bg={useColorModeValue('purple.50', 'purple.900')}
            opacity={useColorModeValue('0.3', '0.1')}
            filter="blur(80px)"
            zIndex={1}
          />
          <Box
            position="absolute"
            bottom="-10%"
            left="-5%"
            width="400px"
            height="400px"
            borderRadius="full"
            bg={useColorModeValue('blue.50', 'blue.900')}
            opacity={useColorModeValue('0.4', '0.1')}
            filter="blur(80px)"
            zIndex={1}
          />
          
          <Container maxW={'7xl'} position="relative" zIndex={2}>
            <VStack spacing={16}>
              <Box textAlign="center" maxW="800px" mx="auto">
                <Badge 
                  px={3} 
                  py={1} 
                  mb={3} 
                  colorScheme="purple" 
                  fontSize="sm" 
                  borderRadius="full"
                  boxShadow="sm"
                >
                  Powerful Features
                </Badge>
                <Heading
                  as={motion.h2}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
                  bgGradient="linear(to-r, primary.500, secondary.500)"
                  bgClip="text"
              mb={5}
            >
              Everything you need to master new skills
                </Heading>
            <Text 
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontSize={{ base: 'md', md: 'lg' }}
            >
                  Our AI-powered platform adapts to your learning style, delivering personalized 
                  micro-lessons that fit perfectly into your busy schedule.
            </Text>
          </Box>

              <Grid 
                templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
                gap={10}
                w="100%"
              >
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={FaRocket}
                  title="Adaptive Micro-Learning"
                  description="Short, engaging 5-15 minute sessions that adapt to your skill level in real-time."
                  gradient="linear(to-r, purple.400, purple.600)"
                  delay={0}
                />
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={GiArtificialIntelligence}
                  title="AI-Curated Pathways"
                  description="Personalized learning roadmaps based on your goals, existing skills, and learning style."
                  gradient="linear(to-r, blue.400, blue.600)"
                  delay={0.2}
                />
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={GiMagnifyingGlass}
                  title="24/7 AI Tutor"
                  description="Get answers, explanations, and guidance from your personal AI tutor anytime."
                  gradient="linear(to-r, teal.400, teal.600)"
                  delay={0.4}
                />
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={RepeatIcon}
                  title="Spaced Repetition"
                  description="Automatically scheduled review sessions at optimal intervals for maximum retention."
                  gradient="linear(to-r, green.400, green.600)"
                  delay={0.3}
                />
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={FaChartLine}
                  title="Progress Tracking"
                  description="Comprehensive visual analytics that track your skill mastery and identify areas for improvement."
                  gradient="linear(to-r, yellow.400, yellow.600)"
                  delay={0.5}
                />
                <FeatureCard
                  isVisible={featuresVisible}
                  icon={FaMobileAlt}
                  title="Cross-Platform Access"
                  description="Seamless learning across all your devices, with offline mode for on-the-go learning."
                  gradient="linear(to-r, orange.400, orange.600)"
                  delay={0.7}
                />
              </Grid>
              
              <FeatureShowcase isVisible={featuresVisible} />
            </VStack>
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
            }}
            px={8}
            fontSize="md"
            fontWeight="bold"
            leftIcon={<CheckCircleIcon />}
          >
            Start Learning for Free
          </Button>
        </Container>
      </Box>
    </Box>
    </ParallaxProvider>
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
        <Avatar size="sm" src={avatar} name={name} />
        <Box>
          <Text fontWeight="bold">{name}</Text>
          <Text fontSize="sm" color="gray.500">{role}</Text>
        </Box>
      </HStack>
    </VStack>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, gradient, delay, isVisible }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
    transition={{ duration: 0.7, delay }}
    style={{ height: '100%' }}
  >
    <Box
      p={8}
      borderRadius="2xl"
      boxShadow="xl"
      bg={useColorModeValue('white', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      position="relative"
      overflow="hidden"
      height="100%"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: "translateY(-10px)", boxShadow: "2xl" }}
    >
      <Box 
        position="absolute" 
        top="-20px" 
        left="-20px" 
        width="120px" 
        height="120px" 
        bgGradient={gradient} 
        opacity="0.2" 
        borderRadius="full" 
        zIndex={1} 
      />
      <Box position="relative" zIndex={2}>
        <Circle 
          size={14} 
          bgGradient={gradient} 
          color="white" 
          mb={5}
        >
          <Icon as={icon} boxSize={6} />
        </Circle>
        <Heading size="md" fontWeight="bold" mb={4}>{title}</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>{description}</Text>
      </Box>
    </Box>
  </motion.div>
);

// Feature Showcase Component
const FeatureShowcase = ({ isVisible }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
    transition={{ duration: 1.2, delay: 0.8 }}
    style={{ width: '100%' }}
  >
    <Box
      p={{ base: 4, md: 10 }}
      borderRadius="2xl"
      bg={useColorModeValue('gray.50', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="xl"
      overflow="hidden"
      position="relative"
    >
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="center">
        <GridItem>
          <VStack align="start" spacing={6}>
            <Heading 
              size="lg" 
              bgGradient="linear(to-r, primary.500, secondary.500)"
              bgClip="text"
            >
              Learn Faster with AI-Powered Recommendations
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg">
              Our AI analyzes your learning patterns and adapts content in real-time to match your 
              optimal learning style. Experience personalized education like never before.
            </Text>
            <List spacing={3}>
              {[
                'Customized learning paths based on your progress',
                'Adaptive difficulty level that grows with you',
                'Focus on areas where you need the most improvement',
                'Learning strategies optimized for your cognitive style'
              ].map((item, i) => (
                <ListItem key={i}>
                  <HStack align="start">
                    <ListIcon as={CheckCircleIcon} color="primary.500" mt={1} />
                    <Text>{item}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
            <Button
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              size="lg"
              colorScheme="primary"
              rightIcon={<ArrowForwardIcon />}
              as={RouterLink}
              to="/how-it-works"
            >
              See How It Works
            </Button>
          </VStack>
        </GridItem>
        <GridItem position="relative">
          <Box
            borderRadius="xl"
            overflow="hidden"
            boxShadow="2xl"
            bg={useColorModeValue('white', 'gray.700')}
            p={1}
          >
            <Box borderRadius="lg" overflow="hidden">
              <AspectRatio ratio={16/9}>
                <Image
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2074"
                  alt="AI Recommendations Dashboard"
                  objectFit="cover"
                />
              </AspectRatio>
            </Box>
            <HStack spacing={4} p={4} alignItems="center">
              <Circle size={12} bg="primary.500" color="white">
                <Icon as={GiArtificialIntelligence} boxSize={6} />
              </Circle>
              <Box>
                <Text fontWeight="bold">Skill Sprint AI™</Text>
                <Text fontSize="sm" color="gray.500">Personalized Learning System</Text>
              </Box>
            </HStack>
          </Box>
          
          {/* Floating elements */}
          <Box
            position="absolute"
            top="-15px"
            right="-15px"
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="lg"
            borderRadius="lg"
            p={3}
            maxW="180px"
            zIndex={2}
            animation={floatAnimation}
          >
            <HStack spacing={3}>
              <Circle size={8} bg="green.100" color="green.500">
                <Icon as={CheckCircleIcon} />
              </Circle>
              <Text fontWeight="medium" fontSize="sm">
                95% better results than traditional courses
              </Text>
            </HStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  </motion.div>
);

export default HomePage;