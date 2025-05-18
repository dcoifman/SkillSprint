import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data generators
const generateEngagementData = (days) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    views: Math.floor(Math.random() * 100) + 50,
    completions: Math.floor(Math.random() * 30) + 10,
    timeSpent: Math.floor(Math.random() * 60) + 30,
  }));
};

const generateModuleCompletionData = (modules) => {
  return modules.map(module => ({
    name: module.title,
    completed: Math.floor(Math.random() * 100),
    avgTime: Math.floor(Math.random() * 45) + 15,
  }));
};

const COLORS = ['#553C9A', '#805AD5', '#B794F4', '#D6BCFA'];

const CourseAnalytics = ({ courseId, course }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [engagementData, setEngagementData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const cardBg = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    // In a real app, fetch data from API
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    setEngagementData(generateEngagementData(days));
    setModuleData(generateModuleCompletionData(course.modules));
  }, [timeRange, course.modules]);

  const aggregateStats = {
    totalStudents: 450,
    activeStudents: 380,
    averageCompletion: 68,
    averageRating: 4.5,
    studentGrowth: 12,
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Course Analytics</Heading>
            <Text color="gray.600">
              Performance metrics and insights for {course.title}
            </Text>
          </Box>
          
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            width="200px"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
        </HStack>

        {/* Key Metrics */}
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Students</StatLabel>
                <StatNumber>{aggregateStats.totalStudents}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {aggregateStats.studentGrowth}% growth
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Active Students</StatLabel>
                <StatNumber>{aggregateStats.activeStudents}</StatNumber>
                <StatHelpText>
                  {Math.round((aggregateStats.activeStudents / aggregateStats.totalStudents) * 100)}% engagement
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Average Completion</StatLabel>
                <StatNumber>{aggregateStats.averageCompletion}%</StatNumber>
                <StatHelpText>
                  Across all modules
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Average Rating</StatLabel>
                <StatNumber>{aggregateStats.averageRating}/5.0</StatNumber>
                <StatHelpText>
                  From student feedback
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Engagement Trends */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Engagement Trends</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#553C9A" 
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#805AD5" 
                    name="Completions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="#B794F4" 
                    name="Avg. Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Module Performance */}
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Module Completion Rates</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="completed" 
                      fill="#553C9A" 
                      name="Completion Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Average Time per Module</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="avgTime" 
                      fill="#805AD5" 
                      name="Average Time (min)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </Grid>

        {/* Detailed Module Stats */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Module Statistics</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Module</Th>
                  <Th>Completion Rate</Th>
                  <Th>Avg. Time</Th>
                  <Th>Student Rating</Th>
                  <Th>Difficulty</Th>
                </Tr>
              </Thead>
              <Tbody>
                {moduleData.map((module, index) => (
                  <Tr key={index}>
                    <Td>{module.name}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Progress 
                          value={module.completed} 
                          size="sm" 
                          width="100px"
                          colorScheme="purple"
                        />
                        <Text>{module.completed}%</Text>
                      </HStack>
                    </Td>
                    <Td>{module.avgTime} min</Td>
                    <Td>
                      {Math.round(Math.random() * 2 + 3)}.{Math.round(Math.random() * 9)}/5.0
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          module.avgTime > 35 ? 'red' : 
                          module.avgTime > 25 ? 'yellow' : 
                          'green'
                        }
                      >
                        {module.avgTime > 35 ? 'Hard' : 
                         module.avgTime > 25 ? 'Medium' : 
                         'Easy'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CourseAnalytics; 