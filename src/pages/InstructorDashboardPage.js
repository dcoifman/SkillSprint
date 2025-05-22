import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  Select,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext.js';
import supabaseClient, {
  fetchCourseEnrollmentCount,
  fetchCourseCompletionRate,
  fetchSprintCompletionRatesForCourse,
  fetchStudentProgressOnCourse,
} from '../services/supabaseClient.js';

function InstructorDashboardPage() {
  const { pathId } = useParams();
  const { user } = useAuth();
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [completionDetails, setCompletionDetails] = useState(null);
  const [sprintCompletionData, setSprintCompletionData] = useState([]);
  const [studentProgressData, setStudentProgressData] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(pathId || '');
  const [error, setError] = useState(null);
  const toast = useToast();

  // Fetch instructor's courses
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabaseClient
          .from('learning_paths')
          .select('id, title, description, image_url')
          .eq('instructor_id', user.id);
          
        if (error) throw error;
        
        setInstructorCourses(data || []);
        
        // If no course is selected but instructor has courses, select the first one
        if (!selectedCourseId && data && data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching instructor courses:', err);
        toast({
          title: 'Error fetching your courses',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchInstructorCourses();
  }, [user, toast]);

  // Fetch course data when selected course changes
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!selectedCourseId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch basic path info
        const { data: pathData, error: pathError } = await supabaseClient
          .from('learning_paths')
          .select('*')
          .eq('id', selectedCourseId)
          .single();
          
        if (pathError) throw pathError;
        setPath(pathData);
        
        // Fetch enrollment count
        const { count, error: enrollmentError } = await fetchCourseEnrollmentCount(selectedCourseId);
        if (enrollmentError) throw enrollmentError;
        setEnrollmentCount(count);
        
        // Fetch completion rate
        const { completionRate: rate, error: completionError, ...details } = 
          await fetchCourseCompletionRate(selectedCourseId);
        if (completionError) throw completionError;
        setCompletionRate(rate);
        setCompletionDetails(details);
        
        // Fetch sprint completion data
        const { data: sprintData, error: sprintError } = 
          await fetchSprintCompletionRatesForCourse(selectedCourseId);
        if (sprintError) throw sprintError;
        setSprintCompletionData(sprintData || []);
        
        // Fetch student progress data
        const { data: studentData, error: studentError } = 
          await fetchStudentProgressOnCourse(selectedCourseId);
        if (studentError) throw studentError;
        setStudentProgressData(studentData || []);
        
      } catch (err) {
        console.error('Error fetching course analytics:', err);
        setError(err.message || 'Error loading analytics data');
        toast({
          title: 'Error loading analytics',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [selectedCourseId, toast]);

  // Group sprint data by modules for visualization
  const moduleGroupedData = React.useMemo(() => {
    const moduleGroups = {};
    
    sprintCompletionData.forEach(sprint => {
      if (!moduleGroups[sprint.moduleTitle]) {
        moduleGroups[sprint.moduleTitle] = {
          name: sprint.moduleTitle,
          sprints: [],
          averageCompletionRate: 0,
        };
      }
      
      moduleGroups[sprint.moduleTitle].sprints.push(sprint);
    });
    
    // Calculate average completion rate for each module
    Object.values(moduleGroups).forEach(module => {
      if (module.sprints.length > 0) {
        const sum = module.sprints.reduce((acc, sprint) => acc + sprint.completionRate, 0);
        module.averageCompletionRate = Math.round(sum / module.sprints.length);
      }
    });
    
    return Object.values(moduleGroups);
  }, [sprintCompletionData]);

  // Format data for bar chart
  const chartData = React.useMemo(() => {
    return sprintCompletionData.map(sprint => ({
      name: sprint.title.length > 15 ? `${sprint.title.substring(0, 15)}...` : sprint.title,
      completionRate: sprint.completionRate,
      moduleTitle: sprint.moduleTitle,
    }));
  }, [sprintCompletionData]);

  // Calculate student progress statistics
  const studentStats = React.useMemo(() => {
    if (studentProgressData.length === 0) {
      return { active: 0, completed: 0, atRisk: 0 };
    }
    
    const completed = studentProgressData.filter(s => s.progressPercent === 100).length;
    const atRisk = studentProgressData.filter(s => s.progressPercent < 30).length;
    const active = studentProgressData.length - completed - atRisk;
    
    return { active, completed, atRisk };
  }, [studentProgressData]);

  if (instructorCourses.length === 0 && !isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="xl">Instructor Dashboard</Heading>
          <Alert 
            status="info" 
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              No Courses Found
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              You don't have any courses as an instructor yet. 
              Create a course to start seeing analytics.
            </AlertDescription>
            <Button 
              as={RouterLink}
              to="/course-builder"
              colorScheme="purple"
              mt={4}
            >
              Create a Course
            </Button>
          </Alert>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="xl">Instructor Dashboard</Heading>
          <Button 
            as={RouterLink}
            to="/course-builder"
            colorScheme="purple"
            size="sm"
          >
            Create New Course
          </Button>
        </HStack>
        
        {instructorCourses.length > 0 && (
          <Box>
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              placeholder="Select a course"
              mb={4}
            >
              {instructorCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </Box>
        )}
        
        {isLoading ? (
          <Center h="400px">
            <VStack>
              <Spinner size="xl" color="purple.500" />
              <Text mt={4}>Loading analytics...</Text>
            </VStack>
          </Center>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs colorScheme="purple" isLazy>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Sprint Analysis</Tab>
              <Tab>Student Progress</Tab>
            </TabList>
            
            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                  {/* Enrollment Card */}
                  <Stat
                    px={6}
                    py={4}
                    shadow="md"
                    borderWidth={1}
                    borderRadius="lg"
                    bg="white"
                  >
                    <StatLabel fontSize="md" fontWeight="medium">Total Enrollment</StatLabel>
                    <StatNumber fontSize="3xl">{enrollmentCount}</StatNumber>
                    <StatHelpText>Students enrolled</StatHelpText>
                  </Stat>
                  
                  {/* Completion Rate Card */}
                  <Stat
                    px={6}
                    py={4}
                    shadow="md"
                    borderWidth={1}
                    borderRadius="lg"
                    bg="white"
                  >
                    <StatLabel fontSize="md" fontWeight="medium">Completion Rate</StatLabel>
                    <StatNumber fontSize="3xl">{completionRate}%</StatNumber>
                    <StatHelpText>
                      {completionDetails?.totalCompletions || 0} of {completionDetails?.totalPossibleCompletions || 0} sprints
                    </StatHelpText>
                  </Stat>
                  
                  {/* Student Status Card */}
                  <Stat
                    px={6}
                    py={4}
                    shadow="md"
                    borderWidth={1}
                    borderRadius="lg"
                    bg="white"
                  >
                    <StatLabel fontSize="md" fontWeight="medium">Student Status</StatLabel>
                    <HStack spacing={2} mt={2}>
                      <Badge colorScheme="green" py={1} px={2} borderRadius="md">
                        {studentStats.completed} Completed
                      </Badge>
                      <Badge colorScheme="blue" py={1} px={2} borderRadius="md">
                        {studentStats.active} Active
                      </Badge>
                      <Badge colorScheme="red" py={1} px={2} borderRadius="md">
                        {studentStats.atRisk} At Risk
                      </Badge>
                    </HStack>
                    <StatHelpText>Student distribution</StatHelpText>
                  </Stat>
                </SimpleGrid>
                
                <Box
                  mt={8}
                  p={6}
                  shadow="md"
                  borderWidth={1}
                  borderRadius="lg"
                  bg="white"
                  height="400px"
                >
                  <Heading size="md" mb={4}>Module Completion Overview</Heading>
                  {moduleGroupedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        data={moduleGroupedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Bar 
                          dataKey="averageCompletionRate" 
                          name="Completion Rate" 
                          fill="#805AD5" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="100%">
                      <Text>No module data available</Text>
                    </Center>
                  )}
                </Box>
              </TabPanel>
              
              {/* Sprint Analysis Tab */}
              <TabPanel>
                <Box
                  mb={8}
                  p={6}
                  shadow="md"
                  borderWidth={1}
                  borderRadius="lg"
                  bg="white"
                  height="400px"
                >
                  <Heading size="md" mb={4}>Sprint Completion Rates</Heading>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [`${value}%`, 'Completion Rate'];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              return `${payload[0].payload.moduleTitle}: ${payload[0].payload.name}`;
                            }
                            return label;
                          }}
                        />
                        <Bar 
                          dataKey="completionRate" 
                          name="Completion Rate" 
                          fill="#805AD5" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="100%">
                      <Text>No sprint data available</Text>
                    </Center>
                  )}
                </Box>
                
                <Box
                  p={6}
                  shadow="md"
                  borderWidth={1}
                  borderRadius="lg"
                  bg="white"
                  overflowX="auto"
                >
                  <Heading size="md" mb={4}>Sprint Details</Heading>
                  {sprintCompletionData.length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Module</Th>
                          <Th>Sprint</Th>
                          <Th isNumeric>Completion</Th>
                          <Th isNumeric>Students</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sprintCompletionData.map((sprint) => (
                          <Tr key={sprint.id}>
                            <Td>{sprint.moduleTitle}</Td>
                            <Td>{sprint.title}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={2}>
                                <Text>{sprint.completionRate}%</Text>
                                <Box w="100px">
                                  <Progress 
                                    value={sprint.completionRate} 
                                    size="sm"
                                    colorScheme={
                                      sprint.completionRate > 70 ? "green" :
                                      sprint.completionRate > 40 ? "blue" : "red"
                                    }
                                  />
                                </Box>
                              </HStack>
                            </Td>
                            <Td isNumeric>{sprint.completionCount} / {sprint.totalUsers}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No sprint data available</Text>
                  )}
                </Box>
              </TabPanel>
              
              {/* Student Progress Tab */}
              <TabPanel>
                <Box
                  p={6}
                  shadow="md"
                  borderWidth={1}
                  borderRadius="lg"
                  bg="white"
                  overflowX="auto"
                >
                  <Heading size="md" mb={4}>Student Progress</Heading>
                  {studentProgressData.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Student</Th>
                          <Th>Email</Th>
                          <Th>Progress</Th>
                          <Th>Last Activity</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {studentProgressData.map((student) => (
                          <Tr key={student.userId}>
                            <Td>{student.name}</Td>
                            <Td>{student.email}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Text>{student.progressPercent}%</Text>
                                <Box w="100px">
                                  <Progress 
                                    value={student.progressPercent} 
                                    size="sm"
                                    colorScheme={
                                      student.progressPercent === 100 ? "green" :
                                      student.progressPercent > 30 ? "blue" : "red"
                                    }
                                  />
                                </Box>
                                <Text fontSize="sm">
                                  {student.completedCount}/{student.totalSprints}
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              {student.lastActivity 
                                ? new Date(student.lastActivity).toLocaleDateString() 
                                : 'Never'}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  student.progressPercent === 100 ? "green" :
                                  student.progressPercent > 30 ? "blue" : "red"
                                }
                              >
                                {student.progressPercent === 100 ? "Completed" :
                                 student.progressPercent > 30 ? "Active" : "At Risk"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No student data available</Text>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Container>
  );
}

export default InstructorDashboardPage; 