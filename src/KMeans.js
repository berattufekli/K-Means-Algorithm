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
  IconButton,
  Tooltip,
  Badge,
  HStack,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from "papaparse";

function KMeans() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // State for attributes
  const [firstAttribute, setFirstAttribute] = useState([20, 25, 30, 70, 75, 80]);
  const [secondAttribute, setSecondAttribute] = useState([20, 30, 25, 75, 80, 70]);
  
  const [firstAttrName, setFirstAttrName] = useState("Gelir");
  const [secondAttrName, setSecondAttrName] = useState("Harcama Skoru");
  const [twoAttr, setTwoAttr] = useState(true); // true = 2 attributes, false = 1 attribute
  
  const [manualFirstVal, setManualFirstVal] = useState("");
  const [manualSecondVal, setManualSecondVal] = useState("");
  
  const [inputMode, setInputMode] = useState("click"); // "click", "form", "csv"
  
  const svgRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    const xMax = firstAttribute.length > 0 ? Math.max(...firstAttribute) : 100;
    const xMin = firstAttribute.length > 0 ? Math.min(...firstAttribute) : 0;
    const yMax = secondAttribute.length > 0 ? Math.max(...secondAttribute) : 100;
    const yMin = secondAttribute.length > 0 ? Math.min(...secondAttribute) : 0;

    localStorage.setItem("xvalues", firstAttribute.join(","));
    localStorage.setItem("yvalues", secondAttribute.join(","));
    localStorage.setItem("firstAttrMax", xMax.toString());
    localStorage.setItem("secondAttrMax", yMax.toString());
    localStorage.setItem("firstAttrMin", xMin.toString());
    localStorage.setItem("secondAttrMin", yMin.toString());
    localStorage.setItem("firstAttrName", firstAttrName || "X Ekseni");
    localStorage.setItem("secondAttrName", secondAttrName || "Y Ekseni");
    localStorage.setItem("twoAttr", twoAttr ? "2" : "1");
  }, [firstAttribute, secondAttribute, firstAttrName, secondAttrName, twoAttr]);

  // Click on SVG to place points
  const handleSvgClick = (e) => {
    if (inputMode !== "click") return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Scale SVG pixels (0 to 400) to logical coordinates (0 to 100)
    const newX = Math.round((clickX / rect.width) * 100);
    const newY = twoAttr ? Math.round((1 - clickY / rect.height) * 100) : 0;
    
    setFirstAttribute(prev => [...prev, newX]);
    setSecondAttribute(prev => [...prev, newY]);
  };

  // Form submit manual entry
  const handleAddManual = (e) => {
    e.preventDefault();
    const x = parseFloat(manualFirstVal);
    const y = twoAttr ? parseFloat(manualSecondVal) : 0;
    
    if (isNaN(x) || (twoAttr && isNaN(y))) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli sayısal değerler girin.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setFirstAttribute(prev => [...prev, x]);
    setSecondAttribute(prev => [...prev, y]);
    setManualFirstVal("");
    setManualSecondVal("");
  };

  // Clear data
  const handleClear = () => {
    setFirstAttribute([]);
    setSecondAttribute([]);
  };

  // Preload Preset Datasets
  const loadPreset = (type) => {
    if (type === "clusters") {
      // 3 clear clusters in 2D
      setFirstAttribute([15, 20, 18, 22, 80, 85, 82, 78, 50, 48, 55, 52]);
      setSecondAttribute([20, 18, 25, 22, 80, 85, 75, 78, 50, 55, 48, 52]);
      setTwoAttr(true);
    } else if (type === "linear") {
      // Linear looking trend
      setFirstAttribute([10, 20, 30, 40, 50, 60, 70, 80, 90]);
      setSecondAttribute([15, 25, 32, 45, 48, 58, 72, 79, 92]);
      setTwoAttr(true);
    } else if (type === "oneDim") {
      // 1D line dataset
      setFirstAttribute([12, 15, 18, 45, 48, 52, 85, 88, 92]);
      setSecondAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      setTwoAttr(false);
    }
  };

  // Handle CSV parser
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        const xArr = [];
        const yArr = [];
        
        results.data.forEach((row) => {
          const valX = parseFloat(row[0]);
          const valY = parseFloat(row[1]);
          
          if (!isNaN(valX)) {
            xArr.push(valX);
            yArr.push(isNaN(valY) || !twoAttr ? 0 : valY);
          }
        });

        if (xArr.length === 0) {
          toast({
            title: "CSV Yükleme Hatası",
            description: "Geçerli veri bulunamadı.",
            status: "error",
            duration: 2000,
          });
          return;
        }

        // Normalize loaded data to [10, 90] bounds for display, but keep proportional
        const minX = Math.min(...xArr);
        const maxX = Math.max(...xArr);
        const minY = yArr.length > 0 ? Math.min(...yArr) : 0;
        const maxY = yArr.length > 0 ? Math.max(...yArr) : 100;

        const scaleX = maxX === minX ? 1 : 80 / (maxX - minX);
        const scaleY = maxY === minY ? 1 : 80 / (maxY - minY);

        const scaledX = xArr.map(x => Math.round(10 + (x - minX) * scaleX));
        const scaledY = twoAttr ? yArr.map(y => Math.round(10 + (y - minY) * scaleY)) : yArr.map(() => 0);

        setFirstAttribute(scaledX);
        setSecondAttribute(scaledY);
        
        toast({
          title: "CSV Başarıyla Yüklendi",
          description: `${xArr.length} veri noktası aktarıldı.`,
          status: "success",
          duration: 2000,
        });
      }
    });
  };

  // Switch attribute counts
  const handleToggleAttrCount = () => {
    setTwoAttr(!twoAttr);
    setFirstAttribute([]);
    setSecondAttribute([]);
  };

  return (
    <Box
      minHeight="100vh"
      pt="100px"
      pb="60px"
      px="4"
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
    >
      {/* Background soft glow */}
      <Box
        position="absolute"
        top="20%"
        left="50%"
        transform="translateX(-50%)"
        width="450px"
        height="450px"
        borderRadius="full"
        bg="rgba(129, 140, 248, 0.05)"
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
          K-Means Veri Girişi ve Hazırlık
        </Heading>
        <Text color="gray.400" mb="8" textAlign="center" fontSize="sm" maxWidth="600px">
          K-Means kümeleme işlemi için veri setinizi oluşturun. Grafiğe doğrudan tıklayarak veri ekleyebilir, CSV yükleyebilir veya hazır şablonları kullanabilirsiniz.
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
            <Flex direction="column" gap="4">
              {/* Attribute Configuration */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  ÖZELLİK YAPILANDIRMASI
                </Text>
                
                <Flex align="center" justify="space-between" mb="4">
                  <Text fontSize="sm" fontWeight="600" color="gray.300">
                    Boyut Sayısı ({twoAttr ? "İki" : "Tek"} Boyutlu)
                  </Text>
                  <Switch isChecked={twoAttr} onChange={handleToggleAttrCount} colorScheme="indigo" size="md" />
                </Flex>

                <HStack spacing="3" mb="4">
                  <Box flex="1">
                    <FormLabel fontSize="xs" color="gray.400">1. Özellik (X Ekseni)</FormLabel>
                    <Input
                      bg="rgba(255,255,255,0.03)"
                      borderColor="rgba(255,255,255,0.08)"
                      _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                      _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                      value={firstAttrName}
                      onChange={(e) => setFirstAttrName(e.target.value)}
                      placeholder="Örn: Yaş"
                      size="sm"
                      borderRadius="8px"
                      fontSize="xs"
                    />
                  </Box>
                  {twoAttr && (
                    <Box flex="1">
                      <FormLabel fontSize="xs" color="gray.400">2. Özellik (Y Ekseni)</FormLabel>
                      <Input
                        bg="rgba(255,255,255,0.03)"
                        borderColor="rgba(255,255,255,0.08)"
                        _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                        _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                        value={secondAttrName}
                        onChange={(e) => setSecondAttrName(e.target.value)}
                        placeholder="Örn: Maaş"
                        size="sm"
                        borderRadius="8px"
                        fontSize="xs"
                      />
                    </Box>
                  )}
                </HStack>
              </Box>

              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Data Entry Tabs */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  VERİ GİRİŞ YÖNTEMİ
                </Text>
                
                <HStack spacing="2" mb="4">
                  {/* Click to add */}
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
                  {/* Form input */}
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
                  {/* CSV load */}
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

                {/* Conditional render of methods */}
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
                        👉 Sağ taraftaki grafik alanına doğrudan fareyle tıklayarak noktalarınızı serbestçe yerleştirebilirsiniz. Her tıklama yeni bir veri noktası ekler.
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
                        <HStack spacing="2" align="flex-end">
                          <Box flex="1">
                            <FormLabel fontSize="xs" color="gray.400">{firstAttrName} Değeri</FormLabel>
                            <Input
                              bg="rgba(255,255,255,0.03)"
                              borderColor="rgba(255,255,255,0.08)"
                              _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                              _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                              value={manualFirstVal}
                              onChange={(e) => setManualFirstVal(e.target.value)}
                              placeholder="0 - 100"
                              size="sm"
                              borderRadius="8px"
                            />
                          </Box>
                          {twoAttr && (
                            <Box flex="1">
                              <FormLabel fontSize="xs" color="gray.400">{secondAttrName} Değeri</FormLabel>
                              <Input
                                bg="rgba(255,255,255,0.03)"
                                borderColor="rgba(255,255,255,0.08)"
                                _hover={{ borderColor: "rgba(255,255,255,0.2)" }}
                                _focus={{ borderColor: "var(--accent-color)", boxShadow: "0 0 0 1px var(--accent-color)" }}
                                value={manualSecondVal}
                                onChange={(e) => setManualSecondVal(e.target.value)}
                                placeholder="0 - 100"
                                size="sm"
                                borderRadius="8px"
                              />
                            </Box>
                          )}
                          <Button size="sm" colorScheme="indigo" bg="rgba(129, 140, 248, 0.2)" border="1px solid rgba(129, 140, 248, 0.4)" _hover={{ bg: "rgba(129, 140, 248, 0.3)" }} color="white" type="submit" px="5">
                            Ekle
                          </Button>
                        </HStack>
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
                        <Text fontSize="10px" color="gray.500">X ve Y değerlerini içeren virgüle ayrılmış (CSV) şablonu</Text>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>

              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Presets and Actions */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px" mb="3">
                  ÖRNEK ŞABLONLAR
                </Text>
                
                <Flex gap="2" wrap="wrap">
                  <Button size="xs" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => loadPreset("clusters")}>
                    3 Ayrı Küme (2D)
                  </Button>
                  <Button size="xs" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => loadPreset("linear")}>
                    Doğrusal Eğilim (2D)
                  </Button>
                  <Button size="xs" variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.300" _hover={{ bg: "rgba(255,255,255,0.05)" }} onClick={() => loadPreset("oneDim")}>
                    Tek Boyutlu Çizgi (1D)
                  </Button>
                </Flex>
              </Box>
            </Flex>

            {/* Calculate and Clear */}
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
                  isDisabled={firstAttribute.length === 0}
                  onClick={() => navigate("/kmeans/iteration")}
                >
                  Kümelemeyi Başlat ({firstAttribute.length} Nokta)
                </Button>
              </HStack>
            </Flex>
          </Flex>

          {/* Interactive SVG Visualization Workspace (Right side) */}
          <Flex direction="column" flex="1.2" align="center" gap="4">
            <Flex width="100%" justify="space-between" align="center">
              <Badge colorScheme="indigo" px="2" py="1" borderRadius="md" variant="subtle" fontSize="10px" fontWeight="700">
                {firstAttribute.length} Toplam Nokta
              </Badge>
              {inputMode === "click" && (
                <Text fontSize="10px" color="gray.400" display="flex" alignItems="center" gap="1">
                  💡 Nokta eklemek için aşağıdaki alana tıklayın
                </Text>
              )}
            </Flex>

            {/* Custom Interactive SVG */}
            <Box
              position="relative"
              width="100%"
              paddingBottom="100%" /* Force 1:1 Aspect Ratio */
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
                    {twoAttr && (
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
                {!twoAttr && (
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

                {/* Plotted Data Points */}
                <AnimatePresence>
                  {firstAttribute.map((x, idx) => {
                    const y = twoAttr ? secondAttribute[idx] : 50; // Render at 50% height in 1D
                    
                    // Convert log coordinates [0, 100] to percentages for SVG rendering
                    const svgX = `${x}%`;
                    const svgY = twoAttr ? `${100 - y}%` : "50%";

                    return (
                      <motion.circle
                        key={idx}
                        cx={svgX}
                        cy={svgY}
                        r="7"
                        fill="#818cf8"
                        stroke="#090d16"
                        strokeWidth="1.5"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.4, fill: "#f472b6" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </AnimatePresence>
              </svg>
            </Box>

            {/* X and Y Axis Labels */}
            <Flex width="100%" justify="space-between" px="2" fontSize="xs" fontWeight="700" color="gray.500">
              <Text>0 ({firstAttrName})</Text>
              <Text>100</Text>
            </Flex>
          </Flex>
        </Flex>
      </motion.div>
    </Box>
  );
}

export default KMeans;
