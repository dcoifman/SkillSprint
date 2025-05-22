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
  Icon, // Added for error icons
  UnorderedList, // Added for listing sprint errors
  ListItem, // Added for listing sprint errors
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiEye, 
  FiDownload, 
  FiTrash2, 
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle,
  FiStopCircle, // Added for Cancel button
  FiAlertTriangle // Added for inline sprint error indication
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
  const [selectedRequest, setSelectedRequest] = useState(null); // For details modal
  const { isOpen: isDetailModalOpen, onOpen: onOpenDetailModal, onClose: onCloseDetailModal } = useDisclosure(); // For details modal
  
  // State for cancellation modal
  const [cancellingRequest, setCancellingRequest] = useState(null);
  const { isOpen: isCancelModalOpen, onOpen: onOpenCancelModal, onClose: onCloseCancelModal } = useDisclosure();
  const [isCancelling, setIsCancelling] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');

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
    onOpenDetailModal();
  };

  // Open cancellation confirmation modal
  const handleOpenCancelDialog = (request) => {
    setCancellingRequest(request);
    onOpenCancelModal();
  };

  // Confirm and execute cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingRequest) return;
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-course-generation', {
        body: { requestId: cancellingRequest.id },
      });

      if (error) throw error;

      toast({
        title: 'Cancellation Requested',
        description: data?.message || `Cancellation successfully requested for ${cancellingRequest.id}. Status will update shortly.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: 'Cancellation Error',
        description: error.data?.error || error.message || 'Could not request cancellation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCancelling(false);
      onCloseCancelModal();
      setCancellingRequest(null);
    }
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
            <Heading size="lg">Course Generation Dashboard</Heading>
            <Text color="gray.500">Monitor and manage your AI-generated course content</Text>
          </Box>
          <Spacer />
          <Tooltip label="Refresh data">
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Refresh"
              onClick={fetchGenerationRequests}
              isLoading={loading}
            />
          </Tooltip>
        </HStack>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Total Requests</StatLabel>
            <StatNumber>{generationRequests.length}</StatNumber>
          </Stat>
          
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>Completed</StatLabel>
            <StatNumber>
              {generationRequests.filter(req => req.status === 'completed').length}
            </StatNumber>
          </Stat>
          
          <Stat bg={bgColor} p={4} borderRadius="lg" boxShadow="sm">
            <StatLabel>In Progress</StatLabel>
            <StatNumber>
              {generationRequests.filter(req => req.status === 'pending' || req.status === 'processing').length}
            </StatNumber>
          </Stat>
        </SimpleGrid>
        
        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" thickness="4px" color="blue.500" />
          </Flex>
        ) : generationRequests.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {generationRequests.map(request => (
              <Card key={request.id} bg={bgColor} boxShadow="sm" position="relative">
                <CardHeader pb={0}>
                  <HStack>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" noOfLines={1}>
                        {request.request_data?.topic || 'Untitled Course'}
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        Created {formatRelative(new Date(request.created_at), new Date())}
                      </Text>
                    </VStack>
                    <Spacer />
                    <StatusBadge status={request.status} />
                  </HStack>
                </CardHeader>
                
                <CardBody py={4}>
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Tag size="sm">
                        {request.request_data?.audience || 'General audience'}
                      </Tag>
                      <Tag size="sm">
                        {request.request_data?.level || 'All levels'}
                      </Tag>
                      <Tag size="sm">
                        {request.request_data?.duration || 'Variable duration'}
                      </Tag>
                    </HStack>
                    
                    <Box>
                      <Text fontSize="sm" mb={1}>
                        {request.status_message || 'Waiting to start...'}
                      </Text>
                      <Progress 
                        value={request.progress || 0} 
                        size="sm" 
                        colorScheme={
                          request.status === 'completed' ? 'green' :
                          request.status === 'failed' ? 'red' : 'blue'
                        }
                        borderRadius="full"
                      />
                    </Box>
                  </VStack>
                </CardBody>
                
                <Divider />
                
                <CardFooter>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FiEye />}
                      size="sm"
                      onClick={() => viewRequestDetails(request)}
                    >
                      View Details
                    </Button>
                    
                    <Tooltip label={request.content_generated ? 'Download course data' : 'No data available'}>
                      <IconButton
                        icon={<FiDownload />}
                        aria-label="Download"
                        size="sm"
                        isDisabled={!request.content_generated}
                        onClick={() => downloadCourseData(request)}
                      />
                    </Tooltip>
                    
                    <Tooltip label="Delete request">
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => deleteRequest(request.id)}
                      />
                    </Tooltip>

                    <Tooltip label="Cancel generation">
                       <IconButton
                        icon={<FiStopCircle />}
                        aria-label="Cancel Generation"
                        size="sm"
                        colorScheme="orange"
                        variant="ghost"
                        isDisabled={!(request.status === 'pending' || request.status === 'processing')}
                        onClick={() => handleOpenCancelDialog(request)}
                      />
                    </Tooltip>
                  </HStack>
                </CardFooter>
              </Card>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={10} bg={bgColor} borderRadius="lg" boxShadow="sm">
            <Text fontSize="lg">No course generation requests found</Text>
            <Text color="gray.500">
              Start by creating a new course to see generation requests here
            </Text>
          </Box>
        )}
      </VStack>
      
      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={onCloseDetailModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRequest?.request_data?.topic || 'Course Details'}
            <Text fontSize="sm" fontWeight="normal" color="gray.500">
              {selectedRequest?.id}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={5} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Status</Heading>
                  <HStack>
                    <StatusBadge status={selectedRequest.status} />
                    <Text fontSize="sm">{selectedRequest.status_message}</Text>
                  </HStack>
                  <Progress 
                    value={selectedRequest.progress || 0} 
                    size="sm" 
                    mt={2}
                    colorScheme={
                      selectedRequest.status === 'completed' ? 'green' :
                      selectedRequest.status === 'failed' ? 'red' : 'blue'
                    }
                    borderRadius="full"
                  />
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Request Information</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Topic</Text>
                      <Text>{selectedRequest.request_data?.topic || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Audience</Text>
                      <Text>{selectedRequest.request_data?.audience || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Level</Text>
                      <Text>{selectedRequest.request_data?.level || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Duration</Text>
                      <Text>{selectedRequest.request_data?.duration || 'Not specified'}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Learning Goals</Heading>
                  <Text>{selectedRequest.request_data?.goals || 'No goals specified'}</Text>
                </Box>
                
                {selectedRequest.error_message && (
                  <Box bg="red.50" p={3} borderRadius="md">
                    <Heading size="sm" color="red.500" mb={1}>Error</Heading>
                    <Text color="red.700">{selectedRequest.error_message}</Text>
                  </Box>
                )}

                {/* Display Sprint-Specific Errors */}
                {selectedRequest?.course_data?.generationStats?.sprintErrors?.length > 0 && (
                  <Box mt={2} p={3} bg="orange.50" borderRadius="md">
                    <Heading size="sm" color="orange.700" mb={2}>Sprint Generation Issues</Heading>
                    <UnorderedList spacing={1}>
                      {selectedRequest.course_data.generationStats.sprintErrors.map((err, i) => (
                        <ListItem key={i} fontSize="sm" color="orange.800">{err}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
                
                {selectedRequest.content_generated && selectedRequest.course_data && (
                  <Box>
                    <Heading size="sm" mb={2}>Generated Course Structure</Heading>
                    <VStack align="stretch" spacing={3}>
                      <Box p={3} bg={highlightColor} borderRadius="md">
                        <Text fontWeight="bold">{selectedRequest.course_data.course?.title}</Text>
                        <Text fontSize="sm">{selectedRequest.course_data.course?.description}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold">Learning Objectives</Text>
                        <VStack align="stretch" mt={1}>
                          {selectedRequest.course_data.course?.learningObjectives?.map((objective, i) => (
                            <Text key={i} fontSize="sm">• {objective}</Text>
                          ))}
                        </VStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold">Modules ({selectedRequest.course_data.course?.modules?.length || 0})</Text>
                        <VStack align="stretch" mt={2} spacing={2}>
                          {selectedRequest.course_data.course?.modules?.map((module, moduleIndex) => (
                            <Box key={moduleIndex} p={3} borderWidth="1px" borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
                              <Heading size="xs" mb={2}>{module.title}</Heading>
                              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} mb={3}>{module.description}</Text>
                              <VStack align="stretch" spacing={2}>
                                {module.sprints?.map((sprintOutline, sprintIndex) => {
                                  const sprintKey = `${moduleIndex}-${sprintIndex}`;
                                  const sprintFullContent = selectedRequest.course_data.sprints?.[sprintKey];
                                  
                                  let isFailedSprint = false;
                                  let sprintErrorMessage = '';

                                  if (sprintFullContent?.introduction?.includes("(Content generation error:") || 
                                      sprintFullContent?.quiz?.[0]?.explanation?.includes("placeholder quiz question due to a content generation error")) {
                                    isFailedSprint = true;
                                    sprintErrorMessage = sprintFullContent.introduction; // Contains the error context
                                  }
                                  
                                  // Check against generationStats.sprintErrors for more specific messages
                                  // This is a basic check; more sophisticated mapping might be needed if titles aren't unique
                                  const generalErrorForSprint = selectedRequest.course_data.generationStats?.sprintErrors?.find(
                                    err => err.includes(`Sprint "${sprintOutline.title}" failed`)
                                  );
                                  if(generalErrorForSprint) {
                                    isFailedSprint = true; // Ensure it's marked as failed
                                    // Prefer the general error message if it exists and sprintErrorMessage is still the default intro
                                    if(!sprintErrorMessage.includes("(Content generation error:")) {
                                       sprintErrorMessage = generalErrorForSprint;
                                    } else {
                                       // If both exist, append for more info, or choose one.
                                       // For now, let's assume the intro from placeholder is more specific.
                                    }
                                  }


                                  return (
                                    <Box 
                                      key={sprintIndex} 
                                      p={2} 
                                      borderWidth="1px" 
                                      borderRadius="md" 
                                      bg={isFailedSprint ? useColorModeValue("orange.50", "orange.800") : useColorModeValue("white", "gray.600")}
                                      borderColor={isFailedSprint ? "orange.300" : useColorModeValue("gray.200", "gray.500")}
                                    >
                                      <HStack justifyContent="space-between">
                                        <Text fontWeight="bold" fontSize="sm">
                                          {sprintOutline.title}
                                          {isFailedSprint && <Icon as={FiAlertTriangle} color="orange.500" ml={2} verticalAlign="middle" />}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">{sprintOutline.duration}</Text>
                                      </HStack>
                                      <Text fontSize="xs" color={isFailedSprint ? "orange.600" : "gray.500"} _dark={{ color: isFailedSprint ? "orange.300" : "gray.400" }}>
                                        {sprintOutline.description}
                                      </Text>
                                      {isFailedSprint && sprintErrorMessage && (
                                        <Text fontSize="xs" color="orange.700" _dark={{ color: "orange.200" }} mt={1} whiteSpace="pre-wrap">
                                          {sprintErrorMessage.startsWith("Sprint ") ? sprintErrorMessage.substring(sprintErrorMessage.indexOf("failed: ") + 8) : sprintErrorMessage}
                                        </Text>
                                      )}
                                    </Box>
                                  );
                                })}
                              </VStack>
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
            <Button onClick={onCloseDetailModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={onCloseCancelModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Cancellation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to request cancellation for course:
            </Text>
            <Text fontWeight="bold" mt={2}>
              {cancellingRequest?.request_data?.topic || cancellingRequest?.id || 'Selected Request'}?
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              This action will attempt to stop the generation process.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseCancelModal} isDisabled={isCancelling}>
              Back
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
              leftIcon={<FiStopCircle />}
            >
              Confirm Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CourseGenerationPage; 