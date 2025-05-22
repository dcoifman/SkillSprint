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
  Spinner,
  Center,
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
import { fetchUserEnrolledPathsWithProgress, fetchUserStats, fetchUserEnrolledPathsWithNextSprint, fetchRecentSprints } from '../services/supabaseClient.js';

// Motion components for animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isInstructor, setIsInstructor] = useState(false);
  const [enrolledPaths, setEnrolledPaths] = useState([]);
  const [loadingEnrolledPaths, setLoadingEnrolledPaths] = useState(true);
  const [recentSprints, setRecentSprints] = useState([]);
  const [loadingRecentSprints, setLoadingRecentSprints] = useState(true);
  
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
    const fetchUserStatsAndPaths = async () => {
      if (!user) return;

      setLoading(true); // Set loading true for the entire section

      try {
        // Fetch user stats
        const { data: stats, error: statsError } = await fetchUserStats();
        if (statsError) throw statsError;

        if (stats) {
          setUserInfo(prev => ({
            ...prev,
            streak: stats.streak || 0,
            completedSprints: stats.completed_sprints || 0,
            level: stats.level || 1,
            xp: stats.xp || 0,
            nextLevelXp: stats.next_level_xp || 1000,
            // activePaths will be calculated from enrolledPaths
            recentActivity: stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : null
          }));
        }

        // Fetch enrolled paths
        const { data: enrolledData, error: enrolledError } = await fetchUserEnrolledPathsWithProgress();
        if (enrolledError) throw enrolledError;

        setEnrolledPaths(enrolledData || []);
        setUserInfo(prev => ({ ...prev, activePaths: enrolledData?.length || 0 }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Optionally show a toast or error message
      } finally {
        setLoading(false); // Set loading false after fetching both
      }
    };

    fetchUserStatsAndPaths();
  }, [user]);

  useEffect(() => {
    const loadRecentSprints = async () => {
      if (!user) {
        setLoadingRecentSprints(false);
        return;
      }

      setLoadingRecentSprints(true);
      try {
        const { data, error } = await fetchRecentSprints();
        if (error) throw error;
        setRecentSprints(data || []);
      } catch (error) {
        console.error('Error fetching recent sprints:', error);
      } finally {
        setLoadingRecentSprints(false);
      }
    };

    loadRecentSprints();
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

      {/* Stats Section - Enhanced UI */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
        {/* Daily Streak */}
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
            {loading ? (
              <VStack spacing={3} align="flex-start">
                <Skeleton boxSize="50px" borderRadius="full" />
                <Box>
                  <Skeleton height="14px" width="80px" mb={2} />
                  <Skeleton height="24px" width="120px" />
                  <Skeleton height="12px" width="100px" mt={1} />
                </Box>
              </VStack>
            ) : (
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
                  <Text fontSize="xs" color={textColor} fontWeight="medium">Keep the learning momentum!</Text>
                </Box>
              </VStack>
            )}
          </CardBody>
        </MotionCard>

        {/* Completed Sprints */}
        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} /* Delay relative to previous card */
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            {loading ? (
              <VStack spacing={3} align="flex-start">
                <Skeleton boxSize="50px" borderRadius="full" />
                <Box>
                  <Skeleton height="14px" width="100px" mb={2} />
                  <Skeleton height="24px" width="80px" />
                  <Skeleton height="12px" width="120px" mt={1} />
                </Box>
              </VStack>
            ) : (
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
                  <Text fontSize="xs" color={textColor} fontWeight="medium">Great progress!</Text>
                </Box>
              </VStack>
            )}
          </CardBody>
        </MotionCard>

        {/* XP Points */}
        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} /* Delay relative to previous card */
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            {loading ? (
              <VStack spacing={3} align="flex-start">
                <Skeleton boxSize="50px" borderRadius="full" />
                <Box>
                  <Skeleton height="14px" width="80px" mb={2} />
                  <Skeleton height="24px" width="100px" />
                  <Skeleton height="12px" width="150px" mt={1} />
                </Box>
              </VStack>
            ) : (
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
                  <Text fontSize="xs" color={textColor} fontWeight="medium">{userInfo.nextLevelXp - userInfo.xp} until Level {userInfo.level + 1}</Text>
                </Box>
              </VStack>
            )}
          </CardBody>
        </MotionCard>

        {/* Active Paths */}
        <MotionCard
          bg={cardBg}
          shadow="md"
          borderWidth="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} /* Delay relative to previous card */
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ y: -5, boxShadow: "lg" }}
        >
          <CardBody>
            {loading ? (
              <VStack spacing={3} align="flex-start">
                <Skeleton boxSize="50px" borderRadius="full" />
                <Box>
                  <Skeleton height="14px" width="90px" mb={2} />
                  <Skeleton height="24px" width="50px" />
                  <Skeleton height="12px" width="100px" mt={1} />
                </Box>
              </VStack>
            ) : (
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
            )}
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
        
        {loadingEnrolledPaths ? (
          <Center py={10}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text ml={4}>Loading your learning paths...</Text>
          </Center>
        ) : enrolledPaths.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color={textColor} mb={4}>You haven't enrolled in any learning paths yet.</Text>
            <Button as={RouterLink} to="/explore" colorScheme="purple">
              Browse Paths
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {enrolledPaths.map((path) => (
              <MotionCard
                key={path.id}
                bg={cardBg}
                shadow="md"
                borderRadius="lg"
                borderWidth="1px"
                borderColor={cardBorder}
                overflow="hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }} /* Delay relative to previous card in grid */
                transition={{ duration: 0.3, delay: 0.2 + (enrolledPaths.indexOf(path) * 0.05) }} /* Stagger delay */
                whileHover={{ y: -5, boxShadow: "lg" }}
              >
                <Box h="120px" bg={`${path.category}.500`} position="relative">
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
                  <Heading size="md">{path.title}</Heading>
                </CardHeader>
                
                <CardBody py={2}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">Progress</Text>
                    <Text>{path.progress}%</Text>
                  </Flex>
                  <Progress value={path.progress} colorScheme="purple" size="sm" borderRadius="full" mb={4} />
                  
                  <Text fontWeight="medium" mb={1}>Next Sprint:</Text>
                  <Text color={textColor}>Continue where you left off</Text> {/* This needs to be updated with actual next sprint */}
                  <Flex align="center" mt={1} color={textColor}>
                    <TimeIcon mr={2} />
                    <Text>N/A</Text> {/* This needs to be updated with actual next sprint time */}
                  </Flex>
                </CardBody>
                
                <CardFooter pt={2}>
                  <Button 
                    as={RouterLink} 
                    to={`/paths/${path.id}`} /* Link to path detail for now */
                    colorScheme="purple" 
                    rightIcon={<ChevronRightIcon />}
                    variant="solid"
                    size="md"
                    width="full"
                  >
                    Continue Learning
                  </Button>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
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
            {loadingRecentSprints ? (
               <Center py={10}>
                <Spinner size="lg" color="purple.500" thickness="3px" />
               </Center>
            ) : recentSprints.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text color={textColor}>No recent sprint activity.</Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={cardBorder} />}>
                {recentSprints.map((sprint) => (
                  <Box
                    key={sprint.id}
                    p={4}
                    _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} 
                    transition="background 0.2s"
                  >
                     <RouterLink to={`/sprint/${sprint.id}`}>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="bold">{sprint.title}</Text>
                          {sprint.time && (
                             <Flex align="center" color={textColor} mt={1}>
                                <Icon as={TimeIcon} mr={1} />
                                <Text fontSize="sm">{sprint.time}</Text>
                             </Flex>
                          )}
                        </Box>
                        <Button size="sm" colorScheme="purple" variant="outline">Go to Sprint</Button>
                      </Flex>
                     </RouterLink>
                  </Box>
                ))}
              </VStack>
            )}
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