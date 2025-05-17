import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App.js';
import reportWebVitals from './utils/reportWebVitals.js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Theme customization for SkillSprint
const theme = extendTheme({
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Poppins, sans-serif',
  },
  colors: {
    primary: {
      50: '#f5e9ff',
      100: '#dac1ff',
      200: '#c199ff',
      300: '#a770ff',
      400: '#8e47fe',
      500: '#742de4',
      600: '#6200ea', // primary color
      700: '#4500b0',
      800: '#3b0097',
      900: '#21004d',
    },
    secondary: {
      50: '#e0fbff',
      100: '#c0f0fa',
      200: '#a0e6f5',
      300: '#84ddff',
      400: '#60d4fe',
      500: '#00e5ff', // secondary color
      600: '#00bbce',
      700: '#00b8d4',
      800: '#0090a8',
      900: '#006b7d',
    },
    accent: {
      50: '#fff9e0',
      100: '#ffebb3',
      200: '#ffdd85',
      300: '#ffcf57',
      400: '#ffc22a',
      500: '#ffb300', // accent color
      600: '#e68a00',
      700: '#cc6a00',
      800: '#b34d00',
      900: '#993000',
    },
    success: {
      50: '#e6f9ed',
      100: '#c1f0d3',
      200: '#9de9b9',
      300: '#78e19f',
      400: '#53da85',
      500: '#00c853', // success color
      600: '#00a246',
      700: '#007d38',
      800: '#00592a',
      900: '#00361b',
    },
    error: {
      50: '#ffe9e5',
      100: '#ffc7be',
      200: '#ffa597',
      300: '#ff836f',
      400: '#ff6148',
      500: '#ff3d00', // error color
      600: '#e63600',
      700: '#cc2c00',
      800: '#b32200',
      900: '#991900',
    },
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#0f172a',
    }
  },
  shadows: {
    outline: '0 0 0 3px rgba(98, 0, 234, 0.6)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'primary.600',
          color: 'white',
          _hover: {
            bg: 'primary.500',
          },
          _active: {
            bg: 'primary.700',
          },
        },
        outline: {
          borderColor: 'primary.600',
          color: 'primary.600',
          _hover: {
            bg: 'primary.50',
          },
        },
        ghost: {
          color: 'primary.600',
          _hover: {
            bg: 'primary.50',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// Performance measurement
reportWebVitals(); 