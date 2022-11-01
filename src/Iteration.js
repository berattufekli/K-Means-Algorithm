import { Button, Center, Flex, Heading } from '@chakra-ui/react'
import React, { useState } from 'react'
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


function Iteration() {

  const handleClick = event => {
    event.preventDefault();
    setIteration((item) => item+1)
    setSecondCentroid(averageC2);
    setFirstCentroid(averageC1);

    xval.forEach((item) => {
      const distancec1 = Math.abs(parseFloat(item) - FirstCentroid)
      const distancec2 = Math.abs(parseFloat(item) - SecondCentroid)
      if(distancec1 < distancec2){
        nearestCluster.current = "c1"
      }
      else if(distancec2 < distancec1){
        nearestCluster.current = "c2"
      }
      else{
        nearestCluster.current = "equal"
      }
      values.push({age: parseInt(item) ,c1: distancec1, c2: distancec2, nearest: nearestCluster})
    });
  };

  const [itearation, setIteration] = useState(1);
  const values = []
  const xval = JSON.stringify(localStorage.getItem("xvalues")).replace(/[&\\#+()$~%.'":*?<>{}]/g,'').split(",")
  
  /*
  const min = Math.min(...xval.map(item => item));
  const max = Math.max(...xval.map(item => item));
  
  const random1 = Math.round(Math.random() * (max - min) + min)
  const random2 = Math.round(Math.random() * (max - min) + min)
  */
  const [FirstCentroid, setFirstCentroid] = useState(16);

  const [SecondCentroid, setSecondCentroid] = useState(22);

  const dataGencX = []
  const dataGencY = []

  const dataYasliX = []
  const dataYasliY = []
 
  let sumC1 = 0;
  let countC1 = 0;

  let sumC2 = 0;
  let countC2 = 0;

  let nearestCluster = "";
  
  xval.forEach((item) => {
    
    const distancec1 = Math.abs(parseFloat(item) - FirstCentroid)
    const distancec2 = Math.abs(parseFloat(item) - SecondCentroid)
    if(distancec1 < distancec2){
      nearestCluster = "c1"
    }
    else if(distancec2 < distancec1){
      nearestCluster = "c2"
    }
    else{
      nearestCluster = "equal"
    }
    values.push({age: parseInt(item) ,c1: distancec1, c2: distancec2, nearest: nearestCluster})
  });

  
  values.forEach((item) => {
    if(item.nearest === "c1"){
      countC1 += 1
    }
    else {
      countC2 += 1
    }
  })

  values.forEach((item) => {
    if(item.nearest === "c1"){
      sumC1 += item.age
      dataGencX.push(item.age)
      dataGencY.push(0)
    }
    else if(item.nearest === "c2"){
      sumC2 += item.age
      dataYasliX.push(item.age)
      dataYasliY.push(0)
    }
    else{
      if(countC1 > countC2){
        sumC1 += item.age
        dataGencX.push(item.age)
        dataGencY.push(0)
      }
      else{
        sumC2 += item.age
        dataYasliX.push(item.age)
        dataYasliY.push(0)
      }
    }
  });

  console.log("sumC1 " + sumC1 + "ve count" + countC1)

  const averageC1 = sumC1 / countC1;
  const averageC2 = sumC2 / countC2;
  
  
  return (
    <Center flexDirection={"column"} backgroundColor={"gray.800"} color={"white"}> 
      <Heading marginTop={"40"} marginBottom={"10"} size={"md"}>Iteration - {itearation}</Heading>
      <Plot
            data={[
              {
                x: dataGencX,
                y: dataGencY,
                name: "Young",
                mode: 'markers',
                type: "scatter",
                marker: {color: "red", size: "8"}
              },
              {
                x: dataYasliX,
                y: dataYasliY,
                name: "Old",
                mode: 'markers',
                type: "scatter",
                marker: {color: "blue", size: "8"}
              }
            ]}
            layout={ {yaxis: {range: [-1, 5]}, title:'Ages'} }
            />


      <Flex align={"center"} flexDirection={"column"}>
        <Heading size={"md"} marginTop={"40"} marginBottom={"10"}>Values</Heading>
        
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Age</Th>
                <Th>C1</Th>
                <Th>C2</Th>
                <Th>Distance to C1</Th>
                <Th>Distance to C2</Th>
                <Th>Nearest Cluster</Th>
                <Th>New Centroid</Th>
              </Tr>
            </Thead>

            <Tbody>
              {
                values.map((item, key) => <Tr key={key}>
                  <Td>{item.age}</Td>
                  <Td>{FirstCentroid}</Td>
                  <Td>{SecondCentroid}</Td>
                  <Td>{item.c1}</Td>
                  <Td>{item.c2}</Td>
                  <Td>{item.nearest}</Td>
                  <Td>{item.nearest === "c1" ? averageC1 : averageC2}</Td>
                </Tr>)
              }
            </Tbody>
            
          </Table>
        </TableContainer>
        <Button colorScheme={"teal"} marginY={"10"} onClick={handleClick}>Next Iteration</Button>
      </Flex>
      
    </Center>
  )
}

export default Iteration