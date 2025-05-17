import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Medical Student',
    content: 'The anatomy learning modules are incredibly detailed and interactive. The 3D models helped me understand complex structures better than traditional textbooks.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    content: 'The bite-sized learning approach fits perfectly into my busy schedule. I can learn new concepts during my breaks without feeling overwhelmed.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Biology Teacher',
    content: 'As an educator, I appreciate how the platform breaks down complex topics into manageable chunks. The AI-powered adaptivity ensures my students learn at their own pace.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
  },
];

const TestimonialCard = ({ content, avatar, name, role }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow={'lg'}
      p={8}
      rounded={'xl'}
      align={'center'}
      pos={'relative'}
      _hover={{
        transform: 'translateY(-5px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Avatar
        src={avatar}
        mb={2}
        size={'xl'}
        pos={'relative'}
      />
      <Text
        textAlign={'center'}
        color={useColorModeValue('gray.600', 'gray.400')}
        fontSize={'sm'}
        mb={4}
      >
        {content}
      </Text>
      <Stack align={'center'} spacing={0}>
        <Text fontWeight={600}>{name}</Text>
        <Text fontSize={'sm'} color={useColorModeValue('gray.600', 'gray.400')}>
          {role}
        </Text>
      </Stack>
    </Stack>
  );
};

const TestimonialsSection = () => {
  return (
    <Box bg={useColorModeValue('gray.100', 'gray.700')} py={16}>
      <Container maxW={'7xl'}>
        <Stack spacing={0} align={'center'} mb={12}>
          <Heading
            fontSize={{ base: '3xl', md: '4xl' }}
            textAlign={'center'}
            mb={4}
          >
            What Our Users Say
          </Heading>
          <Text
            color={useColorModeValue('gray.600', 'gray.400')}
            maxW={'3xl'}
            textAlign={'center'}
          >
            Join thousands of learners who have transformed their learning journey with SkillSprint
          </Text>
        </Stack>
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={10}
          px={{ base: 4, md: 8 }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection; 