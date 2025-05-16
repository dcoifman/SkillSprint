import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  chakra,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0.4);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(98, 0, 234, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0);
  }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

function HomePage() {
  const pulseAnimation = `${pulse} 2s infinite`;
  return (
    <Box>
      {/* Hero Section */}
      <Container maxW={'7xl'} minH={{base: "90vh", md: "80vh"}} display="flex" alignItems="center" pt={{ base: 20, md: 0 }}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: 10, lg: 20 }}
          align="center"
          w="full"
        >
          <Stack
            flex={1}
            spacing={{ base: 5, md: 10 }}
            py={{ base: 10, md: 20 }}
          >
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
            >
              <Text
                as={'span'}
                position={'relative'}
                _after={{
                  content: "''",
                  width: 'full',
                  height: '20%',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  bg: useColorModeValue('secondary.100', 'secondary.700'),
                  zIndex: -1,
                }}>
                Short bursts.
              </Text>
              <br />
              <Text as={'span'} color={'primary.600'}>
                Big skills.
              </Text>
            </Heading>
            <Text color={'gray.500'} fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} maxW="600px">
              Master any skill with personalized, AI-powered adaptive micro-learning.
              SkillSprint delivers concise sessions tailored to your learning style and goals.
            </Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
            >
              <Button
                size={'lg'}
                fontWeight={'bold'}
                px={6}
                colorScheme={'primary'}
                as={RouterLink}
                to="/signup"
                position="relative"
                _after={{
                  content: "''",
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  borderRadius: '50px',
                  zIndex: -1,
                  animation: pulseAnimation,
                }}
              >
                Start Learning Free
              </Button>
              <Button
                as={RouterLink}
                to="/how-it-works"
                size={'lg'}
                fontWeight={'bold'}
                variant={'outline'}
                colorScheme={'primary'}
                leftIcon={<Icon boxSize={5} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                  />
                </Icon>}
              >
                Learn More
              </Button>
            </Stack>
            
            <HStack spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color="gray.500">Used by:</Text>
              <Image
                src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069"
                boxSize="30px"
                borderRadius="full"
                objectFit="cover"
                alt="Company A"
              />
              <Image
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073"
                boxSize="30px"
                borderRadius="full"
                objectFit="cover"
                alt="Company B"
              />
              <Image
                src="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?q=80&w=2673"
                boxSize="30px"
                borderRadius="full"
                objectFit="cover"
                alt="Company C"
              />
              <Text fontSize="sm" color="gray.500">+ 10,000 professionals</Text>
            </HStack>
          </Stack>
          <Flex
            flex={1}
            justify={'center'}
            align={'center'}
            position={'relative'}
            w={'full'}
            display={{ base: 'none', lg: 'flex' }}
          >
            <Box
              position={'relative'}
              height={'550px'}
              width={'full'}
              overflow={'hidden'}
              borderRadius={'2xl'}
              boxShadow={'2xl'}
            >
              <Image
                alt={'Hero Image'}
                fit={'cover'}
                align={'center'}
                w={'100%'}
                h={'100%'}
                src={'https://images.unsplash.com/photo-1522881193457-37ae97c905bf?q=80&w=2070'}
                fallbackSrc="https://via.placeholder.com/800x600?text=SkillSprint"
              />
              <Box
                position="absolute"
                bottom="20px"
                left="20px"
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="lg"
                width="60%"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="gray.100"
              >
                <Text fontWeight="bold" mb={2}>
                  Machine Learning Fundamentals
                </Text>
                <HStack mb={2}>
                  <Badge colorScheme="purple">12 min</Badge>
                  <Badge colorScheme="green">Beginner</Badge>
                </HStack>
                <Box height="6px" bg="gray.100" borderRadius="full" mb={2}>
                  <Box height="6px" width="60%" bg="primary.500" borderRadius="full" />
                </Box>
                <Text fontSize="sm" color="gray.500">
                  60% Complete
                </Text>
              </Box>
            </Box>
          </Flex>
        </Stack>
      </Container>

      {/* Stats Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
            <VStack bg="white" p={6} borderRadius="lg" boxShadow="md" spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                1M+
              </Text>
              <Text fontWeight="medium">Active Learners</Text>
            </VStack>
            <VStack bg="white" p={6} borderRadius="lg" boxShadow="md" spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                5K+
              </Text>
              <Text fontWeight="medium">Learning Paths</Text>
            </VStack>
            <VStack bg="white" p={6} borderRadius="lg" boxShadow="md" spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                15M+
              </Text>
              <Text fontWeight="medium">Sprints Completed</Text>
            </VStack>
            <VStack bg="white" p={6} borderRadius="lg" boxShadow="md" spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                93%
              </Text>
              <Text fontWeight="medium">Completion Rate</Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20}>
        <Container maxW={'7xl'}>
          <Box mb={20} textAlign="center">
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              Everything you need to master new skills
            </chakra.h2>
            <Text 
              color={'gray.500'} 
              maxW={'3xl'} 
              mx={'auto'}
            >
              Our AI-powered platform adapts to your learning style, delivering personalized micro-lessons 
              that fit perfectly into your busy schedule.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
            <Feature
              icon={'🚀'}
              title={'Adaptive Micro-Learning'}
              text={'Short, engaging 5-15 minute sessions that adapt to your skill level in real-time.'}
            />
            <Feature
              icon={'🧠'}
              title={'AI-Curated Pathways'}
              text={'Personalized learning roadmaps based on your goals, existing skills, and learning style.'}
            />
            <Feature
              icon={'💬'}
              title={'24/7 AI Tutor'}
              text={'Get answers, explanations, and guidance from your personal AI tutor anytime.'}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={20}>
            <Feature
              icon={'🔄'}
              title={'Spaced Repetition'}
              text={'Automatically scheduled review sessions at optimal intervals for maximum retention.'}
            />
            <Feature
              icon={'📊'}
              title={'Progress Tracking'}
              text={'Comprehensive visual analytics that track your skill mastery and identify areas for improvement.'}
            />
            <Feature
              icon={'📱'}
              title={'Cross-Platform Access'}
              text={'Seamless learning across all your devices, with offline mode for on-the-go learning.'}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW={'7xl'}>
          <VStack spacing={12}>
            <Box textAlign="center">
              <chakra.h2 
                fontSize={{ base: '2xl', sm: '3xl' }}
                fontWeight="bold"
                mb={5}
              >
                How It Works
              </chakra.h2>
              <Text 
                color={'gray.500'} 
                maxW={'3xl'} 
                mx={'auto'}
              >
                Learning with SkillSprint is simple, effective, and tailored to your needs
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} w="full">
              <Flex>
                <Image
                  rounded={'xl'}
                  alt={'feature image'}
                  src={'https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                  objectFit={'cover'}
                  boxShadow="2xl"
                />
              </Flex>
              <VStack align="stretch" spacing={8} justify="center">
                <HowItWorksStep 
                  number="1"
                  title="Define Your Goals"
                  description="Tell us what skills you want to learn and how much time you have available."
                />
                <HowItWorksStep 
                  number="2"
                  title="Get Your Personalized Plan"
                  description="Our AI generates a tailored learning pathway optimized for your goals and schedule."
                />
                <HowItWorksStep 
                  number="3"
                  title="Learn in Short Sprints"
                  description="Complete daily micro-sprints that adapt to your performance and learning style."
                />
                <HowItWorksStep 
                  number="4"
                  title="Review & Apply"
                  description="Reinforce your knowledge with spaced repetition and practical challenges."
                />
                <HowItWorksStep 
                  number="5"
                  title="Track & Achieve"
                  description="Monitor your progress, earn badges, and build valuable skills efficiently."
                />
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={20}>
        <Container maxW={'5xl'}>
          <Box textAlign="center" mb={12}>
            <chakra.h2
              fontSize={{ base: '2xl', sm: '3xl' }}
              fontWeight="bold"
              mb={5}
            >
              Loved by learners worldwide
            </chakra.h2>
            <Text color={'gray.500'} maxW={'3xl'} mx={'auto'}>
              See what our community has to say about their SkillSprint experience
            </Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Testimonial
              name="Sarah Johnson"
              role="Software Developer"
              content="I've tried many learning platforms, but SkillSprint's approach actually fits into my busy schedule. I learned Python in just 15 minutes a day!"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
            />
            <Testimonial
              name="Michael Chen"
              role="Marketing Manager"
              content="The AI tutor feels like having a personal coach. It's incredibly responsive and adapts perfectly to my learning style and pace."
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
            />
            <Testimonial
              name="Emily Patel"
              role="UX Designer"
              content="SkillSprint's micro-learning approach helped me gain practical design skills quickly. The gamification keeps me motivated to learn daily."
              avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg={'primary.600'} color={'white'}>
        <Container maxW={'7xl'} py={20} textAlign={'center'}>
          <Heading fontSize={{ base: '3xl', sm: '4xl' }} mb={6}>
            Ready to start your learning journey?
          </Heading>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} mb={10} maxW="2xl" mx="auto">
            Join thousands of learners who are building valuable skills in just minutes a day.
            Start for free and see the results yourself.
          </Text>
          <Stack 
            direction={{ base: 'column', sm: 'row' }}
            spacing={4}
            justify="center"
          >
            <Button
              as={RouterLink}
              to="/signup"
              rounded={'full'}
              px={6}
              py={6}
              bg={'white'}
              color={'primary.600'}
              _hover={{ bg: 'gray.100' }}
              size="lg"
              fontSize="md"
              fontWeight="bold"
            >
              Sign Up Free
            </Button>
            <Button
              as={RouterLink}
              to="/explore"
              rounded={'full'}
              px={6}
              py={6}
              fontSize="md"
              fontWeight="bold"
              colorScheme="whiteAlpha"
              variant="outline"
              size="lg"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Explore Learning Paths
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

const Feature = ({ title, text, icon }) => {
  return (
    <VStack
      align={'center'}
      p={8}
      borderWidth="1px"
      borderRadius="xl"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="base"
      transition="all 0.3s"
      _hover={{ 
        boxShadow: 'xl', 
        transform: 'translateY(-5px)', 
        borderColor: 'primary.300' 
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'primary.500'}
        mb={4}
      >
        <Text fontSize="3xl">{icon}</Text>
      </Flex>
      <Heading fontSize={'xl'} fontWeight={700} mb={2}>
        {title}
      </Heading>
      <Text textAlign={'center'} color={'gray.600'}>
        {text}
      </Text>
    </VStack>
  );
};

const HowItWorksStep = ({ number, title, description }) => {
  return (
    <HStack spacing={6} align="start">
      <Flex
        align="center"
        justify="center"
        w={10}
        h={10}
        rounded="full"
        bg="primary.600"
        color="white"
        flexShrink={0}
      >
        <Text fontWeight="bold">{number}</Text>
      </Flex>
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold" fontSize="lg">{title}</Text>
        <Text color="gray.600">{description}</Text>
      </VStack>
    </HStack>
  );
};

const Testimonial = ({ name, role, content, avatar }) => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      p={8}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="base"
      position="relative"
    >
      <Icon
        viewBox="0 0 40 40"
        color={useColorModeValue('primary.100', 'primary.800')}
        position="absolute"
        right={3}
        top={3}
        fontSize="3xl"
      >
        <path
          fill="currentColor"
          d="M10 11c-2.667 0-5 1-7 3s-3 4.667-3 8c0 2 0.5 3.667 1.5 5s2.5 2.5 4.5 3 4 0.667 6 0c0-2.667-0.333-5-1-7s-1.5-3.667-2.5-5-2.167-2.333-3.5-3zM30 11c-2.667 0-5 1-7 3s-3 4.667-3 8c0 2 0.5 3.667 1.5 5s2.5 2.5 4.5 3 4 0.667 6 0c0-2.667-0.333-5-1-7s-1.5-3.667-2.5-5-2.167-2.333-3.5-3z"
        ></path>
      </Icon>
      <Text color="gray.600" mb={6} fontSize="md">
        {content}
      </Text>
      <HStack spacing={4} align="center">
        <Image
          src={avatar}
          alt={name}
          boxSize="40px"
          borderRadius="full"
          objectFit="cover"
        />
        <VStack spacing={0} align="start">
          <Text fontWeight="bold">{name}</Text>
          <Text fontSize="sm" color="gray.500">
            {role}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

const Arrow = createIcon({
  displayName: 'Arrow',
  viewBox: '0 0 72 24',
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});

export default HomePage;