import React, { Component } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Button, VStack, Heading, Text } from '@chakra-ui/react';
import { WarningTwoIcon, RepeatIcon } from '@chakra-ui/icons';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Determine error type
    let errorType = 'unknown';
    
    if (error.message && error.message.includes('WebGL')) {
      errorType = 'webgl';
    } else if (
      error.message && (
        error.message.includes('JSON') || 
        error.message.includes('Unexpected token') || 
        error.message.includes('Unterminated string')
      )
    ) {
      errorType = 'json';
    } else if (error.message && error.message.includes('network')) {
      errorType = 'network';
    }
    
    this.setState({ 
      errorInfo,
      errorType
    });
    
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }
  
  formatError() {
    const { error, errorType } = this.state;
    
    // Create XML-style error message
    return `
<error type="${errorType || 'unknown'}">
  <message>${error?.message || 'Unknown error'}</message>
  <stack>${error?.stack?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'No stack trace available'}</stack>
  <timestamp>${new Date().toISOString()}</timestamp>
</error>
    `;
  }
  
  renderErrorMessage() {
    const { errorType, error } = this.state;
    
    switch(errorType) {
      case 'webgl':
        return (
          <Alert status="warning" variant="left-accent">
            <AlertIcon as={WarningTwoIcon} />
            <Box>
              <AlertTitle>3D Rendering Error</AlertTitle>
              <AlertDescription>
                There was a problem with WebGL rendering. This might be due to:
                <VStack align="start" mt={2} spacing={1}>
                  <Text>• Your browser or device might not support 3D graphics</Text>
                  <Text>• Your graphics drivers might need updating</Text>
                  <Text>• Your device might be low on resources</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        );
        
      case 'json':
        return (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Data Processing Error</AlertTitle>
              <AlertDescription>
                There was a problem processing the data from our servers:
                <VStack align="start" mt={2} spacing={1}>
                  <Text>• The data format received was invalid</Text>
                  <Text>• There might be an issue with the API response</Text>
                  <Text>• Original error: {error?.message}</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        );
        
      case 'network':
        return (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Network Error</AlertTitle>
              <AlertDescription>
                Unable to connect to our servers:
                <VStack align="start" mt={2} spacing={1}>
                  <Text>• Please check your internet connection</Text>
                  <Text>• Our servers might be temporarily unavailable</Text>
                  <Text>• Try again in a few moments</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        );
        
      default:
        return (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                An unexpected error occurred:
                <Text mt={2}>{error?.message || 'Unknown error'}</Text>
              </AlertDescription>
            </Box>
          </Alert>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          p={5} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white" 
          shadow="md"
          maxW="100%"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">Application Error</Heading>
            
            {this.renderErrorMessage()}
            
            <Box mt={2}>
              <Button
                leftIcon={<RepeatIcon />}
                colorScheme="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
              >
                Reload Application
              </Button>
            </Box>
            
            {process.env.NODE_ENV !== 'production' && (
              <Box mt={4}>
                <Heading size="sm" mb={2}>Technical Details (Development Only)</Heading>
                <Code p={2} borderRadius="md" fontSize="xs" width="100%" overflowX="auto" display="block" whiteSpace="pre-wrap">
                  {this.formatError()}
                </Code>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 