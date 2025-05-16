import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Box, useColorModeValue } from '@chakra-ui/react';

/**
 * MathRenderer component for rendering LaTeX math expressions
 * 
 * @param {Object} props
 * @param {string} props.math - The LaTeX math expression to render
 * @param {boolean} props.block - Whether to render as a block (centered, display mode) or inline
 * @param {Object} props.errorColor - Color to use for rendering errors
 * @param {string} props.className - Additional CSS class names
 */
const MathRenderer = ({ math, block = false, errorColor, className, ...rest }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Render as block or inline math
  if (block) {
    return (
      <Box 
        py={2} 
        my={4} 
        className={`math-block ${className || ''}`} 
        overflowX="auto"
        {...rest}
      >
        <BlockMath math={math} errorColor={errorColor} />
      </Box>
    );
  }
  
  // Inline math
  return (
    <Box 
      as="span" 
      className={`math-inline ${className || ''}`} 
      {...rest}
    >
      <InlineMath math={math} errorColor={errorColor} />
    </Box>
  );
};

export default MathRenderer; 