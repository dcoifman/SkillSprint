import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getInstructorProfile, 
  updateInstructorProfile, 
  getMyInstructorCourses,
  sendCourseToStudent
} from '../services/supabaseClient';

function InstructorProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    avatar: ''
  });
  
  // For send course modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadInstructorData();
  }, [user]);

  const loadInstructorData = async () => {
    setIsLoading(true);
    try {
      // Fetch instructor profile
      const { data: profileData, error: profileError } = await getInstructorProfile();
      
      if (profileError) {
        console.error('Error loading instructor profile:', profileError);
      } else {
        setProfile(profileData);
        if (profileData) {
          setFormData({
            name: profileData.name || '',
            title: profileData.title || '',
            bio: profileData.bio || '',
            avatar: profileData.avatar || ''
          });
        }
      }
      
      // Fetch instructor courses
      const { data: coursesData, error: coursesError } = await getMyInstructorCourses();
      
      if (coursesError) {
        console.error('Error loading instructor courses:', coursesError);
      } else {
        setCourses(coursesData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const { data, error } = await updateInstructorProfile(formData);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setProfile(data);
        toast({
          title: 'Success',
          description: 'Instructor profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendCourse = (course) => {
    setSelectedCourse(course);
    setStudentEmail('');
    setEmailError('');
    onOpen();
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendSubmit = async () => {
    // Validate email
    if (!studentEmail) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(studentEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSending(true);
    try {
      const { error } = await sendCourseToStudent(selectedCourse.id, studentEmail);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send course invitation',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Course invitation sent successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error sending course:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8} centerContent>
        <Text>Loading instructor profile...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Instructor Profile</Tab>
          <Tab>My Courses</Tab>
        </TabList>
        
        <TabPanels>
          {/* Instructor Profile Tab */}
          <TabPanel p={0} pt={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {/* Left Column - Current Profile */}
              <Box gridColumn="span 1">
                <Card mb={4} boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="md">Current Profile</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="center">
                      <Avatar
                        size="2xl"
                        src={profile?.avatar || user?.user_metadata?.avatar_url}
                        name={profile?.name || user?.user_metadata?.full_name || user?.email || 'Instructor'}
                      />
                      <Box textAlign="center">
                        <Heading size="md">{profile?.name || user?.user_metadata?.full_name || 'New Instructor'}</Heading>
                        {profile?.title && <Text color="gray.500">{profile.title}</Text>}
                      </Box>
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                        Instructor
                      </Badge>
                    </VStack>
                    
                    {profile?.bio && (
                      <Box mt={4}>
                        <Text fontSize="sm" fontWeight="medium">Biography:</Text>
                        <Text fontSize="sm">{profile.bio}</Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>
                
                <Card boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="sm">Instructor Stats</Heading>
                  </CardHeader>
                  <CardBody pt={2}>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text>Created Courses</Text>
                        <Text fontWeight="bold">{courses.length}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Total Students</Text>
                        <Text fontWeight="bold">
                          {courses.reduce((total, course) => total + (course.students_count || 0), 0)}
                        </Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
              
              {/* Right Column - Edit Profile Form */}
              <Box gridColumn="span 2">
                <Card boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="md">Edit Instructor Profile</Heading>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSubmit}>
                      <VStack spacing={6} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Your instructor name"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Input
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </FormControl>
                        </SimpleGrid>
                        
                        <FormControl>
                          <FormLabel>Profile Image URL</FormLabel>
                          <Input
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleInputChange}
                            placeholder="https://example.com/your-image.jpg"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell students about your expertise and teaching style"
                            rows={5}
                          />
                        </FormControl>
                        
                        <Box pt={4}>
                          <Button 
                            type="submit" 
                            colorScheme="purple" 
                            isLoading={isUpdating}
                            loadingText="Updating"
                          >
                            Save Profile
                          </Button>
                        </Box>
                      </VStack>
                    </form>
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </TabPanel>
          
          {/* My Courses Tab */}
          <TabPanel p={0} pt={6}>
            <Box mb={6}>
              <Heading size="lg" mb={2}>My Courses</Heading>
              <Text color="gray.600" mb={4}>
                Manage and share the courses you've created
              </Text>
              <Button 
                colorScheme="purple" 
                onClick={() => navigate('/course-builder')}
              >
                Create New Course
              </Button>
            </Box>
            
            {courses.length === 0 ? (
              <Box 
                p={10} 
                textAlign="center" 
                borderWidth={1} 
                borderRadius="lg"
                borderStyle="dashed"
              >
                <Heading size="md" mb={4} color="gray.500">
                  You haven't created any courses yet
                </Heading>
                <Text mb={6}>
                  Start creating engaging learning experiences for your students!
                </Text>
                <Button 
                  colorScheme="purple" 
                  onClick={() => navigate('/course-builder')}
                >
                  Create Your First Course
                </Button>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {courses.map(course => (
                  <Card key={course.id} boxShadow="sm">
                    <CardHeader pb={0}>
                      <VStack align="stretch" spacing={1}>
                        <Heading size="md" noOfLines={2}>
                          {course.title}
                        </Heading>
                        <HStack>
                          <Badge colorScheme="blue">{course.level}</Badge>
                          <Badge colorScheme="green">{course.category}</Badge>
                        </HStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <Text noOfLines={3} mb={4} fontSize="sm">
                        {course.description}
                      </Text>
                      
                      <Divider mb={4} />
                      
                      <VStack align="stretch" spacing={2} mb={4}>
                        <Flex justify="space-between">
                          <Text fontSize="sm">Students:</Text>
                          <Text fontSize="sm" fontWeight="bold">{course.students_count || 0}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fontSize="sm">Sprints:</Text>
                          <Text fontSize="sm" fontWeight="bold">{course.total_sprints || 0}</Text>
                        </Flex>
                      </VStack>
                      
                      <HStack spacing={2}>
                        <Button 
                          size="sm" 
                          colorScheme="purple" 
                          variant="outline"
                          onClick={() => navigate(`/path/${course.id}`)}
                          flex={1}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          colorScheme="purple"
                          onClick={() => handleSendCourse(course)}
                          flex={1}
                        >
                          Send to Student
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Send Course Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Course to Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCourse && (
              <>
                <Text mb={4}>
                  You are about to send <strong>{selectedCourse.title}</strong> to a student.
                </Text>
                
                <FormControl isInvalid={!!emailError} isRequired>
                  <FormLabel>Student Email</FormLabel>
                  <Input 
                    value={studentEmail}
                    onChange={(e) => {
                      setStudentEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="student@example.com"
                  />
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} isDisabled={isSending}>
              Cancel
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleSendSubmit}
              isLoading={isSending}
              loadingText="Sending"
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default InstructorProfilePage; 