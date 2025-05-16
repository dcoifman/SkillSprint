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
} from '@chakra-ui/react';

function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Container maxW={'3xl'} minH="80vh" display="flex" alignItems="center">
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            Short bursts. <br />
            <Text as={'span'} color={'primary.600'}>
              Big skills.
            </Text>
          </Heading>
          <Text color={'gray.500'} fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}>
            Master any skill with personalized, AI-powered adaptive micro-learning.
            SkillSprint delivers concise sessions tailored to your learning style and goals.
          </Text>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Button
              colorScheme={'purple'}
              bg={'primary.600'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'primary.500',
              }}
              as={RouterLink}
              to="/signup"
              size="lg"
            >
              Get Started
            </Button>
            <Button
              variant={'link'}
              colorScheme={'blue'}
              size={'sm'}
              as={RouterLink}
              to="/how-it-works"
            >
              Learn more
            </Button>
            <Box>
              <Icon
                as={Arrow}
                color={useColorModeValue('gray.800', 'gray.300')}
                w={71}
                position={'absolute'}
                right={-71}
                top={'10px'}
              />
              <Text
                fontSize={'lg'}
                fontFamily={'Caveat'}
                position={'absolute'}
                right={'-125px'}
                top={'-15px'}
                transform={'rotate(10deg)'}
              >
                Start for free
              </Text>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
        <Container maxW={'6xl'}>
          <Heading
            textAlign={'center'}
            fontSize={'4xl'}
            py={10}
            fontWeight={'bold'}
          >
            Features
          </Heading>

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
      <Container maxW={'5xl'} py={12}>
        <Heading textAlign={'center'} fontSize={'4xl'} py={10} fontWeight={'bold'}>
          How It Works
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Flex>
            <Image
              rounded={'md'}
              alt={'feature image'}
              src={
                'https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
              }
              objectFit={'cover'}
            />
          </Flex>
          <Stack spacing={4}>
            <Text
              textTransform={'uppercase'}
              color={'primary.600'}
              fontWeight={600}
              fontSize={'sm'}
              bg={useColorModeValue('primary.50', 'primary.900')}
              p={2}
              alignSelf={'flex-start'}
              rounded={'md'}
            >
              Our Process
            </Text>
            <Heading>A personalized learning experience</Heading>
            <Text color={'gray.500'} fontSize={'lg'}>
              1. Input your learning goals and available time
            </Text>
            <Text color={'gray.500'} fontSize={'lg'}>
              2. Our AI generates a tailored learning pathway
            </Text>
            <Text color={'gray.500'} fontSize={'lg'}>
              3. Complete daily micro-sprints that adapt to your performance
            </Text>
            <Text color={'gray.500'} fontSize={'lg'}>
              4. Review concepts at optimal intervals for maximum retention
            </Text>
            <Text color={'gray.500'} fontSize={'lg'}>
              5. Track your progress and earn verified skill badges
            </Text>
          </Stack>
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Box bg={'primary.600'} color={'white'}>
        <Container maxW={'3xl'} py={16} textAlign={'center'}>
          <Heading fontSize={'4xl'} mb={6}>
            Ready to start your learning journey?
          </Heading>
          <Text fontSize={'xl'} mb={6}>
            Join thousands of learners who are building valuable skills in just minutes a day.
          </Text>
          <Button
            as={RouterLink}
            to="/signup"
            rounded={'full'}
            px={6}
            py={3}
            bg={'white'}
            color={'primary.600'}
            _hover={{ bg: 'gray.100' }}
            size="lg"
            fontSize="md"
            fontWeight="bold"
          >
            Sign Up Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

const Feature = ({ title, text, icon }) => {
  return (
    <VStack
      align={'center'}
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="base"
      _hover={{ boxShadow: 'md', transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'primary.500'}
        mb={1}
      >
        <Text fontSize="2xl">{icon}</Text>
      </Flex>
      <Heading fontSize={'xl'} fontWeight={700}>
        {title}
      </Heading>
      <Text textAlign={'center'} color={'gray.600'}>
        {text}
      </Text>
    </VStack>
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