import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flex, Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

function NavBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'K-Means', path: '/kmeans' },
    { label: 'k-NN', path: '/knn' }
  ];

  return (
    <Box
      position="fixed"
      top="20px"
      left="50%"
      transform="translateX(-50%)"
      zIndex="1000"
      width="90%"
      maxWidth="600px"
    >
      <Flex
        align="center"
        justify="space-between"
        px="6"
        py="3"
        borderRadius="full"
        bg="rgba(15, 23, 42, 0.65)"
        backdropFilter="blur(16px)"
        border="1px solid rgba(255, 255, 255, 0.08)"
        boxShadow="0 10px 30px -10px rgba(0, 0, 0, 0.5)"
      >
        <Link to="/">
          <Text
            fontSize="lg"
            fontWeight="800"
            fontFamily="var(--font-display)"
            letterSpacing="-0.5px"
            bgGradient="linear(to-r, #a5b4fc, #f472b6)"
            bgClip="text"
            cursor="pointer"
            _hover={{ opacity: 0.9 }}
            transition="all 0.2s"
          >
            Algoritmalar
          </Text>
        </Link>

        <Flex gap="2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Box key={item.path} position="relative">
                <Link to={item.path}>
                  <Box
                    px="4"
                    py="2"
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="600"
                    color={isActive ? "white" : "gray.400"}
                    transition="color 0.3s ease"
                    _hover={{ color: "white" }}
                    position="relative"
                    zIndex="1"
                  >
                    {item.label}
                  </Box>
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      zIndex: 0,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
}

export default NavBar;