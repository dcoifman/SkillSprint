import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, Select, useToast, Spinner, Center } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../contexts/AuthContext';
import { saveCodeSnippet, loadCodeSnippet } from '../services/supabaseClient';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

const DEFAULT_CODE = {
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  html: '<!-- Write your HTML here -->\n<h1>Hello, World!</h1>',
  css: '/* Write your CSS here */\nh1 { color: blue; }'
};

function CodePlayground({ initialLanguage = 'javascript' }) {
  const { user, loading: authLoading } = useAuth();
  const [code, setCode] = useState(DEFAULT_CODE[initialLanguage]);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSnippet, setIsLoadingSnippet] = useState(true);
  const toast = useToast();
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!user || authLoading) {
        setIsLoadingSnippet(false);
        return;
      }
      setIsLoadingSnippet(true);
      const { code: savedCode, error } = await loadCodeSnippet(user.id, language);
      if (error) {
        console.error('Error loading snippet:', error);
        toast({
          title: 'Error loading code',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setCode(DEFAULT_CODE[language]); 
      } else if (savedCode !== null) {
        setCode(savedCode);
      } else {
        setCode(DEFAULT_CODE[language]);
      }
      setIsLoadingSnippet(false);
    };

    fetchSnippet();
  }, [user, language, authLoading]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      if (language === 'javascript') {
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
        setOutput('Code execution is only available for JavaScript.\n(Save/Load functionality is active)');
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save code.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsSaving(true);
    const { error } = await saveCodeSnippet(user.id, language, code);
    setIsSaving(false);

    if (error) {
      console.error('Error saving code:', error);
      toast({
        title: 'Error saving code',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Code saved',
        description: 'Your code snippet has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLoadCode = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to load code.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoadingSnippet(true);
    const { code: loadedCode, error } = await loadCodeSnippet(user.id, language);
    setIsLoadingSnippet(false);

    if (error) {
      console.error('Error loading snippet:', error);
      toast({
        title: 'Error loading code',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else if (loadedCode !== null) {
      setCode(loadedCode);
      toast({
        title: 'Code loaded',
        description: 'Your saved code snippet has been loaded.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'No saved code',
        description: 'No saved snippet found for this language.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setCode(DEFAULT_CODE[language]);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE[language]);
    setOutput('');
    toast({
      title: 'Code reset',
      description: 'Editor content reset to default.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setOutput('');
  };

  if (authLoading || isLoadingSnippet) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text ml={4}>Loading code playground...</Text>
      </Center>
    );
  }

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