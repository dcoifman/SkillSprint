import React, { useState, useEffect } from 'react';
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
  Container,
  Icon,
  VStack,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Tag,
  TagLabel,
  TagLeftIcon,
  Image,
  AvatarBadge,
  Skeleton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AddIcon, 
  CheckIcon, 
  TimeIcon, 
  StarIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  BellIcon,
  InfoIcon,
  ArrowForwardIcon,
  AtSignIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext.js';
import { motion } from 'framer-motion';
import CourseInvitationsComponent from '../components/CourseInvitationsComponent.js';
import { getInstructorProfile } from '../services/supabaseClient.js';
import PersonalizedPathsSection from '../components/PersonalizedPathsSection.js';
import { supabase } from '../services/supabaseClient.js';

// Motion components for animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isInstructor, setIsInstructor] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: user?.user_metadata?.full_name || 'Learner',
    avatar: user?.user_metadata?.avatar_url,
    streak: 0,
    completedSprints: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    activePaths: 0,
    recentActivity: null,
    joined: new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Fetch user stats from Supabase
        const { data: stats, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (stats) {
          setUserInfo(prev => ({
            ...prev,
            streak: stats.streak || 0,
            completedSprints: stats.completed_sprints || 0,
            level: stats.level || 1,
            xp: stats.xp || 0,
            nextLevelXp: stats.next_level_xp || 1000,
            activePaths: stats.active_paths || 0,
            recentActivity: stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : null
          }));
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
  }, [user]);

  // Cards and text styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gradientBg = useColorModeValue(
    'linear(to-r, purple.500, blue.500)',
    'linear(to-r, purple.400, blue.400)'
  );
  
  const progressPercent = Math.round((userInfo.xp / userInfo.nextLevelXp) * 100);

  return (
    <Container maxW="7xl" py={8}>
      {/* User welcome section with gradient background */}
      <MotionBox
        mb={8}
        p={6}
        borderRadius="xl"
        bgGradient={gradientBg}
        boxShadow="lg"
        color="white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }}>
          <Flex align="center">
            <Skeleton isLoaded={!loading} borderRadius="full">
              <Avatar 
                size="xl" 
                name={userInfo.name} 
                src={userInfo.avatar}
                boxShadow="md"
                border="3px solid white"
              >
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
            </Skeleton>
            
            <Box ml={4}>
              <Skeleton isLoaded={!loading} mb={2}>
                <Heading as="h1" size="xl">
                  Welcome back, {userInfo.name}!
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={!loading}>
                <HStack spacing={4}>
                  <Tag size="md" variant="subtle" colorScheme="whiteAlpha">
                    <TagLeftIcon as={CalendarIcon} />
                    <TagLabel>Member since {userInfo.joined}</TagLabel>
                  </Tag>
                  <Tag size="md" variant="subtle" colorScheme="whiteAlpha">
                    <TagLeftIcon as={TimeIcon} />
                    <TagLabel>Active {userInfo.recentActivity}</TagLabel>
                  </Tag>
                </HStack>
              </Skeleton>
            </Box>
          </Flex>
          
          <Flex mt={{ base: 4, md: 0 }}>
            {isInstructor ? (
              <>
                <Tooltip label="Manage instructor profile" placement="top">
                  <RouterLink to="/instructor-profile">
                    <Button 
                      colorScheme="whiteAlpha" 
                      leftIcon={<AtSignIcon />}
                      mr={2}
                    >
                      Instructor Profile
                    </Button>
                  </RouterLink>
                </Tooltip>
                <Tooltip label="Create new course" placement="top">
                  <RouterLink to="/course-builder">
                    <Button 
                      colorScheme="whiteAlpha" 
                      leftIcon={<AddIcon />}
                      mr={2}
                    >
                      Create Course
                    </Button>
                  </RouterLink>
                </Tooltip>
              </>
            ) : (
              <Tooltip label="Become an instructor" placement="top">
                <RouterLink to="/instructor-profile">
                  <Button 
                    colorScheme="whiteAlpha" 
                    leftIcon={<StarIcon />}
                    mr={2}
                  >
                    Become Instructor
                  </Button>
                </RouterLink>
              </Tooltip>
            )}
            
            <Tooltip label="View notifications" placement="top">
              <IconButton
                icon={<BellIcon />}
                colorScheme="whiteAlpha"
                variant="outline"
                aria-label="View notifications"
                onClick={onOpen}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </MotionBox>

      {/* Level progress bar */}
      <MotionBox
        mb={8}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Flex align="center" mb={2}>
          <Heading size="md" mr={2}>Level {userInfo.level}</Heading>
          <Tooltip label={`${userInfo.xp} / ${userInfo.nextLevelXp} XP to next level`}>
            <InfoIcon color={accentColor} />
          </Tooltip>
        </Flex>
        <Skeleton isLoaded={!loading}>
          <Progress 
            value={progressPercent} 
            colorScheme="purple" 
            size="md" 
            borderRadius="full" 
            hasStripe
            isAnimated
            height="16px"
            sx={{
              "& > div:first-of-type": {
                transitionProperty: "width",
                transitionDuration: "slow"
              }
            }}
          />
        </Skeleton>
        <Flex justify="space-between" mt={1}>
          <Text fontSize="sm" color={textColor}>{userInfo.xp} XP</Text>
          <Text fontSize="sm" color={textColor}>{userInfo.nextLevelXp} XP</Text>
        </Flex>
      </MotionBox>

      {/* Stats Section - Animated and Enhanced */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            <Skeleton isLoaded={!loading}>
              <VStack spacing={3} align="flex-start">
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="purple.100"
                  color="purple.500"
                  boxSize="50px"
                >
                  <Icon as={RepeatIcon} boxSize="24px" />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={textColor}>Daily Streak</Text>
                  <Flex align="center">
                    <Heading size="xl" mr={1}>{userInfo.streak}</Heading>
                    <Text fontSize="xl">days</Text>
                  </Flex>
                  <Text fontSize="xs" color={textColor} fontWeight="medium">Keep it going!</Text>
                </Box>
              </VStack>
            </Skeleton>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            <Skeleton isLoaded={!loading}>
              <VStack spacing={3} align="flex-start">
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="green.100"
                  color="green.500"
                  boxSize="50px"
                >
                  <Icon as={CheckIcon} boxSize="24px" />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={textColor}>Completed Sprints</Text>
                  <Heading size="xl">{userInfo.completedSprints}</Heading>
                  <Text fontSize="xs" color={textColor} fontWeight="medium">+3 this week</Text>
                </Box>
              </VStack>
            </Skeleton>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            <Skeleton isLoaded={!loading}>
              <VStack spacing={3} align="flex-start">
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="yellow.100"
                  color="yellow.500"
                  boxSize="50px"
                >
                  <Icon as={StarIcon} boxSize="24px" />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={textColor}>XP Points</Text>
                  <Heading size="xl">{userInfo.xp}</Heading>
                  <Text fontSize="xs" color={textColor} fontWeight="medium">
                    {userInfo.nextLevelXp - userInfo.xp} until next level
                  </Text>
                </Box>
              </VStack>
            </Skeleton>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            <Skeleton isLoaded={!loading}>
              <VStack spacing={3} align="flex-start">
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.500"
                  boxSize="50px"
                >
                  <Icon as={AtSignIcon} boxSize="24px" />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={textColor}>Active Paths</Text>
                  <Heading size="xl">{userInfo.activePaths}</Heading>
                  <Text fontSize="xs" color={textColor} fontWeight="medium">Skills in progress</Text>
                </Box>
              </VStack>
            </Skeleton>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* Personalized Learning Paths Section */}
      <Box mb={8}>
        <PersonalizedPathsSection />
      </Box>

      {/* Continue Learning section */}
      <Heading as="h2" size="lg" mb={6}>
        Continue Learning
      </Heading>

      {/* Learning Paths Progress - Enhanced with hover effects */}
      <Box mb={10}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Your Learning Paths</Heading>
          <Button 
            as={RouterLink} 
            to="/explore" 
            variant="ghost" 
            colorScheme="purple"
            rightIcon={<ArrowForwardIcon />}
            size="sm"
          >
            Explore more paths
          </Button>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {/* Path Card 1 */}
          <MotionCard
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -5, boxShadow: "lg" }}
          >
            <Box h="120px" bg="purple.500" position="relative">
              <Box 
                position="absolute" 
                bottom="-20px" 
                left="20px" 
                bg="blue.500" 
                borderRadius="lg" 
                boxSize="48px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                boxShadow="md"
              >
                <Icon as={InfoIcon} color="white" boxSize="24px" />
              </Box>
            </Box>
            
            <CardHeader pt={8} pb={2}>
              <Heading size="md">Machine Learning Fundamentals</Heading>
            </CardHeader>
            
            <CardBody py={2}>
              <Skeleton isLoaded={!loading} mb={2}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium">Progress</Text>
                  <Text>65%</Text>
                </Flex>
                <Progress value={65} colorScheme="purple" size="sm" borderRadius="full" mb={4} />
                
                <Text fontWeight="medium" mb={1}>Next Sprint:</Text>
                <Text color={textColor}>Neural Networks Basics</Text>
                <Flex align="center" mt={1} color={textColor}>
                  <TimeIcon mr={2} />
                  <Text>12 min</Text>
                </Flex>
              </Skeleton>
            </CardBody>
            
            <CardFooter pt={2}>
              <Button 
                as={RouterLink} 
                to="/sprint/101" 
                colorScheme="purple" 
                rightIcon={<ChevronRightIcon />}
                variant="solid"
                size="md"
                width="full"
              >
                Continue
              </Button>
            </CardFooter>
          </MotionCard>
          
          {/* Path Card 2 */}
          <MotionCard
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -5, boxShadow: "lg" }}
          >
            <Box h="120px" bg="blue.500" position="relative">
              <Box 
                position="absolute" 
                bottom="-20px" 
                left="20px" 
                bg="green.500" 
                borderRadius="lg" 
                boxSize="48px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                boxShadow="md"
              >
                <Icon as={InfoIcon} color="white" boxSize="24px" />
              </Box>
            </Box>
            
            <CardHeader pt={8} pb={2}>
              <Heading size="md">Web Development with React</Heading>
            </CardHeader>
            
            <CardBody py={2}>
              <Skeleton isLoaded={!loading} mb={2}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium">Progress</Text>
                  <Text>30%</Text>
                </Flex>
                <Progress value={30} colorScheme="blue" size="sm" borderRadius="full" mb={4} />
                
                <Text fontWeight="medium" mb={1}>Next Sprint:</Text>
                <Text color={textColor}>React Hooks Deep Dive</Text>
                <Flex align="center" mt={1} color={textColor}>
                  <TimeIcon mr={2} />
                  <Text>8 min</Text>
                </Flex>
              </Skeleton>
            </CardBody>
            
            <CardFooter pt={2}>
              <Button 
                as={RouterLink} 
                to="/sprint/102" 
                colorScheme="blue" 
                rightIcon={<ChevronRightIcon />}
                variant="solid"
                size="md"
                width="full"
              >
                Continue
              </Button>
            </CardFooter>
          </MotionCard>
          
          {/* Path Card 3 */}
          <MotionCard
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ y: -5, boxShadow: "lg" }}
          >
            <Box h="120px" bg="green.500" position="relative">
              <Box 
                position="absolute" 
                bottom="-20px" 
                left="20px" 
                bg="purple.500" 
                borderRadius="lg" 
                boxSize="48px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                boxShadow="md"
              >
                <Icon as={InfoIcon} color="white" boxSize="24px" />
              </Box>
            </Box>
            
            <CardHeader pt={8} pb={2}>
              <Heading size="md">Business Communication</Heading>
            </CardHeader>
            
            <CardBody py={2}>
              <Skeleton isLoaded={!loading} mb={2}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium">Progress</Text>
                  <Text>90%</Text>
                </Flex>
                <Progress value={90} colorScheme="green" size="sm" borderRadius="full" mb={4} />
                
                <Text fontWeight="medium" mb={1}>Next Sprint:</Text>
                <Text color={textColor}>Persuasive Presentations</Text>
                <Flex align="center" mt={1} color={textColor}>
                  <TimeIcon mr={2} />
                  <Text>15 min</Text>
                </Flex>
              </Skeleton>
            </CardBody>
            
            <CardFooter pt={2}>
              <Button 
                as={RouterLink} 
                to="/sprint/103" 
                colorScheme="green" 
                rightIcon={<ChevronRightIcon />}
                variant="solid"
                size="md"
                width="full"
              >
                Continue
              </Button>
            </CardFooter>
          </MotionCard>
          
          {/* Path Card 4 */}
          <MotionCard
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ y: -5, boxShadow: "lg" }}
          >
            <Box h="120px" bg="orange.500" position="relative">
              <Box 
                position="absolute" 
                bottom="-20px" 
                left="20px" 
                bg="blue.500" 
                borderRadius="lg" 
                boxSize="48px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                boxShadow="md"
              >
                <Icon as={InfoIcon} color="white" boxSize="24px" />
              </Box>
            </Box>
            
            <CardHeader pt={8} pb={2}>
              <Heading size="md">Functional Anatomy</Heading>
            </CardHeader>
            
            <CardBody py={2}>
              <Skeleton isLoaded={!loading} mb={2}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium">Progress</Text>
                  <Text>15%</Text>
                </Flex>
                <Progress value={15} colorScheme="orange" size="sm" borderRadius="full" mb={4} />
                
                <Text fontWeight="medium" mb={1}>Next Sprint:</Text>
                <Text color={textColor}>Skeletal System Basics</Text>
                <Flex align="center" mt={1} color={textColor}>
                  <TimeIcon mr={2} />
                  <Text>10 min</Text>
                </Flex>
              </Skeleton>
            </CardBody>
            
            <CardFooter pt={2}>
              <Button 
                as={RouterLink} 
                to="/sprint/201" 
                colorScheme="orange" 
                rightIcon={<ChevronRightIcon />}
                variant="solid"
                size="md"
                width="full"
              >
                Continue
              </Button>
            </CardFooter>
          </MotionCard>
        </SimpleGrid>
      </Box>

      {/* Recent and Recommended Sections with enhanced styling */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Recent Sprints */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Recent Sprints</Heading>
            <RouterLink to="/profile">
              <Button size="sm" variant="ghost" colorScheme="purple">
                View all
              </Button>
            </RouterLink>
          </Flex>
          
          <Card
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            {/* Sprint 1 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Introduction to Artificial Neural Networks</Text>
                    <Flex align="center" color={textColor} mt={1}>
                      <Icon as={TimeIcon} mr={1} />
                      <Text fontSize="sm">2 hours ago • 12 min</Text>
                    </Flex>
                  </Box>
                  <Badge
                    colorScheme="green"
                    fontSize="0.9em"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    95%
                  </Badge>
                </Flex>
              </Box>
            </Skeleton>
            
            <Divider />
            
            {/* Sprint 2 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">React Components and Props</Text>
                    <Flex align="center" color={textColor} mt={1}>
                      <Icon as={TimeIcon} mr={1} />
                      <Text fontSize="sm">Yesterday • 8 min</Text>
                    </Flex>
                  </Box>
                  <Badge
                    colorScheme="yellow"
                    fontSize="0.9em"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    88%
                  </Badge>
                </Flex>
              </Box>
            </Skeleton>
            
            <Divider />
            
            {/* Sprint 3 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Introduction to Functional Anatomy</Text>
                    <Flex align="center" color={textColor} mt={1}>
                      <Icon as={TimeIcon} mr={1} />
                      <Text fontSize="sm">Today • 10 min</Text>
                    </Flex>
                  </Box>
                  <Badge
                    colorScheme="green"
                    fontSize="0.9em"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                  >
                    100%
                  </Badge>
                </Flex>
              </Box>
            </Skeleton>
          </Card>
        </MotionBox>

        {/* Recommended Sprints */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Recommended for You</Heading>
            <RouterLink to="/explore-paths">
              <Button size="sm" variant="ghost" colorScheme="purple">
                View all
              </Button>
            </RouterLink>
          </Flex>
          
          <Card
            bg={cardBg}
            shadow="md"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorder}
            overflow="hidden"
          >
            {/* Recommendation 1 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Deep Learning: Convolutional Networks</Text>
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="purple" variant="subtle">Machine Learning</Badge>
                      <Flex align="center" color={textColor}>
                        <Icon as={TimeIcon} mr={1} />
                        <Text fontSize="sm">10 min</Text>
                      </Flex>
                    </HStack>
                  </Box>
                  <RouterLink to="/sprint/101">
                    <Button colorScheme="purple" size="sm">
                      Start
                    </Button>
                  </RouterLink>
                </Flex>
              </Box>
            </Skeleton>
            
            <Divider />
            
            {/* Recommendation 2 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">React State Management</Text>
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="blue" variant="subtle">Web Development</Badge>
                      <Flex align="center" color={textColor}>
                        <Icon as={TimeIcon} mr={1} />
                        <Text fontSize="sm">12 min</Text>
                      </Flex>
                    </HStack>
                  </Box>
                  <RouterLink to="/sprint/102">
                    <Button colorScheme="purple" size="sm">
                      Start
                    </Button>
                  </RouterLink>
                </Flex>
              </Box>
            </Skeleton>
            
            <Divider />
            
            {/* Recommendation 3 */}
            <Skeleton isLoaded={!loading}>
              <Box p={4} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Skeletal System Basics</Text>
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="orange" variant="subtle">Anatomy</Badge>
                      <Flex align="center" color={textColor}>
                        <Icon as={TimeIcon} mr={1} />
                        <Text fontSize="sm">10 min</Text>
                      </Flex>
                    </HStack>
                  </Box>
                  <RouterLink to="/sprint/202">
                    <Button colorScheme="purple" size="sm">
                      Start
                    </Button>
                  </RouterLink>
                </Flex>
              </Box>
            </Skeleton>
          </Card>
        </MotionBox>
      </SimpleGrid>
      
      {/* Course Invitations Section */}
      <Skeleton isLoaded={!loading}>
        <MotionCard
          mb={8}
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          bg={cardBg}
          boxShadow="sm"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardBody>
            <CourseInvitationsComponent />
          </CardBody>
        </MotionCard>
      </Skeleton>
      
      {/* Notifications Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Notifications</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Flex p={3} bg="green.50" borderRadius="md">
                <Icon as={CheckIcon} color="green.500" boxSize={5} mr={3} mt={0.5} />
                <Box>
                  <Text fontWeight="bold">Sprint Completed</Text>
                  <Text fontSize="sm">You've completed "Introduction to Functional Anatomy" with a perfect score!</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>2 hours ago</Text>
                </Box>
              </Flex>
              
              <Flex p={3} bg="blue.50" borderRadius="md">
                <Icon as={InfoIcon} color="blue.500" boxSize={5} mr={3} mt={0.5} />
                <Box>
                  <Text fontWeight="bold">New Course Available</Text>
                  <Text fontSize="sm">Check out the new "Advanced Data Structures" course.</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>Yesterday</Text>
                </Box>
              </Flex>
              
              <Flex p={3} bg="purple.50" borderRadius="md">
                <Icon as={StarIcon} color="purple.500" boxSize={5} mr={3} mt={0.5} />
                <Box>
                  <Text fontWeight="bold">Achievement Unlocked</Text>
                  <Text fontSize="sm">You've earned the "7-Day Streak" badge!</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>2 days ago</Text>
                </Box>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={onClose}>
              Mark all as read
            </Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default DashboardPage; 