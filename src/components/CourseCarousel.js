'use client'
import React from 'react';
import {
  Box,
  IconButton,
  useBreakpointValue,
  Heading,
  Text,
  Badge,
  HStack,
  Card,
  CardBody,
  Image,
  VStack,
  useColorModeValue,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const CourseCarousel = ({ courses = [] }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const navigate = useNavigate();

  console.log('CourseCarousel received courses:', courses);

  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!Array.isArray(courses)) {
    console.error('Courses is not an array:', courses);
    return null;
  }

  if (courses.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Text>No courses available</Text>
      </Box>
    );
  }

  const slidesPerView = useBreakpointValue({ base: 1, md: 2, lg: 3 }) || 1;
  const totalSlides = Math.ceil(courses.length / slidesPerView);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const visibleCourses = courses.slice(
    currentIndex * slidesPerView,
    (currentIndex * slidesPerView) + slidesPerView
  );

  return (
    <Box position="relative" width="full" overflow="hidden" px={{ base: 4, md: 12 }} py={8}>
      <Flex direction="row" alignItems="center">
        <IconButton
          aria-label="Previous slide"
          icon={<BiLeftArrowAlt size="40px" />}
          variant="ghost"
          onClick={prevSlide}
          isDisabled={currentIndex === 0}
          mr={4}
        />

        <Stack
          direction="row"
          spacing={8}
          width="full"
          overflowX="hidden"
        >
          {visibleCourses.map((course, index) => (
            <Box
              key={index}
              flex="1"
              minWidth={`${100 / slidesPerView}%`}
              px={2}
            >
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'lg',
                  transition: 'all 0.2s',
                }}
                cursor="pointer"
                onClick={() => navigate(`/path/${course.id}`)}
                height="full"
              >
                <Image
                  src={course.image || 'https://images.unsplash.com/photo-1522881193457-37ae97c905bf?q=80&w=2070'}
                  alt={course.title}
                  height="200px"
                  objectFit="cover"
                />
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Heading size="md" noOfLines={2}>
                      {course.title}
                    </Heading>
                    <Text color="gray.500" noOfLines={2}>
                      {course.description}
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple">{course.level}</Badge>
                      <Badge colorScheme="green">{course.category}</Badge>
                      <Badge colorScheme="blue">{course.total_sprints} sprints</Badge>
                    </HStack>
                    {course.instructor && (
                      <HStack spacing={2}>
                        <Text fontSize="sm">Instructor:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {course.instructor.name}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          ))}
        </Stack>

        <IconButton
          aria-label="Next slide"
          icon={<BiRightArrowAlt size="40px" />}
          variant="ghost"
          onClick={nextSlide}
          isDisabled={currentIndex === totalSlides - 1}
          ml={4}
        />
      </Flex>

      {/* Pagination dots */}
      <HStack justify="center" mt={4} spacing={2}>
        {Array.from({ length: totalSlides }).map((_, index) => (
          <Box
            key={index}
            w={2}
            h={2}
            borderRadius="full"
            bg={index === currentIndex ? 'primary.500' : 'gray.300'}
            cursor="pointer"
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default CourseCarousel; 