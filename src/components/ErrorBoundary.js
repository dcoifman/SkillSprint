import React, { Component } from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack } from '@chakra-ui/react';
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
    } else if (error.message && error.message.includes('model')) {
      errorType = 'model';
    }
    
    this.setState({ 
      errorInfo,
      errorType
    });
    
    // If there's an onError callback in props, call it
    if (this.props.onError && typeof this.props.onError === 'function') {
      this.props.onError(error, errorType);
    }
  }
  
  formatError() {
    const { error, errorType } = this.state;
    
    // Create XML-style error message
    return `
<error type="${errorType || 'unknown'}">
  <message>${error?.message || 'Unknown error'}</message>
  <stack>${error?.stack?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'No stack trace available'}</stack>
  <timestamp>${new Date().toISOString()}</timestamp>
</e>
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
                There was a problem with WebGL rendering. You can still continue with the course.
              </AlertDescription>
            </Box>
          </Alert>
        );
      
      case 'model':
        return (
          <Alert status="warning" variant="left-accent">
            <AlertIcon as={WarningTwoIcon} />
            <Box>
              <AlertTitle>3D Model Error</AlertTitle>
              <AlertDescription>
                There was a problem loading the 3D model. You can still continue with the course.
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
                There was a problem processing the data. You can still continue with the course.
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
                Unable to connect to our servers. You can still continue with the course.
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
                An unexpected error occurred. You can still continue with the course.
              </AlertDescription>
            </Box>
          </Alert>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white" 
          shadow="sm"
          maxW="100%"
        >
          <VStack spacing={3} align="stretch">
            {this.renderErrorMessage()}
            
              <Button
                leftIcon={<RepeatIcon />}
              colorScheme="purple"
              size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                if (this.props.onReset && typeof this.props.onReset === 'function') {
                  this.props.onReset();
                }
                }}
              >
              Try Again
              </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 