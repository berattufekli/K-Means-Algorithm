import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

function Iteration() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // 1. Get and clean data from localStorage
  const rawFirstMin = localStorage.getItem("firstAttrMin");
  const rawSecondMin = localStorage.getItem("secondAttrMin");
  const rawFirstMax = localStorage.getItem("firstAttrMax");
  const rawSecondMax = localStorage.getItem("secondAttrMax");
  
  const firstAttrMin = parseFloat(rawFirstMin) || 0;
  const secondAttrMin = parseFloat(rawSecondMin) || 0;
  const firstAttrMax = parseFloat(rawFirstMax) || 100;
  const secondAttrMax = parseFloat(rawSecondMax) || 100;
  
  const twoAttr = localStorage.getItem("twoAttr") || "2"; // "2" = 2D, "1" = 1D
  const firstAttrName = localStorage.getItem("firstAttrName") || "X Ekseni";
  const secondAttrName = localStorage.getItem("secondAttrName") || "Y Ekseni";

  const rawXValues = localStorage.getItem("xvalues") || "";
  const rawYValues = localStorage.getItem("yvalues") || "";

  const xval = rawXValues ? rawXValues.split(",").map(Number) : [];
  const yval = rawYValues ? rawYValues.split(",").map(Number) : [];

  // Parse & Normalize Points
  const points = [];
  if (twoAttr === "2") {
    // 2D Normalization
    xval.forEach((x, idx) => {
      const y = yval[idx] !== undefined ? yval[idx] : 0;
      const normX = firstAttrMax === firstAttrMin ? 0.5 : (x - firstAttrMin) / (firstAttrMax - firstAttrMin);
      const normY = secondAttrMax === secondAttrMin ? 0.5 : (y - secondAttrMin) / (secondAttrMax - secondAttrMin);
      points.push({
        rawX: x,
        rawY: y,
        x: parseFloat(normX.toFixed(4)),
        y: parseFloat(normY.toFixed(4)),
        idx
      });
    });
  } else {
    // 1D (keep raw but calculate normalized values for rendering)
    xval.forEach((x, idx) => {
      const normX = firstAttrMax === firstAttrMin ? 0.5 : (x - firstAttrMin) / (firstAttrMax - firstAttrMin);
      points.push({
        rawX: x,
        rawY: 0,
        x: x, // logic calculations done on raw X for 1D, keeping compat with original
        normX: parseFloat(normX.toFixed(4)),
        idx
      });
    });
  }

  // 2. State definitions
  const [iteration, setIteration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef(null);

  // Initialize centroids
  const getRandomCentroid = (isY = false) => {
    if (twoAttr === "1") {
      // 1D: random within raw limits
      return Math.round(Math.random() * (firstAttrMax - firstAttrMin) + firstAttrMin);
    } else {
      // 2D: random within [0, 1]
      return parseFloat(Math.random().toFixed(4));
    }
  };

  const [centroid1, setCentroid1] = useState(() => ({
    x: getRandomCentroid(),
    y: twoAttr === "2" ? getRandomCentroid(true) : 0
  }));

  const [centroid2, setCentroid2] = useState(() => ({
    x: getRandomCentroid(),
    y: twoAttr === "2" ? getRandomCentroid(true) : 0
  }));

  // Inputs for manual Centroid setting
  const [inputC1X, setInputC1X] = useState(centroid1.x.toString());
  const [inputC1Y, setInputC1Y] = useState(centroid1.y.toString());
  const [inputC2X, setInputC2X] = useState(centroid2.x.toString());
  const [inputC2Y, setInputC2Y] = useState(centroid2.y.toString());

  // 3. Mathematical Calculations per step
  const calculatedPoints = [];
  let sumC1X = 0, sumC1Y = 0, countC1 = 0;
  let sumC2X = 0, sumC2Y = 0, countC2 = 0;

  points.forEach((pt) => {
    let dist1, dist2, nearest;

    if (twoAttr === "1") {
      // 1D Euclidean/Absolute distance
      dist1 = Math.abs(pt.x - centroid1.x);
      dist2 = Math.abs(pt.x - centroid2.x);
    } else {
      // 2D Euclidean distance
      dist1 = Math.sqrt(Math.pow(pt.x - centroid1.x, 2) + Math.pow(pt.y - centroid1.y, 2));
      dist2 = Math.sqrt(Math.pow(pt.x - centroid2.x, 2) + Math.pow(pt.y - centroid2.y, 2));
    }

    if (dist1 < dist2) {
      nearest = "c1";
    } else if (dist2 < dist1) {
      nearest = "c2";
    } else {
      nearest = "equal";
    }

    // Accumulations for recalculating averages
    if (nearest === "c1" || (nearest === "equal" && countC1 <= countC2)) {
      sumC1X += pt.x;
      sumC1Y += pt.y || 0;
      countC1 += 1;
      calculatedPoints.push({ ...pt, dist1, dist2, nearest: "c1" });
    } else {
      sumC2X += pt.x;
      sumC2Y += pt.y || 0;
      countC2 += 1;
      calculatedPoints.push({ ...pt, dist1, dist2, nearest: "c2" });
    }
  });

  const nextC1X = countC1 > 0 ? parseFloat((sumC1X / countC1).toFixed(4)) : centroid1.x;
  const nextC1Y = countC1 > 0 ? parseFloat((sumC1Y / countC1).toFixed(4)) : centroid1.y;
  const nextC2X = countC2 > 0 ? parseFloat((sumC2X / countC2).toFixed(4)) : centroid2.x;
  const nextC2Y = countC2 > 0 ? parseFloat((sumC2Y / countC2).toFixed(4)) : centroid2.y;

  // Check for Convergence (if centroids stop shifting)
  const isConverged =
    centroid1.x === nextC1X &&
    centroid1.y === nextC1Y &&
    centroid2.x === nextC2X &&
    centroid2.y === nextC2Y;

  // 4. Interaction Handlers
  const handleNextStep = () => {
    if (isConverged) {
      setIsPlaying(false);
      toast({
        title: "Algoritma Yakınsadı!",
        description: "Küme merkezleri artık hareket etmiyor. K-Means başarıyla tamamlandı.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCentroid1({ x: nextC1X, y: nextC1Y });
    setCentroid2({ x: nextC2X, y: nextC2Y });
    
    // Sync input forms
    setInputC1X(nextC1X.toString());
    setInputC1Y(nextC1Y.toString());
    setInputC2X(nextC2X.toString());
    setInputC2Y(nextC2Y.toString());

    setIteration(prev => prev + 1);
  };

  // Set centroids manually
  const handleApplyCentroids = (e) => {
    e.preventDefault();
    const c1x = parseFloat(inputC1X);
    const c1y = twoAttr === "2" ? parseFloat(inputC1Y) : 0;
    const c2x = parseFloat(inputC2X);
    const c2y = twoAttr === "2" ? parseFloat(inputC2Y) : 0;

    if (isNaN(c1x) || isNaN(c2x) || (twoAttr === "2" && (isNaN(c1y) || isNaN(c2y)))) {
      toast({
        title: "Giriş Hatası",
        description: "Lütfen merkez noktaları için geçerli koordinatlar girin.",
        status: "error",
        duration: 2000,
      });
      return;
    }

    setCentroid1({ x: c1x, y: c1y });
    setCentroid2({ x: c2x, y: c2y });
    setIteration(1);
    setIsPlaying(false);
    toast({
      title: "Centroid'ler Güncellendi",
      description: "Yeni küme merkezleri uygulandı. İterasyon sıfırlandı.",
      status: "info",
      duration: 2000,
    });
  };

  // Re-randomize initial centroids
  const handleRandomize = () => {
    const c1 = { x: getRandomCentroid(), y: twoAttr === "2" ? getRandomCentroid(true) : 0 };
    const c2 = { x: getRandomCentroid(), y: twoAttr === "2" ? getRandomCentroid(true) : 0 };
    setCentroid1(c1);
    setCentroid2(c2);
    setInputC1X(c1.x.toString());
    setInputC1Y(c1.y.toString());
    setInputC2X(c2.x.toString());
    setInputC2Y(c2.y.toString());
    setIteration(1);
    setIsPlaying(false);
  };

  // Autoplay control
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        if (isConverged) {
          setIsPlaying(false);
        } else {
          handleNextStep();
        }
      }, 1500);
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying, isConverged, centroid1, centroid2]);

  return (
    <Box minHeight="100vh" pt="100px" pb="80px" px="4" display="flex" flexDirection="column" alignItems="center">
      {/* Background radial glow */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="rgba(129, 140, 248, 0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="5%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="rgba(52, 211, 153, 0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Flex direction="column" width="100%" maxWidth="1200px" gap="6">
        {/* Upper Title Section */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading fontFamily="var(--font-display)" fontSize="3xl" fontWeight="800" className="gradient-text">
              K-Means İnteraktif Simülasyonu
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Algoritmanın verileri adımlarla nasıl grupladığını izleyin. Merkezler (centroid) hareket etmeyene kadar devam edin.
            </Text>
          </Box>
          <HStack spacing="3">
            <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => navigate("/kmeans")}>
              Veri Girişine Dön
            </Button>
            <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={handleRandomize}>
              Merkezleri Sıfırla
            </Button>
          </HStack>
        </Flex>

        {/* Dashboard Grid Workspace */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap="6" width="100%" alignItems="stretch">
          
          {/* SVG Visualizer Canvas (9 Columns in base grid or split 7/5) */}
          <Box
            gridColumn={{ lg: "span 7" }}
            bg="rgba(15, 23, 42, 0.4)"
            backdropFilter="blur(20px)"
            borderRadius="24px"
            border="1px solid rgba(255, 255, 255, 0.08)"
            p="6"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="5"
          >
            {/* Playback HUD */}
            <Flex width="100%" justify="space-between" align="center">
              <HStack spacing="2">
                <Badge colorScheme="purple" fontSize="11px" px="2" py="1" borderRadius="md">
                  İterasyon: {iteration}
                </Badge>
                {isConverged ? (
                  <Badge colorScheme="emerald" bg="rgba(16, 185, 129, 0.2)" border="1px solid rgba(16, 185, 129, 0.4)" color="emerald.200" fontSize="11px" px="2" py="1" borderRadius="md">
                    Yakınsadı ✓
                  </Badge>
                ) : (
                  <Badge colorScheme="yellow" bg="rgba(234, 179, 8, 0.15)" border="1px solid rgba(234, 179, 8, 0.3)" color="yellow.200" fontSize="11px" px="2" py="1" borderRadius="md">
                    Aktif Çalışıyor...
                  </Badge>
                )}
              </HStack>

              {/* Automatic Control buttons */}
              <HStack spacing="2">
                <Button
                  size="xs"
                  colorScheme="indigo"
                  variant={isPlaying ? "solid" : "outline"}
                  onClick={() => setIsPlaying(!isPlaying)}
                  fontSize="10px"
                  borderRadius="full"
                  px="3"
                >
                  {isPlaying ? "▌▌ Duraklat" : "▶ Otomatik Oynat"}
                </Button>
                <Button
                  size="xs"
                  colorScheme="teal"
                  isDisabled={isConverged || isPlaying}
                  onClick={handleNextStep}
                  fontSize="10px"
                  borderRadius="full"
                  px="3"
                >
                  Sonraki Adım ➔
                </Button>
              </HStack>
            </Flex>

            {/* SVG Visualizer Area */}
            <Box
              position="relative"
              width="100%"
              paddingBottom="100%"
              bg="rgba(0, 0, 0, 0.25)"
              borderRadius="16px"
              border="1px solid rgba(255, 255, 255, 0.06)"
              overflow="hidden"
            >
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* SVG Coordinate Grid Lines */}
                {[20, 40, 60, 80].map((line, idx) => (
                  <React.Fragment key={idx}>
                    {/* Vertical grids */}
                    <line
                      x1={`${line}%`}
                      y1="0"
                      x2={`${line}%`}
                      y2="100%"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1"
                    />
                    {/* Horizontal grids */}
                    {twoAttr === "2" && (
                      <line
                        x1="0"
                        y1={`${line}%`}
                        x2="100%"
                        y2={`${line}%`}
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth="1"
                      />
                    )}
                  </React.Fragment>
                ))}

                {/* 1D Center Line if single attribute */}
                {twoAttr === "1" && (
                  <line
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Dashed connector lines from points to assigned centroids */}
                {calculatedPoints.map((pt, idx) => {
                  let startX, startY, endX, endY;
                  
                  if (twoAttr === "2") {
                    startX = `${pt.x * 100}%`;
                    startY = `${(1 - pt.y) * 100}%`;
                    
                    const activeCentroid = pt.nearest === "c1" ? centroid1 : centroid2;
                    endX = `${activeCentroid.x * 100}%`;
                    endY = `${(1 - activeCentroid.y) * 100}%`;
                  } else {
                    startX = `${pt.normX * 100}%`;
                    startY = "50%";
                    
                    // In 1D, map centroid raw values to percentages
                    const activeCentroid = pt.nearest === "c1" ? centroid1 : centroid2;
                    const normCX = firstAttrMax === firstAttrMin ? 0.5 : (activeCentroid.x - firstAttrMin) / (firstAttrMax - firstAttrMin);
                    endX = `${normCX * 100}%`;
                    endY = "50%";
                  }

                  const strokeColor = pt.nearest === "c1" ? "rgba(129, 140, 248, 0.15)" : "rgba(52, 211, 153, 0.15)";

                  return (
                    <line
                      key={`line-${idx}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={strokeColor}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* Plotted Data Points */}
                {calculatedPoints.map((pt, idx) => {
                  // Determine display coordinates
                  let svgX, svgY;
                  if (twoAttr === "2") {
                    svgX = `${pt.x * 100}%`;
                    svgY = `${(1 - pt.y) * 100}%`;
                  } else {
                    svgX = `${pt.normX * 100}%`;
                    svgY = "50%";
                  }

                  // Determine color based on cluster assignment
                  const pointColor = pt.nearest === "c1" ? "#818cf8" : "#34d399";

                  return (
                    <motion.circle
                      key={`point-${idx}`}
                      cx={svgX}
                      cy={svgY}
                      r="6.5"
                      animate={{ fill: pointColor }}
                      transition={{ duration: 0.3 }}
                      stroke="#090d16"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Centroid 1 (Lavender Indigo) */}
                <motion.g
                  animate={{
                    x: twoAttr === "2" 
                      ? `${centroid1.x * 100}%` 
                      : `${(firstAttrMax === firstAttrMin ? 0.5 : (centroid1.x - firstAttrMin) / (firstAttrMax - firstAttrMin)) * 100}%`,
                    y: twoAttr === "2" 
                      ? `${(1 - centroid1.y) * 100}%` 
                      : "50%"
                  }}
                  transition={{ type: "spring", stiffness: 85, damping: 15 }}
                >
                  {/* Outer Pulsing Halo */}
                  <motion.circle
                    cx="0"
                    cy="0"
                    animate={{ r: [12, 18, 12] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                  {/* Center Diamond Marker */}
                  <path
                    d="M 0 -9 L 9 0 L 0 9 L -9 0 Z"
                    fill="#818cf8"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text x="12" y="4" fill="#a5b4fc" fontSize="9px" fontWeight="bold">C1</text>
                </motion.g>

                {/* Centroid 2 (Mint Teal) */}
                <motion.g
                  animate={{
                    x: twoAttr === "2" 
                      ? `${centroid2.x * 100}%` 
                      : `${(firstAttrMax === firstAttrMin ? 0.5 : (centroid2.x - firstAttrMin) / (firstAttrMax - firstAttrMin)) * 100}%`,
                    y: twoAttr === "2" 
                      ? `${(1 - centroid2.y) * 100}%` 
                      : "50%"
                  }}
                  transition={{ type: "spring", stiffness: 85, damping: 15 }}
                >
                  {/* Outer Pulsing Halo */}
                  <motion.circle
                    cx="0"
                    cy="0"
                    animate={{ r: [12, 18, 12] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                  {/* Center Diamond Marker */}
                  <path
                    d="M 0 -9 L 9 0 L 0 9 L -9 0 Z"
                    fill="#34d399"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text x="12" y="4" fill="#a7f3d0" fontSize="9px" fontWeight="bold">C2</text>
                </motion.g>
              </svg>
            </Box>

            {/* Educational Info bar */}
            <Box width="100%" p="4" bg="rgba(255,255,255,0.02)" borderRadius="12px" border="1px solid rgba(255,255,255,0.05)">
              <Text fontSize="xs" fontWeight="600" color="gray.400" mb="1">Şu Anda Ne Oluyor?</Text>
              <Text fontSize="xs" color="gray.300">
                {isConverged
                  ? "Kümeleme tamamlandı! Centroid koordinatları, kendilerine en yakın olan verilerin ortalamasına denk geldiği için sistem kararlı duruma ulaştı."
                  : "Her nokta, kendine en yakın olan küme merkezine (C1 veya C2) atanır. 'Sonraki Adım' tuşuna basıldığında merkezler, kendilerine bağlı noktaların ortalama koordinatlarına doğru hareket edecektir."
                }
              </Text>
            </Box>
          </Box>

          {/* Mathematical Computations Dashboard (5 Columns) */}
          <Box
            gridColumn={{ lg: "span 5" }}
            display="flex"
            flexDirection="column"
            gap="6"
          >
            {/* Centroid Controls Card */}
            <Box
              bg="rgba(15, 23, 42, 0.4)"
              backdropFilter="blur(20px)"
              borderRadius="24px"
              border="1px solid rgba(255, 255, 255, 0.08)"
              p="6"
              boxShadow="xl"
            >
              <Heading size="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="4">
                MERKEZ NOKTALARINI AYARLA
              </Heading>

              <form onSubmit={handleApplyCentroids}>
                <Flex direction="column" gap="4">
                  {/* Centroid 1 inputs */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#a5b4fc" mb="2">C1 (1. Merkez) Koordinatları</Text>
                    <HStack spacing="2">
                      <Box flex="1">
                        <Input
                          size="xs"
                          borderRadius="6px"
                          bg="rgba(255,255,255,0.03)"
                          borderColor="rgba(255,255,255,0.08)"
                          value={inputC1X}
                          onChange={(e) => setInputC1X(e.target.value)}
                          placeholder="X değeri"
                        />
                      </Box>
                      {twoAttr === "2" && (
                        <Box flex="1">
                          <Input
                            size="xs"
                            borderRadius="6px"
                            bg="rgba(255,255,255,0.03)"
                            borderColor="rgba(255,255,255,0.08)"
                            value={inputC1Y}
                            onChange={(e) => setInputC1Y(e.target.value)}
                            placeholder="Y değeri"
                          />
                        </Box>
                      )}
                    </HStack>
                  </Box>

                  {/* Centroid 2 inputs */}
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#a7f3d0" mb="2">C2 (2. Merkez) Koordinatları</Text>
                    <HStack spacing="2">
                      <Box flex="1">
                        <Input
                          size="xs"
                          borderRadius="6px"
                          bg="rgba(255,255,255,0.03)"
                          borderColor="rgba(255,255,255,0.08)"
                          value={inputC2X}
                          onChange={(e) => setInputC2X(e.target.value)}
                          placeholder="X değeri"
                        />
                      </Box>
                      {twoAttr === "2" && (
                        <Box flex="1">
                          <Input
                            size="xs"
                            borderRadius="6px"
                            bg="rgba(255,255,255,0.03)"
                            borderColor="rgba(255,255,255,0.08)"
                            value={inputC2Y}
                            onChange={(e) => setInputC2Y(e.target.value)}
                            placeholder="Y değeri"
                          />
                        </Box>
                      )}
                    </HStack>
                  </Box>

                  <Button type="submit" size="xs" colorScheme="indigo" width="100%">
                    Konumları Güncelle
                  </Button>
                </Flex>
              </form>
            </Box>

            {/* Calculations Table Card */}
            <Box
              bg="rgba(15, 23, 42, 0.4)"
              backdropFilter="blur(20px)"
              borderRadius="24px"
              border="1px solid rgba(255, 255, 255, 0.08)"
              p="6"
              boxShadow="xl"
              flex="1"
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Heading size="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="4">
                İTERASYON HESAPLAMALARI
              </Heading>

              <TableContainer overflowY="auto" maxHeight="300px" flex="1">
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="#0e1423" zIndex={1}>
                    <Tr>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">Değer</Th>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">C1 Uzaklık</Th>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">C2 Uzaklık</Th>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">Küme</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {calculatedPoints.map((pt, idx) => (
                      <Tr key={idx} _hover={{ bg: "rgba(255,255,255,0.02)" }}>
                        <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2" fontWeight="600">
                          {twoAttr === "2" ? `[${pt.rawX}, ${pt.rawY}]` : pt.x}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2" color="gray.400">
                          {pt.dist1.toFixed(3)}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2" color="gray.400">
                          {pt.dist2.toFixed(3)}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2">
                          <Badge colorScheme={pt.nearest === "c1" ? "indigo" : "emerald"} size="sm" fontSize="9px">
                            {pt.nearest === "c1" ? "C1" : "C2"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Cluster Averages Summary */}
              <Box pt="4" mt="4" borderTop="1px solid rgba(255,255,255,0.08)" fontSize="11px">
                <Text fontWeight="bold" color="gray.400" mb="2">Gelecek Merkez Koordinatları (Aritmetik Ortalama):</Text>
                <Flex justify="space-between" mb="1">
                  <Text color="#a5b4fc">C1 Yeni Merkez:</Text>
                  <Text fontWeight="600">{twoAttr === "2" ? `[${nextC1X}, ${nextC1Y}]` : nextC1X}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="#a7f3d0">C2 Yeni Merkez:</Text>
                  <Text fontWeight="600">{twoAttr === "2" ? `[${nextC2X}, ${nextC2Y}]` : nextC2X}</Text>
                </Flex>
              </Box>
            </Box>
          </Box>
        </SimpleGrid>
      </Flex>
    </Box>
  );
}

export default Iteration;