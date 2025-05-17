import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Box } from '@chakra-ui/react';

/**
 * Enhanced markdown renderer with LaTeX math support
 * 
 * Renders markdown content with support for:
 * - Inline math using $...$ syntax
 * - Block math using $$...$$ syntax
 * 
 * @param {Object} props
 * @param {string} props.children - The markdown content to render
 * @param {string} props.className - Additional CSS class names
 */
const MarkdownWithMath = ({ children, className = '', ...rest }) => {
  return (
    <Box 
      className={`markdown-content ${className}`}
      {...rest}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownWithMath; 