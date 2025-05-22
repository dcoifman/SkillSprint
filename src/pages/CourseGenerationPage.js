import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Progress,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  IconButton,
  Button,
  useToast,
  useColorModeValue,
  Flex,
  Spacer,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiEye, 
  FiDownload, 
  FiTrash2, 
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle
} from 'react-icons/fi';
import { supabase } from '../services/supabaseClient.js';
import { formatRelative } from 'date-fns';

// Status badge component with appropriate colors
const StatusBadge = ({ status }) => {
  let color;
  let icon;
  
  switch (status) {
    case 'pending':
      color = 'yellow';
      icon = <FiClock />;
      break;
    case 'processing':
      color = 'blue';
      icon = <FiPlayCircle />;
      break;
    case 'completed':
      color = 'green';
      icon = <FiCheckCircle />;
      break;
    case 'failed':
      color = 'red';
      icon = <FiAlertCircle />;
      break;
    default:
      color = 'gray';
      icon = <FiClock />;
  }
  
  return (
    <Badge colorScheme={color} display="flex" alignItems="center" gap={1} px={2} py={1} borderRadius="md">
      {icon}
      <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </Badge>
  );
};

const CourseGenerationPage = () => {
  const [generationRequests, setGenerationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('var(--surface-color)', 'gray.800'); // Use CSS var for light mode
  const cardBgColor = useColorModeValue('white', 'gray.700'); // Slightly different for cards if needed, or same as bgColor
  const highlightColor = useColorModeValue('blue.50', 'blue.700'); // Adjusted dark mode for better contrast
  const primaryColor = useColorModeValue('var(--primary-color)', 'blue.300'); // CSS var for light, Chakra for dark
  const textColorLight = useColorModeValue('var(--text-light-color)', 'gray.400');

  // Function to fetch all course generation requests
  const fetchGenerationRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_generation_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setGenerationRequests(data || []);
    } catch (error) {
      console.error('Error fetching course generation requests:', error);
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Set up real-time subscription for updates
  useEffect(() => {
    fetchGenerationRequests();
    
    // Subscribe to changes
    const channel = supabase
      .channel('course-gen-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_generation_requests'
      }, (payload) => {
        // Update the list or individual item
        if (payload.eventType === 'INSERT') {
          setGenerationRequests(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setGenerationRequests(prev => 
            prev.map(req => req.id === payload.new.id ? payload.new : req)
          );
        } else if (payload.eventType === 'DELETE') {
          setGenerationRequests(prev => 
            prev.filter(req => req.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // View details of a specific request
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    onOpen();
  };
  
  // Delete a request
  const deleteRequest = async (id) => {
    try {
      const { error } = await supabase
        .from('course_generation_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Request deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Update local state
      setGenerationRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error deleting request',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Download course data as JSON
  const downloadCourseData = (request) => {
    if (!request.course_data) {
      toast({
        title: 'No data available',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const dataStr = JSON.stringify(request.course_data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `course-${request.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Box>
            <Heading size="lg" color={useColorModeValue('var(--text-color)', 'white')}>Course Generation Dashboard</Heading>
            <Text color={textColorLight}>Monitor and manage your AI-generated course content</Text>
          </Box>
          <Spacer />
          <Tooltip label="Refresh data" placement="top">
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Refresh"
              onClick={fetchGenerationRequests}
              isLoading={loading}
              colorScheme="blue" // Align with primary color
              variant="outline"
            />
          </Tooltip>
        </HStack>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}> {/* Increased spacing slightly */}
          <Stat bg={cardBgColor} p={5} borderRadius="lg" boxShadow="var(--shadow-md)"> {/* Use CSS var for shadow */}
            <StatLabel color={textColorLight}>Total Requests</StatLabel>
            <StatNumber color={useColorModeValue('var(--text-color)', 'white')}>{generationRequests.length}</StatNumber>
          </Stat>
          
          <Stat bg={cardBgColor} p={5} borderRadius="lg" boxShadow="var(--shadow-md)"> {/* Use CSS var for shadow */}
            <StatLabel color={textColorLight}>Completed</StatLabel>
            <StatNumber color={useColorModeValue('var(--text-color)', 'white')}>
              {generationRequests.filter(req => req.status === 'completed').length}
            </StatNumber>
          </Stat>
          
          <Stat bg={cardBgColor} p={5} borderRadius="lg" boxShadow="var(--shadow-md)"> {/* Use CSS var for shadow */}
            <StatLabel color={textColorLight}>In Progress</StatLabel>
            <StatNumber color={useColorModeValue('var(--text-color)', 'white')}>
              {generationRequests.filter(req => req.status === 'pending' || req.status === 'processing').length}
            </StatNumber>
          </Stat>
        </SimpleGrid>
        
        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" thickness="4px" color={primaryColor} speed="0.65s" />
          </Flex>
        ) : generationRequests.length > 0 ? (
          <VStack spacing={5} align="stretch"> {/* Increased spacing */}
            {generationRequests.map(request => (
              <Card 
                key={request.id} 
                bg={cardBgColor} 
                boxShadow="var(--shadow-md)" // Use CSS var for shadow
                _hover={{ boxShadow: "var(--shadow-lg)", transform: "translateY(-4px)" }} // Use CSS vars
                transition="var(--transition-base)" // Use CSS var
                position="relative"
                borderRadius="var(--border-radius-lg)" // Use CSS var
              >
                <CardHeader pb={2}> {/* Adjusted padding */}
                  <HStack>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" noOfLines={1} color={useColorModeValue('var(--text-color)', 'white')}>
                        {request.request_data?.topic || 'Untitled Course'}
                      </Heading>
                      <Text fontSize="sm" color={textColorLight}>
                        Created {formatRelative(new Date(request.created_at), new Date())}
                      </Text>
                    </VStack>
                    <Spacer />
                    <StatusBadge status={request.status} />
                  </HStack>
                </CardHeader>
                
                <CardBody py={4}>
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={3}> {/* Increased spacing */}
                      <Tag size="sm" colorScheme="teal" variant="subtle"> {/* Using a color from our palette */}
                        {request.request_data?.audience || 'General audience'}
                      </Tag>
                      <Tag size="sm" colorScheme="orange" variant="subtle"> {/* Using a color from our palette */}
                        {request.request_data?.level || 'All levels'}
                      </Tag>
                      <Tag size="sm" colorScheme="blue" variant="subtle"> {/* Using a color from our palette */}
                        {request.request_data?.duration || 'Variable duration'}
                      </Tag>
                    </HStack>
                    
                    <Box pt={2}> {/* Added padding top */}
                      <Text fontSize="sm" mb={1} color={textColorLight}>
                        {request.status_message || 'Waiting to start...'}
                      </Text>
                      <Progress 
                        value={request.progress || 0} 
                        size="md" // Slightly larger progress bar
                        colorScheme={
                          request.status === 'completed' ? 'green' :
                          request.status === 'failed' ? 'red' : 
                          request.status === 'processing' ? 'blue' : 'yellow' // Ensure pending also has a color
                        }
                        borderRadius="var(--border-radius-md)" // Use CSS var
                        hasStripe={request.status === 'processing'}
                        isAnimated={request.status === 'processing'}
                      />
                    </Box>
                  </VStack>
                </CardBody>
                
                <Divider color={useColorModeValue('gray.200', 'gray.600')} />
                
                <CardFooter>
                  <HStack spacing={3}> {/* Increased spacing */}
                    <Button
                      leftIcon={<FiEye />}
                      size="sm" // Keep sm for density, or md for easier clicks
                      colorScheme="blue" // Primary action
                      onClick={() => viewRequestDetails(request)}
                    >
                      View Details
                    </Button>
                    
                    <Tooltip label={request.content_generated ? 'Download course data' : 'No data available'} placement="top">
                      <IconButton
                        icon={<FiDownload />}
                        aria-label="Download"
                        size="sm"
                        colorScheme="gray" // Secondary action
                        variant="outline"
                        isDisabled={!request.content_generated}
                        onClick={() => downloadCourseData(request)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Delete request" placement="top">
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="red"
                        variant="ghost" // Ghost for less emphasis on destructive
                        onClick={() => deleteRequest(request.id)}
                      />
                    </Tooltip>
                  </HStack>
                </CardFooter>
              </Card>
            ))}
          </VStack>
        ) : (
          <Box 
            textAlign="center" 
            py={10} 
            bg={cardBgColor} 
            borderRadius="var(--border-radius-lg)" // Use CSS var
            boxShadow="var(--shadow-md)" // Use CSS var
          >
            <Heading size="md" color={useColorModeValue('var(--text-color)', 'white')} mb={2}>No course generation requests found</Heading>
            <Text color={textColorLight}>
              Start by creating a new course to see generation requests here
            </Text>
          </Box>
        )}
      </VStack>
      
      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered> {/* Changed size to 2xl & centered */}
        <ModalOverlay bg="blackAlpha.400" /> {/* Darker overlay */}
        <ModalContent bg={bgColor} borderRadius="var(--border-radius-lg)" boxShadow="var(--shadow-lg)"> {/* Use CSS Vars */}
          <ModalHeader borderTopRadius="var(--border-radius-lg)"> {/* Ensure radius is applied if bg is different */}
            <Heading size="lg" color={useColorModeValue('var(--text-color)', 'white')}>
              {selectedRequest?.request_data?.topic || 'Course Details'}
            </Heading>
            <Text fontSize="xs" color={textColorLight} mt={1}>
              ID: {selectedRequest?.id}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}> {/* Increased padding */}
            {selectedRequest && (
              <VStack spacing={6} align="stretch"> {/* Increased spacing */}
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="var(--border-radius-md)">
                  <Heading size="sm" mb={3} color={useColorModeValue('var(--text-color)', 'white')}>Status</Heading>
                  <HStack alignItems="center">
                    <StatusBadge status={selectedRequest.status} />
                    <Text fontSize="sm" color={textColorLight}>{selectedRequest.status_message}</Text>
                  </HStack>
                  <Progress 
                    value={selectedRequest.progress || 0} 
                    size="md" // Slightly larger
                    mt={3} // Increased margin top
                    colorScheme={
                      selectedRequest.status === 'completed' ? 'green' :
                      selectedRequest.status === 'failed' ? 'red' : 
                      selectedRequest.status === 'processing' ? 'blue' : 'yellow'
                    }
                    borderRadius="var(--border-radius-md)" // Use CSS var
                    hasStripe={selectedRequest.status === 'processing'}
                    isAnimated={selectedRequest.status === 'processing'}
                  />
                </Box>
                
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="var(--border-radius-md)">
                  <Heading size="sm" mb={3} color={useColorModeValue('var(--text-color)', 'white')}>Request Information</Heading>
                  <SimpleGrid columns={{base: 1, md: 2}} spacingY={3} spacingX={5}> {/* Adjusted spacing */}
                    <Box>
                      <Text fontWeight="medium" color={textColorLight}>Topic</Text>
                      <Text color={useColorModeValue('var(--text-color)', 'white')}>{selectedRequest.request_data?.topic || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color={textColorLight}>Audience</Text>
                      <Text color={useColorModeValue('var(--text-color)', 'white')}>{selectedRequest.request_data?.audience || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color={textColorLight}>Level</Text>
                      <Text color={useColorModeValue('var(--text-color)', 'white')}>{selectedRequest.request_data?.level || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color={textColorLight}>Duration</Text>
                      <Text color={useColorModeValue('var(--text-color)', 'white')}>{selectedRequest.request_data?.duration || 'Not specified'}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="var(--border-radius-md)">
                  <Heading size="sm" mb={3} color={useColorModeValue('var(--text-color)', 'white')}>Learning Goals</Heading>
                  <Text color={useColorModeValue('var(--text-color)', 'white')}>{selectedRequest.request_data?.goals || 'No goals specified'}</Text>
                </Box>
                
                {selectedRequest.error_message && (
                  <Box bg="red.100" p={4} borderRadius="var(--border-radius-md)"> {/* Use a lighter red, more padding */}
                    <HStack>
                      <FiAlertCircle color="var(--error-color)" />
                      <Heading size="sm" color="var(--error-color)">Error</Heading>
                    </HStack>
                    <Text color="red.700" mt={2}>{selectedRequest.error_message}</Text>
                  </Box>
                )}
                
                {selectedRequest.content_generated && selectedRequest.course_data && (
                  <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="var(--border-radius-md)">
                    <Heading size="sm" mb={3} color={useColorModeValue('var(--text-color)', 'white')}>Generated Course Structure</Heading>
                    <VStack align="stretch" spacing={4}> {/* Increased spacing */}
                      <Box p={4} bg={highlightColor} borderRadius="var(--border-radius-md)" shadow="sm">
                        <Heading size="md" color={useColorModeValue('blue.800', 'blue.50')}>{selectedRequest.course_data.course?.title}</Heading>
                        <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.100')} mt={1}>{selectedRequest.course_data.course?.description}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={useColorModeValue('var(--text-color)', 'white')}>Learning Objectives</Text>
                        <VStack align="stretch" mt={2} spacing={1}>
                          {selectedRequest.course_data.course?.learningObjectives?.map((objective, i) => (
                            <HStack key={i} alignItems="flex-start">
                              <Text color={textColorLight}>•</Text>
                              <Text fontSize="sm" color={textColorLight}>{objective}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="semibold" color={useColorModeValue('var(--text-color)', 'white')}>Modules ({selectedRequest.course_data.course?.modules?.length || 0})</Text>
                        <VStack align="stretch" mt={2} spacing={3}> {/* Increased spacing */}
                          {selectedRequest.course_data.course?.modules?.map((module, i) => (
                            <Box key={i} p={3} borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} borderRadius="var(--border-radius-md)" _hover={{borderColor: 'var(--primary-color)'}} transition="var(--transition-fast)">
                              <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color={primaryColor}>{module.title}</Heading>
                              <Text fontSize="sm" color={textColorLight} mt={1}>{module.description}</Text>
                              <Text fontSize="xs" color={textColorLight} mt={2} fontWeight="medium">
                                {module.sprints?.length || 0} sprints
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            {selectedRequest?.content_generated && (
              <Button 
                leftIcon={<FiDownload />} 
                colorScheme="blue" 
                mr={3}
                onClick={() => downloadCourseData(selectedRequest)}
              >
                Download JSON
              </Button>
            )}
            <Button 
              onClick={onClose} 
              variant="outline" 
              colorScheme="gray"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CourseGenerationPage; 