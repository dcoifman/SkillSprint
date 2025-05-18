import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Progress,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Divider,
} from '@chakra-ui/react';
import {
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiClipboard,
  FiMessageCircle,
} from 'react-icons/fi';

const DevicePreview = ({ children, device }) => {
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          maxW: '375px',
          h: '667px',
          mx: 'auto',
        };
      case 'tablet':
        return {
          maxW: '768px',
          h: '1024px',
          mx: 'auto',
        };
      default:
        return {
          maxW: '100%',
          h: 'auto',
        };
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      {...getDeviceStyles()}
    >
      {children}
    </Box>
  );
};

const AccessibilityChecker = ({ issues }) => {
  return (
    <List spacing={3}>
      {issues.map((issue, index) => (
        <ListItem key={index}>
          <HStack>
            <ListIcon 
              as={issue.severity === 'error' ? FiAlertCircle : FiCheckCircle}
              color={issue.severity === 'error' ? 'red.500' : 'green.500'}
            />
            <Box>
              <Text fontWeight="medium">{issue.title}</Text>
              <Text fontSize="sm" color="gray.600">{issue.description}</Text>
            </Box>
          </HStack>
        </ListItem>
      ))}
    </List>
  );
};

const CoursePreview = ({ course }) => {
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSprint, setCurrentSprint] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Mock accessibility issues
  const accessibilityIssues = [
    {
      severity: 'error',
      title: 'Missing alt text',
      description: 'Image in module 2 is missing alternative text'
    },
    {
      severity: 'warning',
      title: 'Color contrast',
      description: 'Text in sprint 3 has insufficient color contrast'
    },
    {
      severity: 'success',
      title: 'Keyboard navigation',
      description: 'All interactive elements are keyboard accessible'
    }
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Course Preview</Heading>
            <Text color="gray.600">Preview your course as a student</Text>
          </Box>
          
          <HStack>
            <Button
              leftIcon={<FiClipboard />}
              onClick={onOpen}
              variant="outline"
            >
              Accessibility Check
            </Button>
            
            <HStack 
              spacing={2} 
              p={2} 
              borderWidth="1px" 
              borderRadius="md"
            >
              <Tooltip label="Desktop view">
                <IconButton
                  icon={<FiMonitor />}
                  aria-label="Desktop view"
                  variant={selectedDevice === 'desktop' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedDevice('desktop')}
                />
              </Tooltip>
              
              <Tooltip label="Tablet view">
                <IconButton
                  icon={<FiTablet />}
                  aria-label="Tablet view"
                  variant={selectedDevice === 'tablet' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedDevice('tablet')}
                />
              </Tooltip>
              
              <Tooltip label="Mobile view">
                <IconButton
                  icon={<FiSmartphone />}
                  aria-label="Mobile view"
                  variant={selectedDevice === 'mobile' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedDevice('mobile')}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </HStack>

        <DevicePreview device={selectedDevice}>
          <Box bg={bgColor} h="100%" overflow="auto">
            <VStack spacing={6} align="stretch" p={4}>
              <Box>
                <Heading size="md">{course.title}</Heading>
                <Text color="gray.600">{course.description}</Text>
                
                <HStack mt={4} spacing={4}>
                  <Badge colorScheme="purple">{course.level}</Badge>
                  <Badge colorScheme="blue">{course.duration}</Badge>
                  <Badge colorScheme="green">{course.modules.length} Modules</Badge>
                </HStack>
              </Box>
              
              <Progress value={30} size="sm" colorScheme="purple" />
              
              <Tabs variant="enclosed" colorScheme="purple">
                <TabList>
                  <Tab>Content</Tab>
                  <Tab>Notes</Tab>
                  <Tab>Resources</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {course.modules.map((module, moduleIndex) => (
                        <Box 
                          key={moduleIndex}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          bg={currentModule === moduleIndex ? 'purple.50' : 'transparent'}
                        >
                          <HStack justify="space-between" mb={2}>
                            <Heading size="sm">{module.title}</Heading>
                            <Badge>{module.sprints.length} sprints</Badge>
                          </HStack>
                          
                          <Text fontSize="sm" mb={4}>{module.description}</Text>
                          
                          <VStack align="stretch">
                            {module.sprints.map((sprint, sprintIndex) => (
                              <HStack 
                                key={sprintIndex}
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={
                                  currentModule === moduleIndex && 
                                  currentSprint === sprintIndex 
                                    ? 'white' 
                                    : 'transparent'
                                }
                              >
                                <Box flex={1}>
                                  <Text fontWeight="medium">{sprint.title}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {sprint.duration}
                                  </Text>
                                </Box>
                                
                                <IconButton
                                  icon={<FiEye />}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentModule(moduleIndex);
                                    setCurrentSprint(sprintIndex);
                                  }}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    <Text>Your notes will appear here...</Text>
                  </TabPanel>
                  
                  <TabPanel>
                    <Text>Course resources will appear here...</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </Box>
        </DevicePreview>
      </VStack>

      {/* Accessibility Checker Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack>
              <FiClipboard />
              <Text>Accessibility Check</Text>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="sm" mb={2}>Overview</Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="green">
                    {accessibilityIssues.filter(i => i.severity === 'success').length} Passed
                  </Badge>
                  <Badge colorScheme="red">
                    {accessibilityIssues.filter(i => i.severity === 'error').length} Errors
                  </Badge>
                  <Badge colorScheme="yellow">
                    {accessibilityIssues.filter(i => i.severity === 'warning').length} Warnings
                  </Badge>
                </HStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Heading size="sm" mb={4}>Issues Found</Heading>
                <AccessibilityChecker issues={accessibilityIssues} />
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default CoursePreview; 