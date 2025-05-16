import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

function NotFoundPage() {
  return (
    <Box
      minHeight="70vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={10}
      px={6}
    >
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading
            display="inline-block"
            as="h1"
            size="4xl"
            bg={useColorModeValue('primary.600', 'primary.400')}
            backgroundClip="text"
            color="transparent"
          >
            404
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" mt={3} mb={2}>
            Page Not Found
          </Text>
          <Text color={'gray.500'} mb={6}>
            The page you're looking for doesn't seem to exist
          </Text>

          <Button
            as={RouterLink}
            to="/"
            colorScheme="purple"
            bgGradient="linear(to-r, primary.600, secondary.500)"
            _hover={{
              bgGradient: 'linear(to-r, primary.500, secondary.400)',
            }}
          >
            Go to Home
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

export default NotFoundPage; 