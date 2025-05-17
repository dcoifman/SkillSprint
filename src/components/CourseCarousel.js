'use client'
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  useBreakpointValue,
  Stack,
  Heading,
  Text,
  Container,
  Badge,
  HStack,
  Card,
  CardBody,
  Image,
  VStack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';

// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CourseCarousel = ({ courses = [] }) => {
  const [slider, setSlider] = useState(null);
  const navigate = useNavigate();

  // Responsive settings
  const top = useBreakpointValue({ base: '90%', md: '50%' });
  const side = useBreakpointValue({ base: '30%', md: '40px' });

  // Slider settings
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box position="relative" width="full" overflow="hidden" px={{ base: 4, md: 12 }} py={8}>
      {/* CSS files for react-slick */}
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
      />

      {/* Left Icon */}
      <IconButton
        aria-label="left-arrow"
        variant="ghost"
        position="absolute"
        left={side}
        top={top}
        transform={'translate(0%, -50%)'}
        zIndex={2}
        onClick={() => slider?.slickPrev()}
      >
        <BiLeftArrowAlt size="40px" />
      </IconButton>

      {/* Right Icon */}
      <IconButton
        aria-label="right-arrow"
        variant="ghost"
        position="absolute"
        right={side}
        top={top}
        transform={'translate(0%, -50%)'}
        zIndex={2}
        onClick={() => slider?.slickNext()}
      >
        <BiRightArrowAlt size="40px" />
      </IconButton>

      {/* Slider */}
      <Slider {...settings} ref={(slider) => setSlider(slider)}>
        {courses.map((course, index) => (
          <Box key={index} px={4}>
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
      </Slider>
    </Box>
  );
};

export default CourseCarousel; 