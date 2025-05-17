import React, { useState, useEffect } from 'react';
import {
  Box,
  Textarea,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
  Heading,
  Text,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  SettingsIcon,
  SmallCloseIcon,
  CopyIcon
} from '@chakra-ui/icons';
import MathRenderer from './MathRenderer.js';
import MarkdownWithMath from './MarkdownWithMath.js';

// Common LaTeX symbols and templates for quick insertion
const LATEX_SHORTCUTS = [
  { label: 'Fraction', value: '\\frac{a}{b}' },
  { label: 'Exponent', value: 'a^{b}' },
  { label: 'Square Root', value: '\\sqrt{x}' },
  { label: 'Integral', value: '\\int_{a}^{b} f(x) dx' },
  { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
  { label: 'Product', value: '\\prod_{i=1}^{n} x_i' },
  { label: 'Limit', value: '\\lim_{x \\to 0} f(x)' },
  { label: 'Matrix', value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
  { label: 'Cases', value: '\\begin{cases} f(x) & \\text{if } x \\geq 0 \\\\ g(x) & \\text{if } x < 0 \\end{cases}' },
  { label: 'Derivative', value: '\\frac{d}{dx} f(x)' },
  { label: 'Partial Derivative', value: '\\frac{\\partial f}{\\partial x}' },
  { label: 'Infinity', value: '\\infty' },
  { label: 'Greek Letters', value: '\\alpha, \\beta, \\gamma, \\delta, \\theta, \\pi' },
];

/**
 * A LaTeX math editor component for creating and previewing math expressions
 * 
 * @param {Object} props
 * @param {string} props.initialContent - Initial markdown content with LaTeX
 * @param {function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text for the editor
 */
const MathEditor = ({ initialContent = '', onChange, placeholder = 'Enter content with LaTeX math...', ...props }) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toolbarBgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Update content when initialContent prop changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  // Handle content changes
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };
  
  // Insert a LaTeX shortcut into the content
  const insertLatex = (latexValue, isBlock = false) => {
    const insertText = isBlock ? `\n$$${latexValue}$$\n` : `$${latexValue}$`;
    
    // Get current cursor position
    const textarea = document.getElementById('math-editor-textarea');
    if (!textarea) return;
    
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    // Insert text at cursor position
    const newContent = content.substring(0, startPos) + insertText + content.substring(endPos);
    setContent(newContent);
    
    // Focus back on textarea and set cursor position after inserted text
    textarea.focus();
    const newPosition = startPos + insertText.length;
    textarea.setSelectionRange(newPosition, newPosition);
    
    if (onChange) {
      onChange(newContent);
    }
  };
  
  // Copy the content to clipboard
  const copyContent = () => {
    navigator.clipboard.writeText(content);
  };
  
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor} {...props}>
      <Tabs isFitted variant="enclosed" onChange={setActiveTab} index={activeTab}>
        <TabList>
          <Tab>Edit</Tab>
          <Tab>Preview</Tab>
        </TabList>
        
        <TabPanels>
          {/* Edit Panel */}
          <TabPanel p={0}>
            <VStack spacing={0} align="stretch">
              {/* Toolbar with LaTeX shortcuts */}
              <Box 
                p={2} 
                borderBottomWidth="1px" 
                borderColor={borderColor} 
                bg={toolbarBgColor}
                overflowX="auto"
                whiteSpace="nowrap"
              >
                <HStack spacing={2}>
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      onClick={() => insertLatex('\\frac{a}{b}')}
                      aria-label="Insert fraction"
                    >
                      ⅟
                    </Button>
                    <Button
                      onClick={() => insertLatex('\\sqrt{x}')}
                      aria-label="Insert square root"
                    >
                      √
                    </Button>
                    <Button
                      onClick={() => insertLatex('^{}')}
                      aria-label="Insert exponent"
                    >
                      x²
                    </Button>
                    <Button
                      onClick={() => insertLatex('\\sum_{i=1}^{n}')}
                      aria-label="Insert sum"
                    >
                      Σ
                    </Button>
                    <Button
                      onClick={() => insertLatex('\\int_{a}^{b}')}
                      aria-label="Insert integral"
                    >
                      ∫
                    </Button>
                  </ButtonGroup>
                  
                  <Tooltip label="More LaTeX Commands">
                    <Button
                      size="sm"
                      leftIcon={<AddIcon />}
                      onClick={() => setActiveTab(2)}
                      variant="ghost"
                    >
                      More
                    </Button>
                  </Tooltip>
                  
                  <Tooltip label="Copy Content">
                    <IconButton
                      size="sm"
                      icon={<CopyIcon />}
                      onClick={copyContent}
                      aria-label="Copy content"
                      variant="ghost"
                    />
                  </Tooltip>
                </HStack>
              </Box>
              
              {/* Text editor */}
              <Textarea
                id="math-editor-textarea"
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                minHeight="200px"
                p={4}
                borderWidth={0}
                borderRadius={0}
                resize="vertical"
                fontFamily="monospace"
              />
              
              {/* Helpful instructions */}
              <Box 
                p={2} 
                fontSize="sm" 
                color="gray.500" 
                borderTopWidth="1px" 
                borderColor={borderColor}
              >
                <Text>
                  Use <code>$...$</code> for inline math and <code>$$...$$</code> for display math.
                </Text>
              </Box>
            </VStack>
          </TabPanel>
          
          {/* Preview Panel */}
          <TabPanel p={4}>
            {content ? (
              <MarkdownWithMath>
                {content}
              </MarkdownWithMath>
            ) : (
              <Text color="gray.500">Enter content in Edit tab to see preview</Text>
            )}
          </TabPanel>
          
          {/* LaTeX Templates Panel */}
          <TabPanel p={4}>
            <Heading size="md" mb={4}>LaTeX Commands Library</Heading>
            <Text mb={4}>Click any template to insert it into your content</Text>
            
            <VStack spacing={4} align="stretch" maxHeight="300px" overflowY="auto">
              {LATEX_SHORTCUTS.map((shortcut, index) => (
                <Box 
                  key={index} 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  borderColor={borderColor}
                  _hover={{ bg: hoverBgColor }}
                  cursor="pointer"
                  onClick={() => {
                    insertLatex(shortcut.value, true);
                    setActiveTab(0); // Switch back to edit tab
                  }}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm">{shortcut.label}</Heading>
                    <Text as="code" fontSize="sm" color="purple.500">{shortcut.value}</Text>
                  </Flex>
                  <Divider mb={2} />
                  <Box bg={hoverBgColor} p={2} borderRadius="md">
                    <MathRenderer math={shortcut.value} block />
                  </Box>
                </Box>
              ))}
            </VStack>
            
            <Button 
              mt={4} 
              colorScheme="purple" 
              onClick={() => setActiveTab(0)}
              leftIcon={<SmallCloseIcon />}
            >
              Close Library
            </Button>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default MathEditor; 