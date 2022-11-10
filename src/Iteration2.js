import { Button, Center, Flex, FormControl, Heading, Text, Input, InputGroup} from '@chakra-ui/react'
import React, { useState, useRef } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import Plot from 'react-plotly.js';
import { useFormik } from 'formik'


function Iteration2() {
  const useForm = useRef(); 

  const firstAttrMin = JSON.stringify(localStorage.getItem("firstAttrMin"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");
  const secondAttrMin = JSON.stringify(localStorage.getItem("secondAttrMin"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");
  const firstAttrMax = JSON.stringify(localStorage.getItem("firstAttrMax"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");
  const secondAttrMax = JSON.stringify(localStorage.getItem("secondAttrMax"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");



  const twoAttr = JSON.stringify(localStorage.getItem("twoAttr"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")

  const [centroid1, setCentroid1] = useState({
    x: twoAttr === "1" ? Math.round(Math.random() * (firstAttrMax - firstAttrMin) + firstAttrMin) : Math.random().toFixed(4),
    y: twoAttr === "1" ? Math.round(Math.random() * (secondAttrMax - secondAttrMin) + secondAttrMin) : Math.random().toFixed(4),
  });
  const [centroid2, setCentroid2] = useState({
    x: twoAttr === "1" ? Math.round(Math.random() * (firstAttrMax - firstAttrMin) + firstAttrMin) : Math.random().toFixed(4),
    y: twoAttr === "1" ? Math.round(Math.random() * (secondAttrMax - secondAttrMin) + secondAttrMin) : Math.random().toFixed(4),
  });
  
  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      Centroid1 : centroid1,
      Centroid2 : centroid2,
    },

    onSubmit: (value) => {
      setCentroid1({x: value.Centroid1.x , y: value.Centroid1.y});
      setCentroid2({ x: value.Centroid2.x, y: value.Centroid2.y });
    },
  });



  const handleClick = (event) => {
    event.preventDefault();
    setIteration((item) => item + 1);
    setCentroid1({x: parseFloat(averageC1x), y: parseFloat(averageC1y)});
    setCentroid2({x: parseFloat(averageC2x), y: parseFloat(averageC2y)});

    if(twoAttr === "1"){
      xval.forEach((item) => {
        const distancec1 = Math.abs(parseFloat(item) - centroid1.x);
        const distancec2 = Math.abs(parseFloat(item) - centroid2.x);
        if (distancec1 < distancec2) {
          nearestCluster = "c1";
        } else if (distancec2 < distancec1) {
          nearestCluster = "c2";
        } else {
          nearestCluster = "equal";
        }
        values1.push({
          age: parseInt(item),
          c1: distancec1.toFixed(4),
          c2: distancec2.toFixed(4),
          nearest: nearestCluster,
        });
      });
    }
    else{
      normalizedData.forEach((item) => {
        const distanceC1 = Math.sqrt(Math.pow(item.x - centroid1.x, 2) + Math.pow((item.y - centroid1.y), 2))
        const distanceC2 = Math.sqrt(Math.pow(item.x - centroid2.x, 2) + Math.pow((item.y - centroid2.y), 2))
        if (distanceC1 < distanceC2) {
          nearestCluster = "c1";
        } else if (distanceC2 < distanceC1) {
          nearestCluster = "c2";
        } else {
          nearestCluster = "equal";
        }
        values1.push({
          x: item.x,
          y: item.y,
          c1: distanceC1.toFixed(4),
          c2: distanceC2.toFixed(4),
          nearest: nearestCluster,
        });
      })
    }
  };

  const [itearation, setIteration] = useState(1);
  const values1 = [];
  const xval = JSON.stringify(localStorage.getItem("xvalues"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
    .split(",");

  const yval = JSON.stringify(localStorage.getItem("yvalues"))
  .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
  .split(",");



  

  const data1X = [];
  const data1Y = [];

  const data2X = [];
  const data2Y = [];

  let sumC1x = 0;
  let sumC1y = 0;
  let countC1 = 0;

  let sumC2x = 0;
  let sumC2y = 0;
  let countC2 = 0;

  let nearestCluster = "";

  twoAttr === "1" && xval.forEach((item) => {
    const distancec1 = Math.abs(parseFloat(item) - centroid1.x);
    const distancec2 = Math.abs(parseFloat(item) - centroid2.x);
    if (distancec1 < distancec2) {
      nearestCluster = "c1";
    } else if (distancec2 < distancec1) {
      nearestCluster = "c2";
    } else {
      nearestCluster = "equal";
    }
    values1.push({
      value: parseFloat(item),
      c1: distancec1.toFixed(4),
      c2: distancec2.toFixed(4),
      nearest: nearestCluster,
    });
  });

  const normalizedX = []
  const normalizedY = []
  const normalizedData = []

  twoAttr === "2" && xval.forEach((item, key) => {
    console.log(key)
    const normX = (item - firstAttrMin) / (firstAttrMax - firstAttrMin);
    const normY = (yval[key] - secondAttrMin) / (secondAttrMax - secondAttrMin);
    normalizedX.push(normX.toFixed(4))
    normalizedY.push(normY.toFixed(4))  
    normalizedData.push({x: normX.toFixed(4), y: normY.toFixed(4)})
  })

  twoAttr === "2" && normalizedData.forEach((item) => {
    const distanceC1 = Math.sqrt(Math.pow(item.x - centroid1.x, 2) + Math.pow((item.y - centroid1.y), 2))
    const distanceC2 = Math.sqrt(Math.pow(item.x - centroid2.x, 2) + Math.pow((item.y - centroid2.y), 2))
    if (distanceC1 < distanceC2) {
      nearestCluster = "c1";
    } else if (distanceC2 < distanceC1) {
      nearestCluster = "c2";
    } else {
      nearestCluster = "equal";
    }
    values1.push({
      x: item.x,
      y: item.y,
      c1: distanceC1.toFixed(4),
      c2: distanceC2.toFixed(4),
      nearest: nearestCluster,
    });
  })


  


  values1.forEach((item) => {
    if (item.nearest === "c1") {
      countC1 += 1;
    } else {
      countC2 += 1;
    }
  });

  twoAttr === "1" && values1.forEach((item) => {
    if (item.nearest === "c1") {
      sumC1x += item.value;
      data1X.push(item.value);
      data1Y.push(0);
    } else if (item.nearest === "c2") {
      sumC2x += item.value;
      data2X.push(item.value);
      data2Y.push(0);
    } else {
      if (countC1 > countC2) {
        sumC1x += item.value;
        data1X.push(item.value);
        data1Y.push(0);
      } else {
        sumC2x += item.value;
        data2X.push(item.value);
        data2Y.push(0);
      }
    }
  });

  twoAttr === "2" && values1.forEach((item) => {
    if (item.nearest === "c1") {
      sumC1x += parseFloat(item.x);
      sumC1y += parseFloat(item.y);
      data1X.push(item.x);
      data1Y.push(item.y);
    } else if (item.nearest === "c2") {
      sumC2x += parseFloat(item.x);
      sumC2y += parseFloat(item.y);
      data2X.push(item.x);
      data2Y.push(item.y);
    } else {
      if (countC1 > countC2) {
        sumC1x += parseFloat(item.x);
        sumC1y += parseFloat(item.y);
        data1X.push(item.x);
        data1Y.push(item.y);
      } else {
        sumC2x += parseFloat(item.x);
        sumC2y += parseFloat(item.y);
        data2X.push(item.x);
        data2Y.push(item.y);
      }
    }
  });




  const averageC1x = (sumC1x / countC1).toFixed(4);
  const averageC1y = (sumC1y / countC1).toFixed(4);
  const averageC2x = (sumC2x / countC2).toFixed(4);
  const averageC2y = (sumC2y / countC2).toFixed(4);

  console.log(sumC1x, countC1);

  return (
    <Center
      flexDirection={"column"}
      backgroundColor={"gray.800"}
      color={"white"}
    >
      <Heading marginTop={"28"} marginBottom={"10"} size={"md"}>
        Iteration - {itearation}
      </Heading>

      <Flex>
        <FormControl as={"form"} onSubmit={handleSubmit} ref={useForm}>
          {twoAttr === "1" && (
            <Flex align={"flex-end"}>
              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  1. Centroid X
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid1.x"}
                  value={values.Centroid1.x}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  2. Centroid X
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid2.x"}
                  value={values.Centroid2.x}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup>
                <Button
                  marginBottom={5}
                  width={40}
                  type="submit"
                  colorScheme={"teal"}
                >
                  Set Centroids
                </Button>
              </InputGroup>
            </Flex>
          )}

          {twoAttr === "2" && (
            <Flex align={"flex-end"}>
              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  1. Centroid X
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid1.x"}
                  value={values.Centroid1.x}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  1. Centroid Y
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid1.y"}
                  value={values.Centroid1.y}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  2. Centroid X
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid2.x"}
                  value={values.Centroid2.x}
                  onChange={handleChange}
                />
              </InputGroup>
              <InputGroup marginX={2} marginBottom={5} flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  2. Centroid Y
                </Text>
                <Input
                  autoComplete="false"
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"40"}
                  color={"white"}
                  name={"Centroid2.y"}
                  value={values.Centroid2.y}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup>
                <Button
                  marginBottom={5}
                  width={40}
                  type="submit"
                  colorScheme={"teal"}
                >
                  Set Centroids
                </Button>
              </InputGroup>
            </Flex>
          )}
        </FormControl>
      </Flex>
      {twoAttr === "1" && (
        <Plot
          data={[
            {
              x: data1X,
              y: data1Y,
              name: "Young",
              mode: "markers",
              type: "scatter",
              marker: { color: "red", size: "8" },
            },
            {
              x: [centroid1.x],
              y: [centroid1.y],
              name: "First Centroid",
              mode: "markers",
              type: "scatter",
              marker: { color: "orange", size: "14" },
            },
            {
              x: data2X,
              y: data2Y,
              name: "Old",
              mode: "markers",
              type: "scatter",
              marker: { color: "blue", size: "8" },
            },
            {
              x: [centroid2.x],
              y: [centroid2.y],
              name: "Second Centroid",
              mode: "markers",
              type: "scatter",
              marker: { color: "purple", size: "14" },
            },
          ]}
          layout={{
            yaxis: {
              range: [-1, 1],
              title: localStorage.getItem("secondAttrName"),
            },
            xaxis: { title: localStorage.getItem("firstAttrName") },
          }}
        />
      )}

      {twoAttr === "2" && (
        <Plot
          data={[
            {
              x: data1X,
              y: data1Y,
              name: "First Cluster",
              mode: "markers",
              type: "scatter",
              marker: { color: "red", size: "8" },
            },
            {
              x: [centroid1.x],
              y: [centroid1.y],
              name: "First Centroid",
              mode: "markers",
              type: "scatter",
              marker: { color: "orange", size: "14" },
            },
            {
              x: data2X,
              y: data2Y,
              name: "Second Cluster",
              mode: "markers",
              type: "scatter",
              marker: { color: "blue", size: "8" },
            },
            {
              x: [centroid2.x],
              y: [centroid2.y],
              name: "Second Centroid",
              mode: "markers",
              type: "scatter",
              marker: { color: "purple", size: "14" },
            },
          ]}
          layout={{
            yaxis: {
              range: [-0.1, 1.1],
              title: localStorage.getItem("secondAttrName"),
            },
            xaxis: {
              range: [-0.1, 1.1],
              title: localStorage.getItem("firstAttrName"),
            },
          }}
        />
      )}

      <Flex align={"center"} flexDirection={"column"}>
        <Heading size={"md"} marginTop={"40"} marginBottom={"10"}>
          Values
        </Heading>

        <TableContainer>
          {twoAttr === "1" && (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Value</Th>
                  <Th>C1</Th>
                  <Th>C2</Th>
                  <Th>Distance to C1</Th>
                  <Th>Distance to C2</Th>
                  <Th>Nearest Cluster</Th>
                  <Th>New Centroid</Th>
                </Tr>
              </Thead>

              <Tbody>
                {values1.map((item, key) => (
                  <Tr key={key}>
                    <Td>{item.value}</Td>
                    <Td>{centroid1.x}</Td>
                    <Td>{centroid2.x}</Td>
                    <Td>{item.c1}</Td>
                    <Td>{item.c2}</Td>
                    <Td>{item.nearest}</Td>
                    <Td>{item.nearest === "c1" ? averageC1x : averageC2x}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {twoAttr === "2" && (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Value</Th>
                  <Th>C1</Th>
                  <Th>C2</Th>
                  <Th>Distance to C1</Th>
                  <Th>Distance to C2</Th>
                  <Th>Nearest Cluster</Th>
                  <Th>New Centroid</Th>
                </Tr>
              </Thead>

              <Tbody>
                {values1.map((item, key) => (
                  <Tr key={key}>
                    <Td>
                      [{item.x},{item.y}]
                    </Td>
                    <Td>
                      [{centroid1.x}, {centroid1.y}]
                    </Td>
                    <Td>
                      [{centroid2.x}, {centroid2.y}]
                    </Td>
                    <Td>{item.c1}</Td>
                    <Td>{item.c2}</Td>
                    <Td>{item.nearest}</Td>
                    <Td>
                      {item.nearest === "c1"
                        ? "[" + averageC1x + " , " + averageC1y + "]"
                        : "[" + averageC2x + " , " + averageC2y + "]"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </TableContainer>
        <Button colorScheme={"teal"} marginY={"10"} onClick={handleClick}>
          Next Iteration
        </Button>
      </Flex>
    </Center>
  );
}

export default Iteration2