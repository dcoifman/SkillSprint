import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  Input,
  Select,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tooltip,
  Progress,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import {
  DragDropContext,
  Droppable,
  Draggable
} from 'react-beautiful-dnd';
import {
  FiMoreVertical,
  FiCopy,
  FiTrash2,
  FiEdit2,
  FiClock,
  FiLink,
  FiUnlink,
  FiSave,
  FiPlus
} from 'react-icons/fi';

// Sprint template options
const SPRINT_TEMPLATES = [
  {
    id: 'intro',
    name: 'Introduction Sprint',
    description: 'A template for introducing new concepts',
    structure: {
      duration: '15 min',
      activities: ['concept', 'example', 'practice'],
    }
  },
  {
    id: 'practice',
    name: 'Practice Sprint',
    description: 'Focused on hands-on exercises',
    structure: {
      duration: '30 min',
      activities: ['warmup', 'exercise', 'review'],
    }
  },
  {
    id: 'assessment',
    name: 'Assessment Sprint',
    description: 'Evaluate learning progress',
    structure: {
      duration: '20 min',
      activities: ['quiz', 'feedback'],
    }
  }
];

const SprintCard = ({ sprint, index, isSelected, onSelect }) => {
  return (
    <Draggable draggableId={sprint.id} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg={isSelected ? 'purple.50' : 'white'}
          boxShadow="sm"
          position="relative"
        >
          <HStack justify="space-between" mb={2}>
            <Checkbox
              isChecked={isSelected}
              onChange={(e) => onSelect(sprint.id, e.target.checked)}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem icon={<FiEdit2 />}>Edit Sprint</MenuItem>
                <MenuItem icon={<FiCopy />}>Duplicate</MenuItem>
                <MenuItem icon={<FiTrash2 />} color="red.500">Delete</MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          <VStack align="stretch" spacing={2}>
            <Heading size="sm">{sprint.title}</Heading>
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {sprint.description}
            </Text>
            
            <HStack>
              <Badge colorScheme="purple">{sprint.type}</Badge>
              <Badge colorScheme="blue">
                <HStack spacing={1}>
                  <FiClock />
                  <Text>{sprint.duration}</Text>
                </HStack>
              </Badge>
            </HStack>

            {sprint.dependencies?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="medium" mb={1}>
                  Dependencies:
                </Text>
                <HStack spacing={1}>
                  {sprint.dependencies.map(dep => (
                    <Tag
                      size="sm"
                      key={dep.id}
                      borderRadius="full"
                      variant="outline"
                    >
                      <TagLabel>{dep.title}</TagLabel>
                      <TagCloseButton />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

const SprintManager = ({ moduleId, sprints: initialSprints }) => {
  const [sprints, setSprints] = useState(initialSprints);
  const [selectedSprints, setSelectedSprints] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sprints);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSprints(items);
  };

  // Handle sprint selection
  const handleSprintSelect = (sprintId, isSelected) => {
    const newSelected = new Set(selectedSprints);
    if (isSelected) {
      newSelected.add(sprintId);
    } else {
      newSelected.delete(sprintId);
    }
    setSelectedSprints(newSelected);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        setSprints(sprints.filter(sprint => !selectedSprints.has(sprint.id)));
        setSelectedSprints(new Set());
        toast({
          title: 'Sprints deleted',
          status: 'success',
          duration: 2000,
        });
        break;
      case 'duplicate':
        const newSprints = [...sprints];
        sprints.forEach(sprint => {
          if (selectedSprints.has(sprint.id)) {
            newSprints.push({
              ...sprint,
              id: `${sprint.id}-copy-${Date.now()}`,
              title: `${sprint.title} (Copy)`,
            });
          }
        });
        setSprints(newSprints);
        toast({
          title: 'Sprints duplicated',
          status: 'success',
          duration: 2000,
        });
        break;
      default:
        break;
    }
  };

  // Filter sprints based on search and type
  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = sprint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sprint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || sprint.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header with actions */}
        <HStack justify="space-between">
          <Heading size="lg">Sprint Manager</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="purple"
            onClick={onOpen}
          >
            Add Sprint
          </Button>
        </HStack>

        {/* Filters and bulk actions */}
        <HStack spacing={4}>
          <Input
            placeholder="Search sprints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Types</option>
            <option value="concept">Concept</option>
            <option value="practice">Practice</option>
            <option value="assessment">Assessment</option>
          </Select>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiMoreVertical />}
              isDisabled={selectedSprints.size === 0}
            >
              Bulk Actions ({selectedSprints.size})
            </MenuButton>
            <MenuList>
              <MenuItem 
                icon={<FiCopy />}
                onClick={() => handleBulkAction('duplicate')}
              >
                Duplicate Selected
              </MenuItem>
              <MenuItem 
                icon={<FiLink />}
                onClick={() => handleBulkAction('link')}
              >
                Link Dependencies
              </MenuItem>
              <MenuItem 
                icon={<FiTrash2 />}
                onClick={() => handleBulkAction('delete')}
                color="red.500"
              >
                Delete Selected
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {/* Sprint list with drag and drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sprints">
            {(provided) => (
              <VStack
                ref={provided.innerRef}
                {...provided.droppableProps}
                align="stretch"
                spacing={4}
              >
                {filteredSprints.map((sprint, index) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    index={index}
                    isSelected={selectedSprints.has(sprint.id)}
                    onSelect={handleSprintSelect}
                  />
                ))}
                {provided.placeholder}
              </VStack>
            )}
          </Droppable>
        </DragDropContext>
      </VStack>

      {/* Add Sprint Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Sprint</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">Choose a Template</Heading>
              
              {SPRINT_TEMPLATES.map(template => (
                <Box
                  key={template.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">{template.name}</Heading>
                    <Badge>{template.structure.duration}</Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {template.description}
                  </Text>
                  
                  <HStack>
                    {template.structure.activities.map((activity, i) => (
                      <Badge key={i}>{activity}</Badge>
                    ))}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="purple">
              Create Sprint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SprintManager; 