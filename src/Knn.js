import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Badge,
  HStack,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from "papaparse";

function Knn() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // State for KNN training points (default points preloaded)
  const [ageYes, setAgeYes] = useState([25, 30, 35, 40, 50]);
  const [wageYes, setWageYes] = useState([180000, 220000, 190000, 250000, 280000]);
  
  const [ageNo, setAgeNo] = useState([18, 22, 28, 45, 60]);
  const [wageNo, setWageNo] = useState([45000, 60000, 50000, 80000, 95000]);

  // Selected class for click-to-add
  const [selectedClass, setSelectedClass] = useState("Y"); // "Y" = Credit Yes, "N" = Credit No
  
  const [inputMode, setInputMode] = useState("click"); // "click", "form", "csv"
  
  // Form input variables
  const [manualAge, setManualAge] = useState("");
  const [manualWage, setManualWage] = useState("");
  const [manualCredit, setManualCredit] = useState("Y");

  const svgRef = useRef(null);

  // Compute overall min/max for scaling in local storage
  const allAges = [...ageYes, ...ageNo];
  const allWages = [...wageYes, ...wageNo];
  
  const ageMin = allAges.length > 0 ? Math.min(...allAges) : 18;
  const ageMax = allAges.length > 0 ? Math.max(...allAges) : 80;
  const wageMin = allWages.length > 0 ? Math.min(...allWages) : 30000;
  const wageMax = allWages.length > 0 ? Math.max(...allWages) : 300000;

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("ageMin", ageMin.toString());
    localStorage.setItem("ageMax", ageMax.toString());
    localStorage.setItem("wageMin", wageMin.toString());
    localStorage.setItem("wageMax", wageMax.toString());
    localStorage.setItem("ageYes", ageYes.join(","));
    localStorage.setItem("wageYes", wageYes.join(","));
    localStorage.setItem("ageNo", ageNo.join(","));
    localStorage.setItem("wageNo", wageNo.join(","));
  }, [ageYes, ageNo, wageYes, wageNo, ageMin, ageMax, wageMin, wageMax]);

  // Click on SVG to place points
  const handleSvgClick = (e) => {
    if (inputMode !== "click") return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Scale SVG pixels (width/height) to logical coordinates: Age [0, 80], Wage [0, 300000]
    const clickedAge = Math.round((clickX / rect.width) * 80);
    const clickedWage = Math.round((1 - clickY / rect.height) * 300000);
    
    if (selectedClass === "Y") {
      setAgeYes(prev => [...prev, clickedAge]);
      setWageYes(prev => [...prev, clickedWage]);
    } else {
      setAgeNo(prev => [...prev, clickedAge]);
      setWageNo(prev => [...prev, clickedWage]);
    }
  };

  // Form submit manual entry
  const handleAddManual = (e) => {
    e.preventDefault();
    const ageVal = parseFloat(manualAge);
    const wageVal = parseFloat(manualWage);
    
    if (isNaN(ageVal) || isNaN(wageVal)) {
      toast({
        title: "Giriş Hatası",
        description: "Lütfen geçerli sayısal yaş ve maaş değerleri girin.",
        status: "error",
        duration: 2000,
      });
      return;
    }
    
    if (manualCredit === "Y") {
      setAgeYes(prev => [...prev, ageVal]);
      setWageYes(prev => [...prev, wageVal]);
    } else {
      setAgeNo(prev => [...prev, ageVal]);
      setWageNo(prev => [...prev, wageVal]);
    }

    setManualAge("");
    setManualWage("");
  };

  // Clear data
  const handleClear = () => {
    setAgeYes([]);
    setWageYes([]);
    setAgeNo([]);
    setWageNo([]);
  };

  // Preload Preset Datasets
  const loadPreset = (type) => {
    if (type === "clear") {
      // Very clear division based on income
      setAgeYes([30, 35, 40, 48, 55, 60, 38, 42]);
      setWageYes([170000, 190000, 210000, 240000, 280000, 260000, 220000, 205000]);
      setAgeNo([20, 22, 25, 28, 30, 35, 45, 50]);
      setWageNo([40000, 52000, 60000, 48000, 75000, 85000, 90000, 95000]);
    } else if (type === "mixed") {
      // Overlapping regions
      setAgeYes([24, 28, 35, 45, 52, 60, 31, 38, 44]);
      setWageYes([120000, 150000, 220000, 140000, 270000, 190000, 160000, 95000, 230000]);
      setAgeNo([22, 26, 30, 40, 48, 58, 25, 33, 50]);
      setWageNo([50000, 130000, 70000, 110000, 85000, 150000, 45000, 165000, 105000]);
    }
  };

  // Parse CSV
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        const yesA = [], yesW = [];
        const noA = [], noW = [];
        
        results.data.forEach((row) => {
          const age = parseFloat(row[0]);
          const wage = parseFloat(row[1]);
          const credit = row[2] ? row[2].toString().trim().toUpperCase() : "N";
          
          if (!isNaN(age) && !isNaN(wage)) {
            if (credit === "Y" || credit === "YES" || credit === "1" || credit === "EVET") {
              yesA.push(age);
              yesW.push(wage);
            } else {
              noA.push(age);
              noW.push(wage);
            }
          }
        });

        if (yesA.length === 0 && noA.length === 0) {
          toast({
            title: "CSV Yükleme Hatası",
            description: "Geçerli formatta veri bulunamadı (Yaş, Maaş, Kredi Durumu).",
            status: "error",
            duration: 3000,
          });
          return;
        }

        setAgeYes(yesA);
        setWageYes(yesW);
        setAgeNo(noA);
        setWageNo(noW);
        
        toast({
          title: "CSV Başarıyla Yüklendi",
          description: `${yesA.length + noA.length} adet veri noktası aktarıldı.`,
          status: "success",
          duration: 2000,
        });
      }
    });
  };

  return (
    <Box minHeight="100vh" pt="100px" pb="60px" px="4" display="flex" flexDirection="column" alignItems="center" position="relative">
      {/* Background glow light */}
      <Box
        position="absolute"
        top="20%"
        left="50%"
        transform="translateX(-50%)"
        width="450px"
        height="450px"
        borderRadius="full"
        bg="rgba(244, 114, 182, 0.04)"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Heading fontFamily="var(--font-display)" fontSize="4xl" fontWeight="800" mb="2" className="gradient-text">
          k-NN Sınıflandırma Veri Girişi
        </Heading>
        <Text color="gray.400" mb="8" textAlign="center" fontSize="sm" maxWidth="600px">
          Sınıflandırma algoritması için referans (eğitim) noktalarını yerleştirin. Sol panelden sınıfı seçip sağdaki grafiğe tıklayabilir veya CSV yükleyebilirsiniz.
        </Text>

        {/* Dashboard Workspace */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap="8"
          width="100%"
          bg="rgba(15, 23, 42, 0.4)"
          backdropFilter="blur(20px)"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.08)"
          p={{ base: "6", md: "8" }}
          boxShadow="xl"
          align="stretch"
        >
          {/* Controls Panel (Left side) */}
          <Flex direction="column" flex="1" gap="6" justify="space-between">
            <Flex direction="column" gap="5">
              
              {/* Click-to-add Class Selector */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  1. YERLEŞTİRİLECEK VERİ SINIFI
                </Text>
                
                <HStack spacing="3">
                  <Button
                    flex="1"
                    size="sm"
                    bg={selectedClass === "Y" ? "rgba(129, 140, 248, 0.2)" : "transparent"}
                    color={selectedClass === "Y" ? "white" : "gray.400"}
                    border="1px solid"
                    borderColor={selectedClass === "Y" ? "#818cf8" : "rgba(255,255,255,0.08)"}
                    _hover={{ bg: "rgba(129, 140, 248, 0.1)" }}
                    onClick={() => setSelectedClass("Y")}
                    borderRadius="10px"
                    fontSize="xs"
                    fontWeight="700"
                    leftIcon={<Box w="3" h="3" borderRadius="full" bg="#818cf8" />}
                  >
                    Kredi Onaylandı (Evet)
                  </Button>
                  <Button
                    flex="1"
                    size="sm"
                    bg={selectedClass === "N" ? "rgba(244, 114, 182, 0.2)" : "transparent"}
                    color={selectedClass === "N" ? "white" : "gray.400"}
                    border="1px solid"
                    borderColor={selectedClass === "N" ? "#f472b6" : "rgba(255,255,255,0.08)"}
                    _hover={{ bg: "rgba(244, 114, 182, 0.1)" }}
                    onClick={() => setSelectedClass("N")}
                    borderRadius="10px"
                    fontSize="xs"
                    fontWeight="700"
                    leftIcon={<Box w="3" h="3" borderRadius="full" bg="#f472b6" />}
                  >
                    Reddedildi (Hayır)
                  </Button>
                </HStack>
              </Box>

              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Data Entry Selection Tabs */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  2. VERİ GİRİŞ YÖNTEMİ
                </Text>
                
                <HStack spacing="2" mb="4">
                  <Button
                    flex="1"
                    size="sm"
                    variant={inputMode === "click" ? "solid" : "outline"}
                    bg={inputMode === "click" ? "rgba(255,255,255,0.08)" : "transparent"}
                    color="white"
                    borderColor="rgba(255,255,255,0.08)"
                    _hover={{ bg: "rgba(255,255,255,0.12)" }}
                    onClick={() => setInputMode("click")}
                    borderRadius="10px"
                    fontSize="xs"
                  >
                    Tıklayarak
                  </Button>
                  <Button
                    flex="1"
                    size="sm"
                    variant={inputMode === "form" ? "solid" : "outline"}
                    bg={inputMode === "form" ? "rgba(255,255,255,0.08)" : "transparent"}
                    color="white"
                    borderColor="rgba(255,255,255,0.08)"
                    _hover={{ bg: "rgba(255,255,255,0.12)" }}
                    onClick={() => setInputMode("form")}
                    borderRadius="10px"
                    fontSize="xs"
                  >
                    Form ile
                  </Button>
                  <Button
                    flex="1"
                    size="sm"
                    variant={inputMode === "csv" ? "solid" : "outline"}
                    bg={inputMode === "csv" ? "rgba(255,255,255,0.08)" : "transparent"}
                    color="white"
                    borderColor="rgba(255,255,255,0.08)"
                    _hover={{ bg: "rgba(255,255,255,0.12)" }}
                    onClick={() => setInputMode("csv")}
                    borderRadius="10px"
                    fontSize="xs"
                  >
                    CSV Yükle
                  </Button>
                </HStack>

                <AnimatePresence mode="wait">
                  {inputMode === "click" && (
                    <motion.div
                      key="click"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Text fontSize="xs" color="gray.400" lineHeight="relaxed">
                        👉 Yukarıdan yerleştirmek istediğiniz sınıfı seçin, ardından sağdaki grafik alanına serbestçe tıklayarak eğitim noktalarını anında ekleyin.
                      </Text>
                    </motion.div>
                  )}

                  {inputMode === "form" && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleAddManual}>
                        <Flex direction="column" gap="3">
                          <HStack spacing="2">
                            <Box flex="1">
                              <FormLabel fontSize="xs" color="gray.400">Yaş (0 - 80)</FormLabel>
                              <Input
                                bg="rgba(255,255,255,0.03)"
                                borderColor="rgba(255,255,255,0.08)"
                                _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                                _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                                value={manualAge}
                                onChange={(e) => setManualAge(e.target.value)}
                                placeholder="Örn: 28"
                                size="sm"
                                borderRadius="8px"
                              />
                            </Box>
                            <Box flex="1.2">
                              <FormLabel fontSize="xs" color="gray.400">Aylık Maaş (₺)</FormLabel>
                              <Input
                                bg="rgba(255,255,255,0.03)"
                                borderColor="rgba(255,255,255,0.08)"
                                _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                                _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                                value={manualWage}
                                onChange={(e) => setManualWage(e.target.value)}
                                placeholder="Örn: 90000"
                                size="sm"
                                borderRadius="8px"
                              />
                            </Box>
                          </HStack>
                          
                          <HStack spacing="2">
                            <Box flex="1">
                              <FormLabel fontSize="xs" color="gray.400">Kredi Sonucu</FormLabel>
                              <Select
                                size="sm"
                                bg="rgba(255,255,255,0.03)"
                                borderColor="rgba(255,255,255,0.08)"
                                _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                                color="white"
                                value={manualCredit}
                                onChange={(e) => setManualCredit(e.target.value)}
                                borderRadius="8px"
                                fontSize="xs"
                              >
                                <option value="Y" style={{ background: '#0e1423' }}>Evet (Kredi Onay)</option>
                                <option value="N" style={{ background: '#0e1423' }}>Hayır (Kredi Red)</option>
                              </Select>
                            </Box>
                            <Button size="sm" colorScheme="indigo" bg="rgba(129, 140, 248, 0.2)" border="1px solid rgba(129, 140, 248, 0.4)" _hover={{ bg: "rgba(129, 140, 248, 0.3)" }} color="white" type="submit" px="6" alignSelf="flex-end">
                              Ekle
                            </Button>
                          </HStack>
                        </Flex>
                      </form>
                    </motion.div>
                  )}

                  {inputMode === "csv" && (
                    <motion.div
                      key="csv"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box border="2px dashed rgba(255,255,255,0.08)" p="4" borderRadius="12px" textAlign="center" position="relative" _hover={{ borderColor: "rgba(255,255,255,0.2)" }} transition="all 0.2s">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          position="absolute"
                          top="0"
                          left="0"
                          width="100%"
                          height="100%"
                          opacity="0"
                          cursor="pointer"
                        />
                        <Text fontSize="xs" fontWeight="700" color="gray.300" mb="1">CSV Dosyası Sürükleyin veya Seçin</Text>
                        <Text fontSize="10px" color="gray.500">Format: Yaş, Maaş, Sonuç (Y veya N)</Text>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Presets */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  HAZIR ŞABLONLAR
                </Text>
                <Flex gap="2">
                  <Button size="xs" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => loadPreset("clear")}>
                    Net Ayrılmış Sınıflar
                  </Button>
                  <Button size="xs" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => loadPreset("mixed")}>
                    Karışık Dağılmış Sınıflar
                  </Button>
                </Flex>
              </Box>
            </Flex>

            {/* Actions */}
            <Flex direction="column" gap="3" pt="4">
              <HStack spacing="3">
                <Button flex="1" size="md" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.400" _hover={{ bg: "rgba(255, 0, 0, 0.05)", color: "red.300" }} onClick={handleClear}>
                  Verileri Temizle
                </Button>
                
                <Button
                  flex="2"
                  size="md"
                  colorScheme="indigo"
                  bg="indigo.500"
                  color="white"
                  fontWeight="bold"
                  _hover={{ bg: "indigo.600", transform: "scale(1.02)" }}
                  _active={{ transform: "scale(0.98)" }}
                  transition="all 0.2s"
                  isDisabled={allAges.length === 0}
                  onClick={() => navigate("/knn/result")}
                >
                  Sınıflandırmayı Başlat ({allAges.length} Nokta)
                </Button>
              </HStack>
            </Flex>
          </Flex>

          {/* Interactive SVG Visualization Workspace (Right side) */}
          <Flex direction="column" flex="1.2" align="center" gap="4">
            <Flex width="100%" justify="space-between" align="center">
              <HStack spacing="2">
                <Badge colorScheme="indigo" px="2" py="1" borderRadius="md" variant="subtle" fontSize="10px" fontWeight="700">
                  {ageYes.length} Kredi Onay (Evet)
                </Badge>
                <Badge colorScheme="pink" px="2" py="1" borderRadius="md" variant="subtle" fontSize="10px" fontWeight="700">
                  {ageNo.length} Reddedilen (Hayır)
                </Badge>
              </HStack>
              {inputMode === "click" && (
                <Text fontSize="10px" color="gray.400">
                  Grafiğe tıklayarak nokta yerleştirin
                </Text>
              )}
            </Flex>

            {/* SVG Visualizer Canvas */}
            <Box
              position="relative"
              width="100%"
              paddingBottom="100%"
              bg="rgba(0, 0, 0, 0.25)"
              borderRadius="16px"
              border="1px solid rgba(255, 255, 255, 0.08)"
              overflow="hidden"
              cursor={inputMode === "click" ? "crosshair" : "default"}
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
                    {/* Vertical grids (Age axis) */}
                    <line
                      x1={`${line}%`}
                      y1="0"
                      x2={`${line}%`}
                      y2="100%"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1"
                    />
                    {/* Horizontal grids (Wage axis) */}
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

                {/* Yes Class Points (Lavender/Indigo) */}
                <AnimatePresence>
                  {ageYes.map((age, idx) => {
                    const wage = wageYes[idx] !== undefined ? wageYes[idx] : 0;
                    
                    // Map Age [0, 80] -> [0%, 100%], Wage [0, 300000] -> [0%, 100%]
                    const svgX = `${(age / 80) * 100}%`;
                    const svgY = `${(1 - wage / 300000) * 100}%`;

                    return (
                      <motion.circle
                        key={`yes-${idx}`}
                        cx={svgX}
                        cy={svgY}
                        r="7"
                        fill="#818cf8"
                        stroke="#090d16"
                        strokeWidth="1.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* No Class Points (Pink/Rose) */}
                <AnimatePresence>
                  {ageNo.map((age, idx) => {
                    const wage = wageNo[idx] !== undefined ? wageNo[idx] : 0;
                    
                    const svgX = `${(age / 80) * 100}%`;
                    const svgY = `${(1 - wage / 300000) * 100}%`;

                    return (
                      <motion.circle
                        key={`no-${idx}`}
                        cx={svgX}
                        cy={svgY}
                        r="7"
                        fill="#f472b6"
                        stroke="#090d16"
                        strokeWidth="1.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    );
                  })}
                </AnimatePresence>
              </svg>
            </Box>

            {/* Axes Info Display */}
            <Flex width="100%" justify="space-between" px="2" fontSize="xs" fontWeight="700" color="gray.500">
              <Text>Yaş: 0 - 80</Text>
              <Text>Maaş: 0 - 300.000 ₺</Text>
            </Flex>
          </Flex>
        </Flex>
      </motion.div>
    </Box>
  );
}

export default Knn;