import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Avatar,
  useColorModeValue,
  chakra,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const testimonials = [
  {
    name: 'Samantha Lee',
    role: 'Marketing Specialist',
    content: "The bite-sized learning approach is perfect for my busy schedule. I've learned more in 2 weeks with SkillSprint than in 2 months with traditional courses.",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070',
    color: 'purple'
  },
  {
    name: 'David Rodriguez',
    role: 'Software Engineer',
    content: "The AI tutor is incredible! It answered all my questions and helped me understand complex programming concepts better than any human instructor ever has.",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070',
    color: 'blue'
  },
  {
    name: 'Alex Kumar',
    role: 'Product Manager',
    content: "SkillSprint's personalized pathways helped me fill specific knowledge gaps for my new role. The analytics showed me exactly where to focus my efforts.",
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974',
    color: 'green'
  }
];

const TestimonialsSection = () => {
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20} position="relative">
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="200px"
        bgGradient={useColorModeValue(
          'linear(to-b, whiteAlpha.500, transparent)',
          'linear(to-b, whiteAlpha.100, transparent)'
        )}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="200px"
        bgGradient={useColorModeValue(
          'linear(to-t, whiteAlpha.500, transparent)',
          'linear(to-t, whiteAlpha.100, transparent)'
        )}
        pointerEvents="none"
      />

      <Container maxW={'7xl'}>
        <Box mb={16} textAlign="center">
          <chakra.h2
            fontSize={{ base: '2xl', sm: '3xl' }}
            fontWeight="bold"
            mb={5}
            bgGradient="linear(to-r, primary.500, secondary.500)"
            bgClip="text"
          >
            What Our Learners Say
          </chakra.h2>
          <Text
            color={'gray.500'}
            maxW={'3xl'}
            mx={'auto'}
          >
            Join thousands of satisfied learners who have transformed their skills with SkillSprint.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {testimonials.map((testimonial, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <VStack
                spacing={4}
                p={8}
                borderWidth="1px"
                borderRadius="xl"
                bg={useColorModeValue('white', 'gray.800')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bg: useColorModeValue(
                    `${testimonial.color}.50`,
                    `${testimonial.color}.900`
                  ),
                  opacity: 0.1,
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'xl',
                  border: '1px solid',
                  borderColor: useColorModeValue(
                    `${testimonial.color}.200`,
                    `${testimonial.color}.700`
                  ),
                }}
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                  _before: {
                    opacity: 0.15,
                  },
                }}
                transition="all 0.3s"
              >
                <Box
                  position="relative"
                  zIndex={1}
                  _before={{
                    content: '"""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    fontSize: '6xl',
                    fontFamily: 'serif',
                    color: useColorModeValue(
                      `${testimonial.color}.200`,
                      `${testimonial.color}.700`
                    ),
                    opacity: 0.3,
                  }}
                >
                  <Text
                    fontSize="md"
                    color={useColorModeValue('gray.600', 'gray.300')}
                    fontStyle="italic"
                    pl={6}
                  >
                    {testimonial.content}
                  </Text>
                </Box>
                
                <HStack spacing={4} align="center" position="relative" zIndex={1}>
                  <Avatar
                    src={testimonial.avatar}
                    name={testimonial.name}
                    size="lg"
                    boxShadow="lg"
                    border="4px solid"
                    borderColor={useColorModeValue('white', 'gray.800')}
                  />
                  <VStack align="start" spacing={0}>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      bgGradient={`linear(to-r, ${testimonial.color}.500, ${testimonial.color}.300)`}
                      bgClip="text"
                    >
                      {testimonial.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {testimonial.role}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection; 