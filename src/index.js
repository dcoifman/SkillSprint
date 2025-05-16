import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './utils/reportWebVitals';
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
      300: '#84ffff',
      500: '#00e5ff', // secondary color
      700: '#00b8d4',
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