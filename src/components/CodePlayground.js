import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, Select, useToast } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

const DEFAULT_CODE = {
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  python: '# Write your Python code here\nprint("Hello, World!")',
  html: '<!-- Write your HTML here -->\n<h1>Hello, World!</h1>',
  css: '/* Write your CSS here */\nh1 { color: blue; }'
};

function CodePlayground({ initialLanguage = 'javascript' }) {
  const [code, setCode] = useState(DEFAULT_CODE[initialLanguage]);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      if (language === 'javascript') {
        // Create a safe execution environment
        const safeEval = (code) => {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          
          const sandbox = iframe.contentWindow;
          sandbox.console = {
            log: (msg) => setOutput(prev => prev + msg + '\n'),
            error: (msg) => setOutput(prev => prev + 'Error: ' + msg + '\n')
          };
          
          try {
            sandbox.eval(code);
          } catch (error) {
            setOutput(prev => prev + 'Error: ' + error.message + '\n');
          } finally {
            document.body.removeChild(iframe);
          }
        };
        
        setOutput('');
        safeEval(code);
      } else {
        // For other languages, we'll eventually integrate with backend services
        setOutput('Code execution for ' + language + ' would be handled by backend service');
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE[language]);
    setOutput('');
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
    setOutput('');
  };

  return (
    <VStack spacing={4} align="stretch" p={4} borderWidth={1} borderRadius="md">
      <HStack>
        <Select 
          value={language} 
          onChange={handleLanguageChange}
          width="200px"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
        <Button 
          colorScheme="green" 
          onClick={handleRunCode}
          isLoading={isRunning}
          loadingText="Running"
        >
          Run Code
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          Reset
        </Button>
      </HStack>

      <Box height="400px" borderWidth={1} borderRadius="md" overflow="hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </Box>

      <Box p={4} bg="gray.50" borderRadius="md">
        <Text fontWeight="bold" mb={2}>Output:</Text>
        <Box 
          p={2} 
          bg="white" 
          borderRadius="md" 
          minHeight="100px" 
          fontFamily="monospace" 
          whiteSpace="pre-wrap"
        >
          {output || 'No output yet. Run your code to see results.'}
        </Box>
      </Box>
    </VStack>
  );
}

export default CodePlayground; 