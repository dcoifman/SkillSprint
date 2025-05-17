import React from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Badge,
  Center,
  Button,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import MarkdownWithMath from './MarkdownWithMath.js';

// Example math assignments and content
const MATH_EXAMPLES = [
  {
    title: "Introduction to Derivatives",
    content: `
# Introduction to Derivatives

The derivative of a function represents the rate of change of the function with respect to one of its variables.

## Definition

For a function $f(x)$, the derivative is defined as:

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

## Basic Rules

1. **Constant Rule**: $\frac{d}{dx}(c) = 0$
2. **Power Rule**: $\frac{d}{dx}(x^n) = nx^{n-1}$
3. **Sum Rule**: $\frac{d}{dx}(f(x) + g(x)) = \frac{d}{dx}f(x) + \frac{d}{dx}g(x)$
4. **Product Rule**: $\frac{d}{dx}(f(x) \cdot g(x)) = f(x) \cdot \frac{d}{dx}g(x) + g(x) \cdot \frac{d}{dx}f(x)$
5. **Quotient Rule**: $\frac{d}{dx}\\left(\\frac{f(x)}{g(x)}\\right) = \\frac{g(x) \cdot \frac{d}{dx}f(x) - f(x) \cdot \frac{d}{dx}g(x)}{[g(x)]^2}$
    `
  },
  {
    title: "Calculus Assignment: Limits and Derivatives",
    content: `
# Calculus Assignment: Limits and Derivatives

## Problems

1. Evaluate the following limit:
   $$\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$$

2. Find the derivative of the function:
   $$f(x) = 3x^4 - 2x^3 + 5x - 7$$

3. Apply the product rule to find the derivative:
   $$g(x) = x^2 \sin(x)$$

4. Use the chain rule to find the derivative:
   $$h(x) = \sqrt{3x^2 + 2}$$

## Challenge Problem

Find the points on the curve $y = x^3 - 3x + 2$ where the tangent line is horizontal.
    `,
    problems: [
      {
        question: "Evaluate the limit: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$",
        solution: `
We can factor the numerator:
$x^2 - 4 = (x - 2)(x + 2)$

Therefore:
$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 4$
        `
      },
      {
        question: "Find all values of $c$ such that $f'(c) = 0$ for the function $f(x) = x^3 - 6x^2 + 9x + 1$",
        solution: `
First, find the derivative:
$f'(x) = 3x^2 - 12x + 9$

Now, set the derivative equal to 0:
$3x^2 - 12x + 9 = 0$

Divide by 3:
$x^2 - 4x + 3 = 0$

Factor:
$(x - 3)(x - 1) = 0$

Therefore, $f'(c) = 0$ when $c = 1$ or $c = 3$
        `
      }
    ]
  },
  {
    title: "Matrix Operations",
    content: `
# Matrix Operations

## Matrix Addition

For matrices of the same dimensions:
$$
\\begin{pmatrix} 
a & b \\\\
c & d 
\\end{pmatrix} + 
\\begin{pmatrix} 
e & f \\\\
g & h 
\\end{pmatrix} = 
\\begin{pmatrix} 
a+e & b+f \\\\
c+g & d+h 
\\end{pmatrix}
$$

## Matrix Multiplication

For compatible matrices:
$$
\\begin{pmatrix} 
a & b \\\\
c & d 
\\end{pmatrix} \\times
\\begin{pmatrix} 
e & f \\\\
g & h 
\\end{pmatrix} = 
\\begin{pmatrix} 
ae+bg & af+bh \\\\
ce+dg & cf+dh 
\\end{pmatrix}
$$

## Determinant

For a 2×2 matrix:
$$
\\det\\begin{pmatrix} 
a & b \\\\
c & d 
\\end{pmatrix} = ad - bc
$$
    `
  }
];

/**
 * Component to showcase LaTeX math examples
 */
const MathExamples = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>Math Content Examples</Heading>
          <Text color="gray.600">
            Examples of LaTeX math content for educational courses
          </Text>
        </Box>
        
        <Accordion allowMultiple>
          {MATH_EXAMPLES.map((example, index) => (
            <AccordionItem 
              key={index}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              mb={4}
              overflow="hidden"
            >
              <h2>
                <AccordionButton bg={bgColor} py={4}>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">{example.title}</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={4}>
                  <MarkdownWithMath>
                    {example.content}
                  </MarkdownWithMath>
                  
                  {example.problems && (
                    <>
                      <Divider />
                      <Heading size="md" mb={2}>Solutions</Heading>
                      {example.problems.map((problem, i) => (
                        <Box key={i} borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <Badge colorScheme="purple" mb={2}>Problem {i+1}</Badge>
                              <MarkdownWithMath>
                                {problem.question}
                              </MarkdownWithMath>
                            </Box>
                            
                            <Box bg="white" p={3} borderRadius="md">
                              <Text fontWeight="bold" mb={1}>Solution:</Text>
                              <MarkdownWithMath>
                                {problem.solution}
                              </MarkdownWithMath>
                            </Box>
                          </VStack>
                        </Box>
                      ))}
                    </>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        
        <Center>
          <Button 
            colorScheme="purple" 
            size="lg"
            as={RouterLink}
            to="/course-builder"
          >
            Try Creating Your Own Math Content
          </Button>
        </Center>
      </VStack>
    </Container>
  );
};

export default MathExamples; 