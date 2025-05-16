import React, { useState, useEffect } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, Text, VStack } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';

/**
 * ThreeJSErrorHandler - A wrapper component that handles THREE.js WebGL errors
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - The THREE.js component to render
 * @param {string} props.fallbackImage - Optional fallback image URL to show when WebGL fails
 */
function ThreeJSErrorHandler({ children, fallbackImage }) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // Listen for WebGL context lost events
  useEffect(() => {
    const handleWebGLContextLost = (event) => {
      event.preventDefault();
      console.error('WebGL context lost:', event);
      
      // Use string literal with variables
      const timestamp = new Date().toISOString();
      const errorXml = '<error type="webgl"><message>WebGL context lost</message><timestamp>' + timestamp + '</timestamp></error>';
      
      setErrorDetails({
        type: 'webgl',
        message: 'WebGL context lost',
        xml: errorXml
      });
      setHasError(true);
    };

    // Add event listener to the window
    window.addEventListener('webglcontextlost', handleWebGLContextLost, false);

    // Clean up
    return () => {
      window.removeEventListener('webglcontextlost', handleWebGLContextLost, false);
    };
  }, []);

  // Handle JSON parse errors in console
  useEffect(() => {
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      // Check if this is a JSON parse error
      const errorString = args.join(' ');
      if (errorString.includes('JSON Parse error') || errorString.includes('Unterminated string')) {
        // Use string literal with variables
        const timestamp = new Date().toISOString();
        const details = errorString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const errorXml = '<error type="json"><message>JSON Parse error</message><details>' + details + '</details><timestamp>' + timestamp + '</timestamp></error>';
        
        setErrorDetails({
          type: 'json',
          message: 'JSON Parse error',
          details: errorString,
          xml: errorXml
        });
        setHasError(true);
      }
      
      // Call the original console.error
      originalConsoleError.apply(console, args);
    };
    
    // Restore original on cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setErrorDetails(null);
    window.location.reload();
  };

  if (hasError) {
    return (
      <Box p={4} borderRadius="md" borderWidth="1px" bg="white">
        <VStack spacing={4} align="stretch">
          {errorDetails?.type === 'webgl' ? (
            <Alert status="warning" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>3D Rendering Error</AlertTitle>
                <AlertDescription>
                  There was a problem with the 3D rendering. This might be due to:
                  <VStack align="start" mt={2} spacing={1}>
                    <Text>• Your browser or device might not support 3D graphics</Text>
                    <Text>• Your graphics drivers might need updating</Text>
                    <Text>• Your device might be low on resources</Text>
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>
          ) : errorDetails?.type === 'json' ? (
            <Alert status="error" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>Data Processing Error</AlertTitle>
                <AlertDescription>
                  There was a problem processing data from our servers.
                  <Text mt={2}>{errorDetails.message}</Text>
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="error" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  An unexpected error occurred while loading this component.
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          {fallbackImage && (
            <Box 
              height="400px" 
              backgroundImage={`url(${fallbackImage})`}
              backgroundSize="cover"
              backgroundPosition="center"
              borderRadius="md"
            />
          )}
          
          <Button 
            leftIcon={<RepeatIcon />} 
            colorScheme="primary" 
            onClick={handleRetry}
            alignSelf="center"
          >
            Reload
          </Button>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
}

export default ThreeJSErrorHandler; 