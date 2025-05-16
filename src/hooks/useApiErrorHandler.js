import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

/**
 * Custom hook for handling API errors including JSON parsing errors
 */
function useApiErrorHandler() {
  const toast = useToast();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Handle API errors including JSON parsing errors
  const handleApiError = useCallback((error) => {
    setIsError(true);
    
    // Determine error type and message
    let errorMsg = error?.message || 'Unknown API error';
    let errorType = 'api';
    
    // Check for JSON parsing errors
    if (errorMsg.includes('JSON Parse') || 
        errorMsg.includes('Unexpected token') || 
        errorMsg.includes('Unterminated string')) {
      errorType = 'json';
      errorMsg = 'There was an error processing the data from our servers';
    }
    
    // Check for network errors
    if (errorMsg.includes('Failed to fetch') || 
        errorMsg.includes('NetworkError') || 
        errorMsg.includes('network')) {
      errorType = 'network';
      errorMsg = 'Unable to connect to our servers. Please check your internet connection';
    }
    
    setErrorMessage(errorMsg);
    
    // Show toast notification
    toast({
      title: errorType === 'json' ? 'Data Processing Error' : 
             errorType === 'network' ? 'Network Error' : 
             'API Error',
      description: errorMsg,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    
    // Log the error to console
    console.error(`API Error (${errorType}):`, error);
    
    return { errorType, errorMsg };
  }, [toast]);
  
  const clearError = useCallback(() => {
    setIsError(false);
    setErrorMessage(null);
  }, []);
  
  return {
    isError,
    errorMessage,
    handleApiError,
    clearError
  };
}

export default useApiErrorHandler; 