import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Flex,
  Image,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  Checkbox,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { signIn, signUp, supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [configError, setConfigError] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  // Check if Supabase is configured
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project-id.supabase.co' || 
        supabaseAnonKey === 'your-anon-key') {
      setConfigError(true);
    } else {
      setConfigError(false);
    }
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (configError) {
      toast({
        title: 'Configuration Error',
        description: 'Supabase is not properly configured. Please set up your environment variables.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Error signing in',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (configError) {
      toast({
        title: 'Configuration Error',
        description: 'Supabase is not properly configured. Please set up your environment variables.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast({
          title: 'Error signing in',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Container maxW="7xl" py={12} px={{ base: 4, md: 8 }}>
      <Flex direction={{ base: 'column', md: 'row' }} align="center">
        <Box flex="1" display={{ base: 'none', md: 'block' }} mr={8}>
          <Image
            src="https://via.placeholder.com/1200x800?text=SkillSprint+Learning"
            alt="Learning together"
            borderRadius="lg"
            objectFit="cover"
            height="500px"
            width="100%"
          />
        </Box>
        
        <VStack
          spacing={8}
          py={12}
          px={{ base: 6, md: 8 }}
          flex="1"
          maxW={{ md: '400px' }}
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
        >
          {configError && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Supabase Not Configured</AlertTitle>
                <AlertDescription>
                  For developers: Please set up your .env.local file with Supabase credentials.
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <VStack spacing={2} textAlign="center">
            <Heading as="h1" fontSize="3xl">Welcome back</Heading>
            <Text color="gray.500">Sign in to continue your learning journey</Text>
          </VStack>
          
          <VStack as="form" onSubmit={handleSubmit} spacing={5} width="100%">
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  >
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <HStack justify="space-between" width="100%">
              <Checkbox>Remember me</Checkbox>
              <Link color="primary.600" fontSize="sm">Forgot password?</Link>
            </HStack>
            
            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="100%"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </VStack>
          
          <Box width="100%">
            <Divider my={4} />
            <Text textAlign="center" color="gray.500" mb={4}>
              Or continue with
            </Text>
            <HStack>
              <Button flex="1" variant="outline" onClick={() => handleSocialLogin('google')}>
                <Icon viewBox="0 0 24 24" width="20px" height="20px">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </Icon>
              </Button>
              <Button flex="1" variant="outline" onClick={() => handleSocialLogin('github')}>
                <Icon viewBox="0 0 24 24" width="20px" height="20px">
                  <path
                    fill="currentColor"
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"
                  />
                </Icon>
              </Button>
            </HStack>
          </Box>
          
          <Text>
            Don't have an account?{' '}
            <Link as={RouterLink} to="/signup" color="primary.600">
              Sign up now
            </Link>
          </Text>
        </VStack>
      </Flex>
    </Container>
  );
}

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [configError, setConfigError] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  // Check if Supabase is configured
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project-id.supabase.co' || 
        supabaseAnonKey === 'your-anon-key') {
      setConfigError(true);
    } else {
      setConfigError(false);
    }
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (configError) {
      toast({
        title: 'Configuration Error',
        description: 'Supabase is not properly configured. Please set up your environment variables.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name
      );
      
      if (error) {
        toast({
          title: 'Error creating account',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Account created successfully, user is automatically logged in
        navigate('/dashboard');
        toast({
          title: 'Account created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    if (configError) {
      toast({
        title: 'Configuration Error',
        description: 'Supabase is not properly configured. Please set up your environment variables.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast({
          title: 'Error signing up',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Container maxW="7xl" py={12} px={{ base: 4, md: 8 }}>
      <Flex direction={{ base: 'column', md: 'row' }} align="center">
        <Box flex="1" display={{ base: 'none', md: 'block' }} mr={8}>
          <VStack align="start" spacing={8}>
            <Heading as="h1" size="2xl">
              Start your learning journey today
            </Heading>
            <Text fontSize="xl">
              Join thousands of learners building valuable skills with SkillSprint's adaptive micro-learning approach.
            </Text>
            <VStack align="start" spacing={5} mt={6}>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={6} color="primary.500">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </Icon>
                <Text fontSize="lg">Personalized micro-learning sessions</Text>
              </HStack>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={6} color="primary.500">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </Icon>
                <Text fontSize="lg">AI-powered adaptive learning</Text>
              </HStack>
              <HStack>
                <Icon viewBox="0 0 24 24" boxSize={6} color="primary.500">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </Icon>
                <Text fontSize="lg">Track progress and build skills efficiently</Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>
        
        <VStack
          spacing={8}
          py={12}
          px={{ base: 6, md: 8 }}
          flex="1"
          maxW={{ md: '450px' }}
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
        >
          {configError && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Supabase Not Configured</AlertTitle>
                <AlertDescription>
                  For developers: Please set up your .env.local file with Supabase credentials.
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <VStack spacing={2} textAlign="center">
            <Heading as="h1" fontSize="2xl">Create your account</Heading>
            <Text color="gray.500">Join SkillSprint to start learning</Text>
          </VStack>
          
          <VStack as="form" onSubmit={handleSubmit} spacing={5} width="100%">
            <FormControl isInvalid={errors.name}>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  >
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.confirmPassword}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.terms}>
              <Checkbox 
                isChecked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              >
                I agree to the{' '}
                <Link as={RouterLink} to="/terms" color="primary.600">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link as={RouterLink} to="/privacy" color="primary.600">
                  Privacy Policy
                </Link>
              </Checkbox>
              <FormErrorMessage>{errors.terms}</FormErrorMessage>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="100%"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </VStack>
          
          <Box width="100%">
            <Divider my={4} />
            <Text textAlign="center" color="gray.500" mb={4}>
              Or sign up with
            </Text>
            <HStack>
              <Button flex="1" variant="outline" onClick={() => handleSocialSignup('google')}>
                <Icon viewBox="0 0 24 24" width="20px" height="20px">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </Icon>
              </Button>
              <Button flex="1" variant="outline" onClick={() => handleSocialSignup('facebook')}>
                <Icon viewBox="0 0 24 24" width="20px" height="20px">
                  <path
                    fill="currentColor"
                    d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                  />
                </Icon>
              </Button>
              <Button flex="1" variant="outline" onClick={() => handleSocialSignup('github')}>
                <Icon viewBox="0 0 24 24" width="20px" height="20px">
                  <path
                    fill="currentColor"
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"
                  />
                </Icon>
              </Button>
            </HStack>
          </Box>
          
          <Text>
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="primary.600">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Flex>
    </Container>
  );
} 