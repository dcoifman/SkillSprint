import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { 
  FiMoreVertical, 
  FiEdit2, 
  FiCopy, 
  FiTrash2, 
  FiPlay,
  FiBarChart2
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

// Course status definitions
const COURSE_STATUS = {
  DRAFT: {
    label: 'Draft',
    color: 'gray'
  },
  GENERATING: {
    label: 'Generating',
    color: 'blue'
  },
  REVIEW: {
    label: 'Review',
    color: 'yellow'
  },
  PUBLISHED: {
    label: 'Published',
    color: 'green'
  }
};

const CourseCard = ({ course, index, onStatusChange }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Draggable draggableId={course.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          bg={cardBg}
          mb={4}
          boxShadow="sm"
        >
          <CardBody>
            <HStack>
              <Box {...provided.dragHandleProps}>
                <DragHandleIcon />
              </Box>
              
              <VStack align="start" flex={1} spacing={2}>
                <Heading size="sm">{course.title}</Heading>
                <Text fontSize="sm" noOfLines={2}>
                  {course.description}
                </Text>
                <HStack>
                  <Badge colorScheme={COURSE_STATUS[course.status].color}>
                    {COURSE_STATUS[course.status].label}
                  </Badge>
                  <Badge>{course.level}</Badge>
                  <Badge>{course.totalModules} modules</Badge>
                </HStack>
                
                <Progress 
                  value={course.completionRate} 
                  size="sm" 
                  width="100%" 
                  colorScheme="purple"
                />
              </VStack>
              
              <VStack>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
                    <MenuItem icon={<FiCopy />}>Duplicate</MenuItem>
                    <MenuItem icon={<FiPlay />}>Preview</MenuItem>
                    <MenuItem icon={<FiBarChart2 />}>Analytics</MenuItem>
                    <MenuItem icon={<FiTrash2 />} color="red.500">Delete</MenuItem>
                  </MenuList>
                </Menu>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </Draggable>
  );
};

const StatusColumn = ({ status, courses, onDrop }) => {
  return (
    <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">
            {COURSE_STATUS[status].label}
          </Heading>
          <Badge colorScheme={COURSE_STATUS[status].color}>
            {courses.length}
          </Badge>
        </HStack>
        
        <Droppable droppableId={status}>
          {(provided) => (
            <VStack
              ref={provided.innerRef}
              {...provided.droppableProps}
              align="stretch"
              spacing={2}
              minH="200px"
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </VStack>
          )}
        </Droppable>
      </VStack>
    </Box>
  );
};

const UnifiedCourseDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    averageCompletion: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // TODO: Fetch courses and stats from API
    // This is placeholder data
    setCourses([
      {
        id: '1',
        title: 'Introduction to React',
        description: 'Learn the basics of React development',
        status: 'PUBLISHED',
        level: 'Beginner',
        totalModules: 5,
        completionRate: 75
      },
      // Add more sample courses...
    ]);
    
    setStats({
      totalCourses: 12,
      publishedCourses: 8,
      totalStudents: 450,
      averageCompletion: 68
    });
  }, []);
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceStatus = result.source.droppableId;
    const destStatus = result.destination.droppableId;
    
    if (sourceStatus === destStatus) {
      // Reorder within same status
      const items = Array.from(courses);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setCourses(items);
    } else {
      // Move to different status
      const items = Array.from(courses);
      const [movedItem] = items.splice(result.source.index, 1);
      movedItem.status = destStatus;
      items.splice(result.destination.index, 0, movedItem);
      setCourses(items);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading>Course Dashboard</Heading>
            <Text color="gray.600">
              Manage and track all your courses in one place
            </Text>
          </Box>
          <Button 
            colorScheme="purple" 
            onClick={() => navigate('/course-builder')}
          >
            Create New Course
          </Button>
        </HStack>
        
        {/* Stats Overview */}
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Courses</StatLabel>
            <StatNumber>{stats.totalCourses}</StatNumber>
            <StatHelpText>
              {stats.publishedCourses} published
            </StatHelpText>
          </Stat>
          
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Students</StatLabel>
            <StatNumber>{stats.totalStudents}</StatNumber>
            <StatHelpText>
              Across all courses
            </StatHelpText>
          </Stat>
          
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Average Completion</StatLabel>
            <StatNumber>{stats.averageCompletion}%</StatNumber>
            <StatHelpText>
              Course completion rate
            </StatHelpText>
          </Stat>
          
          <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Active Courses</StatLabel>
            <StatNumber>
              {courses.filter(c => c.status === 'PUBLISHED').length}
            </StatNumber>
            <StatHelpText>
              Currently active
            </StatHelpText>
          </Stat>
        </Grid>
        
        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid templateColumns="repeat(4, 1fr)" gap={6}>
            {Object.keys(COURSE_STATUS).map(status => (
              <StatusColumn
                key={status}
                status={status}
                courses={courses.filter(c => c.status === status)}
              />
            ))}
          </Grid>
        </DragDropContext>
      </VStack>
    </Container>
  );
};

export default UnifiedCourseDashboard; 