import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BellIcon,
} from '@chakra-ui/icons';

function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const isLoggedIn = false; // This would be determined by auth context in a real app

  return (
    <Box position="sticky" top={0} zIndex="sticky" bg={useColorModeValue('white', 'gray.800')} shadow="sm">
      <Container maxW="7xl">
        <Flex
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 0 }}
          align={'center'}
          justify="space-between"
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              fontSize="xl"
              color={useColorModeValue('primary.600', 'primary.300')}
              fontWeight={700}
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none' }}
              display="flex"
              alignItems="center"
            >
              <Icon 
                viewBox="0 0 24 24" 
                boxSize={6} 
                mr={2} 
                fill="currentColor"
              >
                <path d="M4.5 2C3.12 2 2 3.12 2 4.5v15C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 3.12 20.88 2 19.5 2h-15zM12 5.5l6 3.5v2.5l-6-3.5-6 3.5V9l6-3.5zm0 5.5l6 3.5v2.5l-6-3.5-6 3.5V14.5L12 11zm0 5.5l6 3.5V22h-2l-4-2-4 2H6v-2l6-3.5z" />
              </Icon>
              SkillSprint
            </Text>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={{ base: 2, md: 4 }}
            align="center"
          >
            {isLoggedIn ? (
              <HStack spacing={3}>
                <Box position="relative">
                  <IconButton
                    icon={<BellIcon />}
                    variant="ghost"
                    aria-label="Notifications"
                    fontSize="lg"
                  />
                  <Box
                    position="absolute"
                    top="0"
                    right="0"
                    width="8px"
                    height="8px"
                    borderRadius="full"
                    bg="accent.500"
                  />
                </Box>
                
                <Menu>
                  <MenuButton 
                    as={Avatar}
                    size="sm"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80" 
                    cursor="pointer"
                    _hover={{ shadow: 'md' }}
                  />
                  <MenuList>
                    <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                    <MenuItem as={RouterLink} to="/dashboard">Dashboard</MenuItem>
                    <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
                    <MenuDivider />
                    <MenuItem>Sign Out</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  fontSize={'sm'}
                  fontWeight={500}
                  variant={'link'}
                  color={'gray.600'}
                  to={'/login'}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  size={{ base: 'sm', md: 'md' }}
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight={600}
                  colorScheme="primary"
                  to={'/signup'}
                  leftIcon={
                    <Icon viewBox="0 0 24 24" boxSize={4}>
                      <path
                        fill="currentColor"
                        d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                      />
                    </Icon>
                  }
                >
                  Sign Up Free
                </Button>
              </>
            )}
          </Stack>
        </Flex>
      </Container>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('primary.600', 'primary.300');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <HStack spacing={6}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                position="relative"
                _before={{
                  content: "''",
                  position: 'absolute',
                  width: '0%',
                  height: '2px',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'primary.600',
                  transition: 'all 0.3s ease-in-out',
                }}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                  _before: { width: '100%' },
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}>
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </HStack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('primary.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'primary.600' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'primary.600'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      borderBottomWidth={1}
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      <Box pt={2}>
        <Button
          as={RouterLink}
          to="/login"
          w="full"
          variant="outline"
          colorScheme="primary"
          size="sm"
          mb={3}
        >
          Sign In
        </Button>
        <Button
          as={RouterLink}
          to="/signup"
          w="full"
          colorScheme="primary"
          size="sm"
        >
          Sign Up Free
        </Button>
      </Box>
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} as={RouterLink} to={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Explore',
    href: '/explore',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Learning Paths',
    href: '/paths',
    children: [
      {
        label: 'Popular Paths',
        subLabel: 'Trending skill pathways',
        href: '/paths/popular',
      },
      {
        label: 'New Paths',
        subLabel: 'Recently added learning paths',
        href: '/paths/new',
      },
    ],
  },
  {
    label: 'Community',
    href: '/community',
  },
];

export default Header; 