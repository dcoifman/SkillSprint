import React from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';

export function RootLayout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1" as="main">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
} 