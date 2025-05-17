import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { Box, Spinner, Center } from '@chakra-ui/react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {children}
    </Box>
  );
} 