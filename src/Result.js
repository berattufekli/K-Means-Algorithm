import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Select,
  FormLabel,
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
  Progress,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

function Result() {
  const navigate = useNavigate();
  const toast = useToast();
  const svgRef = useRef(null);

  // 1. Load training data from local storage
  const rawAgeYes = localStorage.getItem("ageYes") || "";
  const rawWageYes = localStorage.getItem("wageYes") || "";
  const rawAgeNo = localStorage.getItem("ageNo") || "";
  const rawWageNo = localStorage.getItem("wageNo") || "";

  const ageYes = rawAgeYes ? rawAgeYes.split(",").map(Number) : [];
  const wageYes = rawWageYes ? rawWageYes.split(",").map(Number) : [];
  const ageNo = rawAgeNo ? rawAgeNo.split(",").map(Number) : [];
  const wageNo = rawWageNo ? rawWageNo.split(",").map(Number) : [];

  const rawAgeMin = localStorage.getItem("ageMin");
  const rawAgeMax = localStorage.getItem("ageMax");
  const rawWageMin = localStorage.getItem("wageMin");
  const rawWageMax = localStorage.getItem("wageMax");

  const ageMin = parseFloat(rawAgeMin) || 18;
  const ageMax = parseFloat(rawAgeMax) || 80;
  const wageMin = parseFloat(rawWageMin) || 30000;
  const wageMax = parseFloat(rawWageMax) || 300000;

  // 2. State definitions for Query Point & Parameters
  // Start query point at normalized center (0.5, 0.5)
  const [queryPoint, setQueryPoint] = useState({ x: 0.5, y: 0.5 });
  
  // Inputs for form
  const [manualAge, setManualAge] = useState(() => 
    Math.round(ageMin + (ageMax - ageMin) * 0.5).toString()
  );
  const [manualWage, setManualWage] = useState(() => 
    Math.round(wageMin + (wageMax - wageMin) * 0.5).toString()
  );
  const [kValue, setKValue] = useState(5);
  const [distanceFunc, setDistanceFunc] = useState("euclidean"); // "euclidean" or "manhattan"

  // 3. Normalization of Training Data [0, 1]
  const normalizedYes = [];
  ageYes.forEach((age, idx) => {
    const wage = wageYes[idx] !== undefined ? wageYes[idx] : 0;
    const normA = ageMax === ageMin ? 0.5 : (age - ageMin) / (ageMax - ageMin);
    const normW = wageMax === wageMin ? 0.5 : (wage - wageMin) / (wageMax - wageMin);
    normalizedYes.push({
      rawAge: age,
      rawWage: wage,
      x: parseFloat(normA.toFixed(4)),
      y: parseFloat(normW.toFixed(4)),
      credit: "Y"
    });
  });

  const normalizedNo = [];
  ageNo.forEach((age, idx) => {
    const wage = wageNo[idx] !== undefined ? wageNo[idx] : 0;
    const normA = ageMax === ageMin ? 0.5 : (age - ageMin) / (ageMax - ageMin);
    const normW = wageMax === wageMin ? 0.5 : (wage - wageMin) / (wageMax - wageMin);
    normalizedNo.push({
      rawAge: age,
      rawWage: wage,
      x: parseFloat(normA.toFixed(4)),
      y: parseFloat(normW.toFixed(4)),
      credit: "N"
    });
  });

  const allNormalizedPoints = [...normalizedYes, ...normalizedNo];

  // 4. Calculate Distances and Sort Neighbors
  const scoredPoints = allNormalizedPoints.map((pt) => {
    let d;
    if (distanceFunc === "euclidean") {
      d = Math.sqrt(Math.pow(queryPoint.x - pt.x, 2) + Math.pow(queryPoint.y - pt.y, 2));
    } else {
      // Standard Manhattan distance
      d = Math.abs(queryPoint.x - pt.x) + Math.abs(queryPoint.y - pt.y);
    }
    return { ...pt, distance: parseFloat(d.toFixed(4)) };
  }).sort((a, b) => a.distance - b.distance);

  // Take top K neighbors
  const kNearest = scoredPoints.slice(0, Math.min(kValue, scoredPoints.length));
  
  const yesVotes = kNearest.filter(p => p.credit === "Y").length;
  const noVotes = kNearest.length - yesVotes;
  const winnerClass = yesVotes >= noVotes ? "Y" : "N";

  // Max distance within the top K (for the radar sweep boundary)
  const maxKDistance = kNearest.length > 0 ? kNearest[kNearest.length - 1].distance : 0;

  // Form Submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const age = parseFloat(manualAge);
    const wage = parseFloat(manualWage);

    if (isNaN(age) || isNaN(wage)) {
      toast({
        title: "Giriş Hatası",
        description: "Lütfen geçerli sayısal koordinatlar girin.",
        status: "error",
        duration: 2000,
      });
      return;
    }

    // Normalize input coordinates
    const normA = ageMax === ageMin ? 0.5 : (age - ageMin) / (ageMax - ageMin);
    const normW = wageMax === wageMin ? 0.5 : (wage - wageMin) / (wageMax - wageMin);

    setQueryPoint({
      x: parseFloat(normA.toFixed(4)),
      y: parseFloat(normW.toFixed(4))
    });
  };

  // Direct click on SVG to place Query Point
  const handleSvgClick = (e) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to normalized coordinates [0, 1]
    const normX = parseFloat((clickX / rect.width).toFixed(4));
    const normY = parseFloat((1 - clickY / rect.height).toFixed(4));

    setQueryPoint({ x: normX, y: normY });

    // De-normalize to update text fields
    const rawA = Math.round(ageMin + normX * (ageMax - ageMin));
    const rawW = Math.round(wageMin + normY * (wageMax - wageMin));

    setManualAge(rawA.toString());
    setManualWage(rawW.toString());
  };

  // Convert normalized query coordinates back to raw values for displaying
  const rawQueryAge = Math.round(ageMin + queryPoint.x * (ageMax - ageMin));
  const rawQueryWage = Math.round(wageMin + queryPoint.y * (wageMax - wageMin));

  return (
    <Box minHeight="100vh" pt="100px" pb="80px" px="4" display="flex" flexDirection="column" alignItems="center">
      {/* Background soft glow lights */}
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
        bg="rgba(244, 114, 182, 0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Flex direction="column" width="100%" maxWidth="1200px" gap="6">
        {/* Title Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading fontFamily="var(--font-display)" fontSize="3xl" fontWeight="800" className="gradient-text">
              k-NN İnteraktif Sınıflandırma
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Sorgu noktasını test etmek için grafiğe tıklayabilir, $K$ komşu sayısını ve mesafe metriklerini değiştirebilirsiniz.
            </Text>
          </Box>
          <Button size="sm" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => navigate("/knn")}>
            Eğitim Verisine Dön
          </Button>
        </Flex>

        {/* Dashboard grid */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap="6" width="100%" alignItems="stretch">
          
          {/* Interactive SVG Sandbox (7 Columns) */}
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
            <Flex width="100%" justify="space-between" align="center">
              <Badge colorScheme="purple" fontSize="11px" px="2.5" py="1" borderRadius="md">
                Eğitim Noktaları: {allNormalizedPoints.length} Adet
              </Badge>
              <Text fontSize="10px" color="gray.400">
                💡 Sorgu noktasını taşımak için grafik alanına tıklayın
              </Text>
            </Flex>

            {/* Custom Interactive SVG */}
            <Box
              position="relative"
              width="100%"
              paddingBottom="100%"
              bg="rgba(0, 0, 0, 0.25)"
              borderRadius="16px"
              border="1px solid rgba(255, 255, 255, 0.06)"
              overflow="hidden"
              cursor="crosshair"
            >
              <svg
                ref={svgRef}
                onClick={handleSvgClick}
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
                    <line
                      x1="0"
                      y1={`${line}%`}
                      x2="100%"
                      y2={`${line}%`}
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1"
                    />
                  </React.Fragment>
                ))}

                {/* Radar Sweep expanding circle showing neighborhood boundary */}
                {maxKDistance > 0 && (
                  <motion.circle
                    cx={`${queryPoint.x * 100}%`}
                    cy={`${(1 - queryPoint.y) * 100}%`}
                    key={`radar-${queryPoint.x}-${queryPoint.y}-${kValue}-${distanceFunc}`}
                    initial={{ r: 0 }}
                    animate={{ r: `${maxKDistance * 100}%` }}
                    transition={{ type: "spring", stiffness: 70, damping: 15 }}
                    fill="rgba(255, 255, 255, 0.015)"
                    stroke="rgba(251, 191, 36, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Connecting laser beams from query point to K-nearest neighbors */}
                {kNearest.map((pt, idx) => {
                  const startX = `${queryPoint.x * 100}%`;
                  const startY = `${(1 - queryPoint.y) * 100}%`;
                  const endX = `${pt.x * 100}%`;
                  const endY = `${(1 - pt.y) * 100}%`;

                  const strokeColor = pt.credit === "Y" ? "rgba(129, 140, 248, 0.5)" : "rgba(244, 114, 182, 0.5)";

                  return (
                    <motion.line
                      key={`beam-${idx}-${queryPoint.x}-${queryPoint.y}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    />
                  );
                })}

                {/* All Training points */}
                {scoredPoints.map((pt, idx) => {
                  const svgX = `${pt.x * 100}%`;
                  const svgY = `${(1 - pt.y) * 100}%`;
                  
                  // Check if this point is in the top K nearest
                  const isNeighbor = kNearest.some(k => k.x === pt.x && k.y === pt.y);
                  
                  const ptColor = pt.credit === "Y" ? "#818cf8" : "#f472b6";
                  const radius = isNeighbor ? 9.5 : 6.5;

                  return (
                    <motion.circle
                      key={`point-${idx}`}
                      cx={svgX}
                      cy={svgY}
                      r={radius}
                      animate={{
                        r: radius,
                        stroke: isNeighbor ? "#ffffff" : "#090d16",
                        strokeWidth: isNeighbor ? 2 : 1.5
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 15 }}
                      fill={ptColor}
                    />
                  );
                })}

                {/* Animated Query Point (pulsing Amber yellow) */}
                <motion.g
                  animate={{
                    x: `${queryPoint.x * 100}%`,
                    y: `${(1 - queryPoint.y) * 100}%`
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  {/* Outer Pulsing Halo */}
                  <motion.circle
                    cx="0"
                    cy="0"
                    animate={{ r: [12, 20, 12] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                  
                  {/* Glowing inner core representing winning class */}
                  <motion.circle
                    cx="0"
                    cy="0"
                    r="8.5"
                    animate={{
                      fill: winnerClass === "Y" ? "#818cf8" : "#f472b6"
                    }}
                    transition={{ duration: 0.3 }}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0px 0px 4px rgba(251, 191, 36, 0.6))' }}
                  />
                  <text x="12" y="4" fill="#fbbf24" fontSize="9px" fontWeight="bold">Sorgu</text>
                </motion.g>
              </svg>
            </Box>

            {/* Normalized Scale Indicator */}
            <Flex width="100%" justify="space-between" px="2" fontSize="xs" fontWeight="700" color="gray.500">
              <Text>Minimum Değerler</Text>
              <Text>Normalleştirilmiş Alan [0, 1]</Text>
              <Text>Maksimum Değerler</Text>
            </Flex>
          </Box>

          {/* Calculations & HUD Dashboard (5 Columns) */}
          <Box
            gridColumn={{ lg: "span 5" }}
            display="flex"
            flexDirection="column"
            gap="6"
          >
            {/* Parameters Control Card */}
            <Box
              bg="rgba(15, 23, 42, 0.4)"
              backdropFilter="blur(20px)"
              borderRadius="24px"
              border="1px solid rgba(255, 255, 255, 0.08)"
              p="6"
              boxShadow="xl"
            >
              <Heading size="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="4">
                PARAMETRE AYARLARI
              </Heading>

              <form onSubmit={handleFormSubmit}>
                <Flex direction="column" gap="4">
                  {/* Coordinates Form */}
                  <HStack spacing="2">
                    <Box flex="1">
                      <FormLabel fontSize="10px" color="gray.400">Yaş Değeri</FormLabel>
                      <Input
                        size="xs"
                        borderRadius="6px"
                        bg="rgba(255,255,255,0.03)"
                        borderColor="rgba(255,255,255,0.08)"
                        value={manualAge}
                        onChange={(e) => setManualAge(e.target.value)}
                        placeholder="Örn: 30"
                      />
                    </Box>
                    <Box flex="1.2">
                      <FormLabel fontSize="10px" color="gray.400">Aylık Maaş (₺)</FormLabel>
                      <Input
                        size="xs"
                        borderRadius="6px"
                        bg="rgba(255,255,255,0.03)"
                        borderColor="rgba(255,255,255,0.08)"
                        value={manualWage}
                        onChange={(e) => setManualWage(e.target.value)}
                        placeholder="Örn: 150000"
                      />
                    </Box>
                    <Button type="submit" size="xs" colorScheme="indigo" px="4" alignSelf="flex-end">
                      Taşı
                    </Button>
                  </HStack>

                  {/* K Slider / Input */}
                  <Box>
                    <FormLabel fontSize="10px" color="gray.400">Komşu Sayısı K: {kValue}</FormLabel>
                    <HStack spacing="3">
                      <input
                        type="range"
                        min="1"
                        max={Math.max(1, allNormalizedPoints.length)}
                        value={kValue}
                        onChange={(e) => setKValue(parseInt(e.target.value))}
                        style={{
                          flex: 1,
                          accentColor: '#818cf8',
                          background: 'rgba(255,255,255,0.08)',
                          height: '4px',
                          borderRadius: '2px',
                          outline: 'none'
                        }}
                      />
                      <Input
                        size="xs"
                        width="12"
                        textAlign="center"
                        borderRadius="6px"
                        bg="rgba(255,255,255,0.03)"
                        borderColor="rgba(255,255,255,0.08)"
                        value={kValue}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) setKValue(val);
                        }}
                      />
                    </HStack>
                  </Box>

                  {/* Distance metric */}
                  <Box>
                    <FormLabel fontSize="10px" color="gray.400">Uzaklık Fonksiyonu</FormLabel>
                    <Select
                      size="xs"
                      borderRadius="6px"
                      bg="rgba(255,255,255,0.03)"
                      borderColor="rgba(255,255,255,0.08)"
                      color="white"
                      value={distanceFunc}
                      onChange={(e) => setDistanceFunc(e.target.value)}
                    >
                      <option value="euclidean" style={{ background: '#0e1423' }}>Öklid (Euclidean) Uzaklığı</option>
                      <option value="manhattan" style={{ background: '#0e1423' }}>Manhattan Uzaklığı</option>
                    </Select>
                  </Box>
                </Flex>
              </form>
            </Box>

            {/* Voting HUD Display */}
            <Box
              bg="rgba(15, 23, 42, 0.4)"
              backdropFilter="blur(20px)"
              borderRadius="24px"
              border="1px solid rgba(255, 255, 255, 0.08)"
              p="6"
              boxShadow="xl"
            >
              <Heading size="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="4">
                SINIFLANDIRMA OYLAMA SONUCU
              </Heading>

              <Flex direction="column" gap="3">
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs" fontWeight="bold">Sorgu Koordinatları:</Text>
                  <Text fontSize="xs" color="gray.300">Yaş: {rawQueryAge} | Maaş: {rawQueryWage.toLocaleString()}₺</Text>
                </Flex>
                
                <Flex align="center" justify="space-between" mt="1">
                  <Text fontSize="xs" fontWeight="bold">Tahmin Edilen Sınıf:</Text>
                  <Badge colorScheme={winnerClass === "Y" ? "indigo" : "pink"} fontSize="xs" px="2.5" py="1" borderRadius="full">
                    {winnerClass === "Y" ? "EVET (ONAYLANDI)" : "HAYIR (REDDEDİLDİ)"}
                  </Badge>
                </Flex>

                {/* Vote Bars */}
                <Box mt="2">
                  <Flex justify="space-between" fontSize="10px" color="gray.400" mb="1">
                    <Text color="#a5b4fc">Evet Oyları: {yesVotes}</Text>
                    <Text color="#fbcfe8">Hayır Oyları: {noVotes}</Text>
                  </Flex>
                  <Progress
                    value={kValue > 0 ? (yesVotes / kNearest.length) * 100 : 0}
                    size="sm"
                    borderRadius="full"
                    bg="rgba(244, 114, 182, 0.2)"
                    colorScheme="indigo"
                  />
                </Box>
              </Flex>
            </Box>

            {/* Sorted Neighbors List Card */}
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
                EN YAKIN KOMŞULAR (UZAKLIĞA GÖRE SIRALI)
              </Heading>

              <TableContainer overflowY="auto" maxHeight="200px" flex="1">
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="#0e1423" zIndex={1}>
                    <Tr>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">Yaş/Maaş</Th>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">Sınıf</Th>
                      <Th borderColor="rgba(255,255,255,0.06)" fontSize="9px" px="2">Uzaklık</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {scoredPoints.map((pt, idx) => {
                      const isNeighbor = kNearest.some(k => k.x === pt.x && k.y === pt.y);
                      return (
                        <Tr
                          key={idx}
                          bg={isNeighbor ? "rgba(255, 255, 255, 0.03)" : "transparent"}
                          _hover={{ bg: "rgba(255,255,255,0.02)" }}
                        >
                          <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2">
                            {pt.rawAge} / {pt.rawWage.toLocaleString()}₺
                          </Td>
                          <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2">
                            <Badge colorScheme={pt.credit === "Y" ? "indigo" : "pink"} size="sm" fontSize="9px">
                              {pt.credit === "Y" ? "Evet" : "Hayır"}
                            </Badge>
                          </Td>
                          <Td borderColor="rgba(255,255,255,0.04)" fontSize="10px" px="2" fontWeight={isNeighbor ? "bold" : "normal"}>
                            {pt.distance.toFixed(4)} {isNeighbor && "🌟"}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </SimpleGrid>
      </Flex>
    </Box>
  );
}

export default Result;