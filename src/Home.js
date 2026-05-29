import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Heading, Text, Button, Badge } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

// Mini visualizer component for KNN
function MiniKnnDemo() {
  const [query, setQuery] = useState({ x: 100, y: 100 });
  const points = [
    { x: 30, y: 40, label: 'A' },
    { x: 50, y: 80, label: 'A' },
    { x: 60, y: 30, label: 'A' },
    { x: 150, y: 130, label: 'B' },
    { x: 170, y: 150, label: 'B' },
    { x: 130, y: 170, label: 'B' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuery({
        x: 60 + Math.random() * 80,
        y: 60 + Math.random() * 80
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate distances and find 3 nearest neighbors
  const scoredPoints = points.map(p => {
    const d = Math.sqrt(Math.pow(p.x - query.x, 2) + Math.pow(p.y - query.y, 2));
    return { ...p, d };
  }).sort((a, b) => a.d - b.d);

  const kNeighbors = scoredPoints.slice(0, 3);
  const aVotes = kNeighbors.filter(p => p.label === 'A').length;
  const winnerClass = aVotes >= 2 ? 'A' : 'B';

  return (
    <Box position="relative" width="200px" height="200px" bg="rgba(0,0,0,0.2)" borderRadius="xl" overflow="hidden" border="1px solid rgba(255,255,255,0.05)">
      <svg width="100%" height="100%">
        {/* Connection lines to nearest neighbors */}
        {kNeighbors.map((p, idx) => (
          <motion.line
            key={idx}
            x1={query.x}
            y1={query.y}
            x2={p.x}
            y2={p.y}
            stroke={winnerClass === 'A' ? '#a5b4fc' : '#fecdd3'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}

        {/* Training points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="6"
            fill={p.label === 'A' ? '#818cf8' : '#f472b6'}
          />
        ))}

        {/* Query point */}
        <motion.circle
          cx={query.x}
          cy={query.y}
          animate={{
            r: [8, 12, 8],
            fill: winnerClass === 'A' ? '#818cf8' : '#f472b6'
          }}
          transition={{
            r: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          stroke="white"
          strokeWidth="2"
        />

        {/* KNN boundary circle */}
        {kNeighbors.length > 0 && (
          <motion.circle
            cx={query.x}
            cy={query.y}
            initial={{ r: 0 }}
            animate={{ r: kNeighbors[2].d }}
            transition={{ duration: 0.8, type: 'spring' }}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        )}
      </svg>
    </Box>
  );
}

// Mini visualizer component for KMeans
function MiniKMeansDemo() {
  const [centroids, setCentroids] = useState([
    { x: 50, y: 50, color: '#818cf8' },
    { x: 150, y: 150, color: '#34d399' }
  ]);

  const points = [
    { x: 40, y: 60 }, { x: 60, y: 40 }, { x: 30, y: 30 },
    { x: 160, y: 140 }, { x: 140, y: 160 }, { x: 170, y: 170 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate iteration: shift slightly
      setCentroids([
        { x: 35 + Math.random() * 20, y: 35 + Math.random() * 20, color: '#818cf8' },
        { x: 145 + Math.random() * 20, y: 145 + Math.random() * 20, color: '#34d399' }
      ]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box position="relative" width="200px" height="200px" bg="rgba(0,0,0,0.2)" borderRadius="xl" overflow="hidden" border="1px solid rgba(255,255,255,0.05)">
      <svg width="100%" height="100%">
        {/* Points colored based on closest centroid */}
        {points.map((p, idx) => {
          const d0 = Math.sqrt(Math.pow(p.x - centroids[0].x, 2) + Math.pow(p.y - centroids[0].y, 2));
          const d1 = Math.sqrt(Math.pow(p.x - centroids[1].x, 2) + Math.pow(p.y - centroids[1].y, 2));
          const color = d0 < d1 ? centroids[0].color : centroids[1].color;
          return (
            <motion.circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="6"
              animate={{ fill: color }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

        {/* Centroids */}
        {centroids.map((c, idx) => (
          <motion.g key={idx} animate={{ x: c.x, y: c.y }} transition={{ type: 'spring', stiffness: 80 }}>
            {/* Pulsing indicator */}
            <motion.circle
              cx={0}
              cy={0}
              animate={{ r: [10, 16, 10] }}
              transition={{ repeat: Infinity, duration: 2 }}
              fill="none"
              stroke={c.color}
              strokeWidth="1.5"
              opacity="0.5"
            />
            {/* Center diamond shape */}
            <path
              d="M 0 -8 L 8 0 L 0 8 L -8 0 Z"
              fill={c.color}
              stroke="white"
              strokeWidth="2"
            />
          </motion.g>
        ))}
      </svg>
    </Box>
  );
}

function Home() {
  return (
    <Box
      minHeight="100vh"
      pt="120px"
      pb="80px"
      px="4"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {/* Decorative ambient background lights */}
      <Box
        position="absolute"
        top="10%"
        left="15%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="rgba(129, 140, 248, 0.12)"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="15%"
        right="15%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="rgba(244, 114, 182, 0.12)"
        filter="blur(80px)"
        pointerEvents="none"
      />

      {/* Main Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <Heading
          fontFamily="var(--font-display)"
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="800"
          letterSpacing="-1.5px"
          mb="4"
        >
          <span className="gradient-text">Yapay Zeka ve Makine Öğrenimi</span>
          <br />
          Görsel Algoritma Laboratuvarı
        </Heading>
        <Text
          fontSize={{ base: "md", md: "xl" }}
          color="gray.400"
          maxWidth="600px"
          mx="auto"
          fontWeight="500"
          lineHeight="tall"
        >
          K-Means ve k-NN algoritmalarının matematiksel arka planını pürüzsüz animasyonlar ve tamamen interaktif görselleştiriciler ile deneyimleyerek öğrenin.
        </Text>
      </motion.div>

      {/* Cards Container */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap="8"
        width="100%"
        maxWidth="1000px"
        justify="center"
        align="stretch"
      >
        {/* kNN Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: 1, display: 'flex' }}
        >
          <Flex
            direction="column"
            justify="space-between"
            align="center"
            p="8"
            borderRadius="24px"
            bg="rgba(15, 23, 42, 0.45)"
            backdropFilter="blur(16px)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            boxShadow="0 20px 40px -15px rgba(0, 0, 0, 0.3)"
            _hover={{ borderColor: "rgba(129, 140, 248, 0.3)", transform: "translateY(-5px)" }}
            transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            flex="1"
            gap="6"
          >
            <Flex direction="column" align="center" gap="3">
              <Badge colorScheme="indigo" px="3" py="1" borderRadius="full" fontSize="xs" fontWeight="700">
                DENETİMLİ ÖĞRENME
              </Badge>
              <Heading fontFamily="var(--font-display)" size="lg" fontWeight="700" color="white">
                k-NN (k-En Yakın Komşu)
              </Heading>
              <Text fontSize="sm" color="gray.400" textAlign="center" lineHeight="relaxed">
                Verilen bir hedef noktanın sınıfını tahmin etmek için ona en yakın konumdaki <b>k adet</b> etiketli eğitim noktasının çoğunluk oyuna başvuran temel sınıflandırma algoritmasıdır.
              </Text>
            </Flex>

            {/* Live Interactive Canvas Mini Demo */}
            <MiniKnnDemo />

            <Link to="/knn" style={{ width: '100%' }}>
              <Button
                width="100%"
                py="6"
                borderRadius="16px"
                bg="white"
                color="black"
                fontWeight="700"
                fontSize="md"
                _hover={{ bg: "gray.200", transform: "scale(1.02)" }}
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.2s"
                boxShadow="0 10px 20px -5px rgba(255, 255, 255, 0.1)"
              >
                Algoritmayı Dene
              </Button>
            </Link>
          </Flex>
        </motion.div>

        {/* K-Means Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ flex: 1, display: 'flex' }}
        >
          <Flex
            direction="column"
            justify="space-between"
            align="center"
            p="8"
            borderRadius="24px"
            bg="rgba(15, 23, 42, 0.45)"
            backdropFilter="blur(16px)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            boxShadow="0 20px 40px -15px rgba(0, 0, 0, 0.3)"
            _hover={{ borderColor: "rgba(244, 114, 182, 0.3)", transform: "translateY(-5px)" }}
            transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            flex="1"
            gap="6"
          >
            <Flex direction="column" align="center" gap="3">
              <Badge colorScheme="pink" px="3" py="1" borderRadius="full" fontSize="xs" fontWeight="700">
                DENETİMSİZ ÖĞRENME
              </Badge>
              <Heading fontFamily="var(--font-display)" size="lg" fontWeight="700" color="white">
                K-Means (K-Ortalamalar)
              </Heading>
              <Text fontSize="sm" color="gray.400" textAlign="center" lineHeight="relaxed">
                Etiketsiz verileri birbirine olan mesafelerine göre <b>K adet</b> kümeye ayıran, her adımda küme merkezlerini (centroid) yeniden hesaplayıp güncelleyen popüler bir kümeleme algoritmasıdır.
              </Text>
            </Flex>

            {/* Live Interactive Canvas Mini Demo */}
            <MiniKMeansDemo />

            <Link to="/kmeans" style={{ width: '100%' }}>
              <Button
                width="100%"
                py="6"
                borderRadius="16px"
                bg="white"
                color="black"
                fontWeight="700"
                fontSize="md"
                _hover={{ bg: "gray.200", transform: "scale(1.02)" }}
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.2s"
                boxShadow="0 10px 20px -5px rgba(255, 255, 255, 0.1)"
              >
                Algoritmayı Dene
              </Button>
            </Link>
          </Flex>
        </motion.div>
      </Flex>
    </Box>
  );
}

export default Home;