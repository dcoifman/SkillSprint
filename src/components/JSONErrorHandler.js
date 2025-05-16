import React from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Text, Button, VStack } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';

/**
 * A specialized error message component that properly formats error XML
 * for WebGL context lost errors and JSON parsing errors
 */
function JSONErrorHandler({ errorType, message, details }) {
  const formatErrorAsXML = () => {
    const timestamp = new Date().toISOString();
    return `&lt;error type="${errorType}"&gt;
  &lt;message&gt;${message || 'Unknown error'}&lt;/message&gt;
  ${details ? `&lt;details&gt;${details}&lt;/details&gt;` : ''}
  &lt;timestamp&gt;${timestamp}&lt;/timestamp&gt;
&lt;/error&gt;`;
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="md" bg="white">
      <VStack spacing={4} align="stretch">
        {errorType === 'webgl' ? (
          <Alert status="warning" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>3D Rendering Error</AlertTitle>
              <AlertDescription>
                There was a problem with the 3D visualization component:
                <VStack align="start" mt={2} spacing={1}>
                  <Text>• Your browser may not support WebGL</Text>
                  <Text>• Your graphics drivers might need updating</Text>
                  <Text>• Your device might have limited resources</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        ) : errorType === 'json' ? (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Data Processing Error</AlertTitle>
              <AlertDescription>
                There was a problem processing data from our servers:
                <Text mt={2}>{message}</Text>
                {details && <Text fontSize="sm" color="gray.500">{details}</Text>}
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Application Error</AlertTitle>
              <AlertDescription>
                An unexpected error occurred: {message}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {process.env.NODE_ENV !== 'production' && (
          <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50" overflow="auto">
            <Text fontSize="sm" fontFamily="monospace" whiteSpace="pre" overflowX="auto">
              {formatErrorAsXML()}
            </Text>
          </Box>
        )}

        <Button
          colorScheme="primary"
          leftIcon={<RepeatIcon />}
          onClick={() => window.location.reload()}
          alignSelf="center"
        >
          Reload Application
        </Button>
      </VStack>
    </Box>
  );
}

export default JSONErrorHandler; 