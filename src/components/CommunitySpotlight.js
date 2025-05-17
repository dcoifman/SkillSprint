import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardFooter,
  HStack,
  VStack,
  Text,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  Button,
  chakra,
} from '@chakra-ui/react';
import { StarIcon, ChatIcon, TimeIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const CommunitySpotlight = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const communityPosts = [
    {
      author: {
        name: 'Sarah Johnson',
        role: 'Data Scientist',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974'
      },
      content: "Just completed the Advanced SQL Learning Path! The bite-sized sprints made it so easy to fit learning into my busy schedule. Now applying these skills to optimize our customer database.",
      badges: ['SQL', 'Data'],
      stats: {
        likes: 42,
        comments: 18,
        timeAgo: '2 days ago'
      },
      color: 'purple'
    },
    {
      author: {
        name: 'Michael Chen',
        role: 'UX Designer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974'
      },
      content: "The UX Research learning path completely changed how I approach user interviews. I've created a resource guide for our team based on what I learned in the sprints.",
      badges: ['UX', 'Research'],
      stats: {
        likes: 36,
        comments: 14,
        timeAgo: '5 days ago'
      },
      color: 'blue'
    },
    {
      author: {
        name: 'James Wilson',
        role: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974'
      },
      content: "After completing the 'Agile Product Management' path, I reorganized our entire workflow. Our team's velocity increased by 40% in just one sprint!",
      badges: ['Agile', 'Management'],
      stats: {
        likes: 58,
        comments: 24,
        timeAgo: '1 week ago'
      },
      color: 'green'
    }
  ];

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} py={20} position="relative">
      {/* Decorative background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={useColorModeValue(
          'radial(circle at 70% 80%, gray.50 0%, transparent 70%)',
          'radial(circle at 70% 80%, gray.700 0%, transparent 70%)'
        )}
        opacity={0.6}
      />

      <Container maxW={'7xl'} position="relative">
        <Box mb={16} textAlign="center">
          <chakra.h2
            fontSize={{ base: '2xl', sm: '3xl' }}
            fontWeight="bold"
            mb={5}
            bgGradient="linear(to-r, primary.500, secondary.500)"
            bgClip="text"
          >
            Community Spotlight
          </chakra.h2>
          <Text
            color={'gray.500'}
            maxW={'3xl'}
            mx={'auto'}
          >
            Join thousands of learners sharing knowledge, celebrating wins, and supporting each other.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={8}>
          {communityPosts.map((post, index) => (
            <GridItem key={index}>
              <Card 
                borderRadius="xl" 
                overflow="hidden" 
                boxShadow="lg" 
                borderWidth="1px"
                borderColor={borderColor}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bg: useColorModeValue(
                    `${post.color}.50`,
                    `${post.color}.900`
                  ),
                  opacity: 0.1,
                }}
                _hover={{
                  transform: 'translateY(-4px)',
                  transition: 'all 0.2s',
                  boxShadow: '2xl',
                }}
              >
                <CardBody p={0}>
                  <Box 
                    bg={useColorModeValue(`${post.color}.50`, `${post.color}.900`)}
                    p={4}
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <HStack>
                      <Avatar
                        src={post.author.avatar}
                        name={post.author.name}
                        size="md"
                        boxShadow="md"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{post.author.name}</Text>
                        <Text fontSize="sm" color="gray.500">{post.author.role}</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box p={5}>
                    <Text fontSize="md" mb={4}>
                      {post.content}
                    </Text>
                    <HStack>
                      {post.badges.map((badge, i) => (
                        <Badge 
                          key={i}
                          colorScheme={post.color}
                          px={3}
                          py={1}
                          borderRadius="full"
                          boxShadow="inner"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </CardBody>
                <CardFooter 
                  bg={useColorModeValue('gray.50', 'gray.900')} 
                  p={4}
                  borderTop="1px"
                  borderColor={borderColor}
                >
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <Tooltip label={`${post.stats.likes} likes`}>
                        <IconButton
                          aria-label="Like"
                          icon={<StarIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme={post.color}
                        />
                      </Tooltip>
                      <Text fontSize="sm">{post.stats.likes}</Text>
                    </HStack>
                    <HStack>
                      <Tooltip label={`${post.stats.comments} comments`}>
                        <IconButton
                          aria-label="Comment"
                          icon={<ChatIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme={post.color}
                        />
                      </Tooltip>
                      <Text fontSize="sm">{post.stats.comments}</Text>
                    </HStack>
                    <HStack>
                      <TimeIcon color="gray.400" />
                      <Text fontSize="sm" color="gray.500">{post.stats.timeAgo}</Text>
                    </HStack>
                  </HStack>
                </CardFooter>
              </Card>
            </GridItem>
          ))}
        </Grid>

        <Box textAlign="center" mt={10}>
          <Button
            as={RouterLink}
            to="/community"
            size="lg"
            variant="outline"
            colorScheme="purple"
            rightIcon={<ChevronRightIcon />}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: 'purple.500',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
            _hover={{
              transform: 'translateY(-2px)',
              _before: {
                opacity: 0.1,
              },
            }}
          >
            Join Our Community
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CommunitySpotlight; 