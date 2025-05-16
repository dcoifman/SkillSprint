import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Select, Button, HStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import ThreeDAnatomyModel from './ThreeDAnatomyModel';

export default {
  title: 'Components/ThreeDAnatomyModel',
  component: ThreeDAnatomyModel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An advanced interactive 3D anatomy model visualization with professional medical rendering techniques.',
      },
    },
  },
  argTypes: {
    systemType: {
      control: { type: 'select' },
      options: ['skeletal', 'muscular', 'nervous', 'circulatory', 'respiratory'],
      description: 'Type of anatomical system to display',
      defaultValue: 'skeletal',
    },
    initialView: {
      control: { type: 'select' },
      options: ['anterior', 'posterior', 'lateral', 'superior', 'inferior'],
      description: 'Initial viewing angle',
      defaultValue: 'anterior',
    },
  },
};

// Basic usage template
const Template = (args) => {
  const [selectedStructure, setSelectedStructure] = useState(null);
  
  return (
    <Box p={4}>
      <Heading mb={4}>3D Anatomy Model</Heading>
      <ThreeDAnatomyModel
        {...args}
        selectedStructure={selectedStructure}
        onSelectStructure={setSelectedStructure}
      />
      {selectedStructure && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="lg">
          <Heading size="md">Selected Structure: {selectedStructure}</Heading>
        </Box>
      )}
    </Box>
  );
};

// Interactive explorer template
const InteractiveTemplate = () => {
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [systemType, setSystemType] = useState('skeletal');
  const [view, setView] = useState('anterior');
  
  return (
    <Box p={4}>
      <Heading mb={4}>Interactive Anatomy Explorer</Heading>
      
      <HStack mb={6} spacing={4}>
        <Box>
          <Text fontWeight="bold" mb={2}>System Type</Text>
          <Select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            width="200px"
          >
            <option value="skeletal">Skeletal</option>
            <option value="muscular">Muscular</option>
            <option value="nervous">Nervous</option>
            <option value="circulatory">Circulatory</option>
            <option value="respiratory">Respiratory</option>
          </Select>
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2}>View</Text>
          <Select
            value={view}
            onChange={(e) => setView(e.target.value)}
            width="200px"
          >
            <option value="anterior">Anterior</option>
            <option value="posterior">Posterior</option>
            <option value="lateral">Lateral</option>
            <option value="superior">Superior</option>
            <option value="inferior">Inferior</option>
          </Select>
        </Box>
      </HStack>
      
      <ThreeDAnatomyModel
        systemType={systemType}
        initialView={view}
        selectedStructure={selectedStructure}
        onSelectStructure={setSelectedStructure}
      />
      
      {selectedStructure && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="lg">
          <Heading size="md">Selected Structure: {selectedStructure}</Heading>
          <Text mt={2}>
            Click on different structures in the model to see their names and information.
          </Text>
        </Box>
      )}
    </Box>
  );
};

// Educational template 
const EducationalTemplate = () => {
  const [selectedStructure, setSelectedStructure] = useState(null);
  
  return (
    <Box p={4}>
      <Heading mb={4}>Anatomy Learning Tool</Heading>
      
      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Skeletal System</Tab>
          <Tab>Muscular System</Tab>
          <Tab>Nervous System</Tab>
          <Tab>Circulatory System</Tab>
          <Tab>Respiratory System</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box display="flex" flexDirection={["column", "column", "row"]}>
              <Box flex="1">
                <ThreeDAnatomyModel
                  systemType="skeletal"
                  initialView="anterior"
                  selectedStructure={selectedStructure}
                  onSelectStructure={setSelectedStructure}
                />
              </Box>
              <Box flex="1" ml={[0, 0, 6]} mt={[4, 4, 0]}>
                <Heading size="md" mb={4}>Skeletal System</Heading>
                <Text>
                  The skeletal system provides structure, protection, and movement in conjunction with muscles. 
                  It consists of 206 bones in adults, along with cartilage and connective tissues.
                </Text>
                
                {selectedStructure && (
                  <Box mt={4} p={4} bg="purple.50" borderRadius="md">
                    <Heading size="sm" mb={2}>{selectedStructure}</Heading>
                    <Text>
                      Click on different bones in the 3D model to learn more about their structure and function.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box display="flex" flexDirection={["column", "column", "row"]}>
              <Box flex="1">
                <ThreeDAnatomyModel
                  systemType="muscular"
                  initialView="anterior"
                  selectedStructure={selectedStructure}
                  onSelectStructure={setSelectedStructure}
                />
              </Box>
              <Box flex="1" ml={[0, 0, 6]} mt={[4, 4, 0]}>
                <Heading size="md" mb={4}>Muscular System</Heading>
                <Text>
                  The muscular system consists of approximately 600 muscles that make up about 40% of body weight. 
                  These muscles provide movement, stability, and heat production.
                </Text>
                
                {selectedStructure && (
                  <Box mt={4} p={4} bg="red.50" borderRadius="md">
                    <Heading size="sm" mb={2}>{selectedStructure}</Heading>
                    <Text>
                      Click on different muscles in the 3D model to learn more about their structure and function.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <ThreeDAnatomyModel 
              systemType="nervous" 
              initialView="anterior"
              selectedStructure={selectedStructure}
              onSelectStructure={setSelectedStructure}
            />
          </TabPanel>
          
          <TabPanel>
            <ThreeDAnatomyModel 
              systemType="circulatory" 
              initialView="anterior"
              selectedStructure={selectedStructure}
              onSelectStructure={setSelectedStructure}
            />
          </TabPanel>
          
          <TabPanel>
            <ThreeDAnatomyModel 
              systemType="respiratory" 
              initialView="anterior"
              selectedStructure={selectedStructure}
              onSelectStructure={setSelectedStructure}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Stories
export const Default = Template.bind({});
Default.args = {
  systemType: 'skeletal',
  initialView: 'anterior',
};

export const MuscularSystem = Template.bind({});
MuscularSystem.args = {
  systemType: 'muscular',
  initialView: 'anterior',
};

export const InteractiveExplorer = InteractiveTemplate.bind({});

export const EducationalTool = EducationalTemplate.bind({}); 