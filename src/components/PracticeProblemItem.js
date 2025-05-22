import React from 'react';
import { Box, Text, VStack, Radio, RadioGroup } from '@chakra-ui/react';

function PracticeProblemItem({ problem }) {
  // Assuming 'problem' is an object like: 
  // { question: '...', options: ['...', '...', '...', '...'], correctAnswer: 'A' }

  // Basic rendering for now
  return (
    <Box borderWidth="1px" borderRadius="md" p={4} width="full">
      <Text fontWeight="bold" mb={3}>{problem.question}</Text>
      <RadioGroup>
        <VStack align="stretch" spacing={2}>
          {problem.options.map((option, index) => (
            <Radio key={index} value={String.fromCharCode(65 + index)} isDisabled>
              {String.fromCharCode(65 + index)}) {option}
            </Radio>
          ))}
        </VStack>
      </RadioGroup>
    </Box>
  );
}

export default PracticeProblemItem; 