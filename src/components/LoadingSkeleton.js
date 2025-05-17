import React from 'react';
import { Box, SimpleGrid, Skeleton, SkeletonText, Stack } from '@chakra-ui/react';

const LoadingSkeleton = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={4}
        >
          <Skeleton height="200px" mb={4} />
          <Stack spacing={4}>
            <SkeletonText noOfLines={1} skeletonHeight={6} width="60%" />
            <SkeletonText noOfLines={2} spacing={4} />
            <Stack direction="row" spacing={2}>
              <Skeleton height="24px" width="60px" />
              <Skeleton height="24px" width="80px" />
            </Stack>
          </Stack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default LoadingSkeleton; 