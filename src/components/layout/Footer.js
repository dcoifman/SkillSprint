import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text fontSize={'xl'} fontWeight="bold">
                SkillSprint
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              Short bursts. Big skills. Master any skill with our AI-powered adaptive learning platform.
            </Text>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Product</ListHeader>
            <Link as={RouterLink} to={'/features'}>Features</Link>
            <Link as={RouterLink} to={'/pricing'}>Pricing</Link>
            <Link as={RouterLink} to={'/use-cases'}>Use Cases</Link>
            <Link as={RouterLink} to={'/testimonials'}>Testimonials</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link as={RouterLink} to={'/about'}>About</Link>
            <Link as={RouterLink} to={'/press'}>Press</Link>
            <Link as={RouterLink} to={'/careers'}>Careers</Link>
            <Link as={RouterLink} to={'/contact'}>Contact</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link as={RouterLink} to={'/help'}>Help Center</Link>
            <Link as={RouterLink} to={'/terms'}>Terms of Service</Link>
            <Link as={RouterLink} to={'/privacy'}>Privacy Policy</Link>
            <Link as={RouterLink} to={'/status'}>Status</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Follow Us</ListHeader>
            <Link href={'https://twitter.com'} isExternal>Twitter</Link>
            <Link href={'https://instagram.com'} isExternal>Instagram</Link>
            <Link href={'https://linkedin.com'} isExternal>LinkedIn</Link>
            <Link href={'https://facebook.com'} isExternal>Facebook</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box py={4}>
        <Flex
          align={'center'}
          _before={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            ml: 8,
          }}
        >
          <Text fontWeight="bold" fontSize="md">SkillSprint</Text>
        </Flex>
        <Text pt={6} fontSize={'sm'} textAlign={'center'}>
          © {new Date().getFullYear()} SkillSprint. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}

export default Footer; 