import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Divider,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { supabase } from '../services/supabaseClient.js';
import { useNavigate } from 'react-router-dom';

const CourseInvitationsComponent = () => {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      // Fetch pending invitations with course details
      const { data, error } = await supabase
        .from('course_invitations')
        .select(`
          id,
          status,
          message,
          created_at,
          path: path_id (
            id,
            title,
            description,
            level,
            category,
            total_sprints,
            instructor: instructor_id (
              name,
              avatar
            )
          )
        `)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course invitations',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setInvitations(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitation = async (invitationId, status) => {
    setIsProcessing({ ...isProcessing, [invitationId]: true });
    
    try {
      const { error } = await supabase
        .from('course_invitations')
        .update({ status })
        .eq('id', invitationId);
      
      if (error) {
        console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} invitation:`, error);
        toast({
          title: 'Error',
          description: `Failed to ${status === 'accepted' ? 'accept' : 'reject'} invitation`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Show success message
        toast({
          title: `Invitation ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
          description: status === 'accepted' 
            ? 'You have been enrolled in the course' 
            : 'The invitation has been rejected',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Update local state
        if (status === 'accepted') {
          // If accepted, navigate to the course
          const invitation = invitations.find(inv => inv.id === invitationId);
          if (invitation?.path?.id) {
            navigate(`/path/${invitation.path.id}`);
          }
        } else {
          // If rejected, remove from the list
          setInvitations(invitations.filter(inv => inv.id !== invitationId));
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsProcessing({ ...isProcessing, [invitationId]: false });
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="40px" width="200px" />
        <Skeleton height="120px" />
        <Skeleton height="120px" />
      </VStack>
    );
  }

  if (invitations.length === 0) {
    return (
      <Box p={4}>
        <Heading size="md" mb={2}>Course Invitations</Heading>
        <Text color="gray.600">You have no pending course invitations</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Course Invitations</Heading>
      <VStack spacing={4} align="stretch">
        {invitations.map(invitation => (
          <Card key={invitation.id} boxShadow="sm">
            <CardHeader pb={1}>
              <Heading size="sm">{invitation.path?.title}</Heading>
            </CardHeader>
            <CardBody pt={2}>
              <Text fontSize="sm" noOfLines={2} mb={2}>
                {invitation.path?.description}
              </Text>
              
              <HStack mb={3}>
                <Badge colorScheme="blue">{invitation.path?.level}</Badge>
                <Badge colorScheme="green">{invitation.path?.category}</Badge>
                <Badge colorScheme="purple">{invitation.path?.total_sprints} sprints</Badge>
              </HStack>
              
              <HStack mb={3}>
                <Text fontSize="sm">Instructor:</Text>
                <Text fontSize="sm" fontWeight="bold">
                  {invitation.path?.instructor?.name}
                </Text>
              </HStack>
              
              <Divider mb={3} />
              
              <Text fontSize="xs" color="gray.500" mb={3}>
                Invited on {new Date(invitation.created_at).toLocaleDateString()}
              </Text>
              
              <HStack spacing={2}>
                <Button
                  colorScheme="green"
                  size="sm"
                  flex={1}
                  isLoading={isProcessing[invitation.id]}
                  loadingText="Accepting"
                  onClick={() => handleInvitation(invitation.id, 'accepted')}
                >
                  Accept
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  flex={1}
                  isLoading={isProcessing[invitation.id]}
                  loadingText="Rejecting"
                  onClick={() => handleInvitation(invitation.id, 'rejected')}
                >
                  Decline
                </Button>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default CourseInvitationsComponent; 