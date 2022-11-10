import { Center, Flex, FormControl, Heading, InputGroup, Text, Input, Button, Select, TableContainer, Td, Tr, Th,Tbody, Thead,Table } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import Plot from 'react-plotly.js';
import { useFormik } from 'formik'

function Result() {

  const useForm = useRef();

  const [age, setAge] = useState();
  const [wage, setWage] = useState();
  const [data, setData] = useState([]);

  const ageYes = JSON.stringify(localStorage.getItem("ageYes"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
    .split(",");
    
  const ageNo = JSON.stringify(localStorage.getItem("ageNo"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
    .split(",");

  const wageYes = JSON.stringify(localStorage.getItem("wageYes"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
    .split(",");

  const wageNo = JSON.stringify(localStorage.getItem("wageNo"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")
    .split(",");

  const ageMin = JSON.stringify(localStorage.getItem("ageMin"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")

  const ageMax = JSON.stringify(localStorage.getItem("ageMax"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "")

  const wageMin = JSON.stringify(localStorage.getItem("wageMin"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");

  const wageMax = JSON.stringify(localStorage.getItem("wageMax"))
    .replace(/[&\\#+()$~%.'":*?<>{}]/g, "");

  const [creditResult, setCreditResult] = useState();

  const normAgeYes = []
  const normWageYes = []
  const distance = []
  const normAgeNo = []
  const normWageNo = []
  
  //Normalization
  ageYes.forEach((item) => {
    const result = (item - ageMin) / (ageMax - ageMin);
    normAgeYes.push(result.toFixed(4));
  })

  wageYes.forEach((item) => {
    const result = (item - wageMin) / (wageMax - wageMin);
    normWageYes.push(result.toFixed(4));
  })

  ageNo.forEach((item) => {
    const result = (item - ageMin) / (ageMax - ageMin);
    normAgeNo.push(result.toFixed(4));
  })

  wageNo.forEach((item) => {
    const result = (item - wageMin) / (wageMax - wageMin);
    normWageNo.push(result.toFixed(4));
  })

  const {handleSubmit, handleChange, values} = useFormik({
    initialValues: {
        age: "",
        wage: "",
        n: "5",
        distance: "euclidean",
    },

    onSubmit: (values) => {
      
      const normAge = (values.age - ageMin) / (ageMax - ageMin);
      const normWage = (values.wage - wageMin) / (wageMax - wageMin);

      setAge(normAge.toFixed(4));
      setWage(normWage.toFixed(4));
      
      for (var i = 0; i < normAgeYes.length; i++) {
        if (values.distance === "euclidean") {
          const result = Math.sqrt((
            Math.pow(normAge - normAgeYes[i], 2) + Math.pow((normWage - normWageYes[i]), 2))
          );
          distance.push({distance: result.toFixed(4), age: normAgeYes[i], wage: normWageYes[i], credit: "Y"});  
        }
        else{
          const result = Math.abs(((normAge - normAgeYes[i]) + (normWage - normWageYes[i])));
          distance.push({distance: result.toFixed(4), age: normAgeYes[i], wage: normWageYes[i], credit: "Y"});
        }
      }

      for (var j = 0; j < normAgeNo.length; j++) {
        if (values.distance === "euclidean") {
          const result = Math.sqrt((
            Math.pow(normAge - normAgeNo[j], 2) + Math.pow((normWage - normWageNo[j]), 2))
          );
          distance.push({distance: result.toFixed(4), age: normAgeNo[j], wage: normWageNo[j], credit: "N"});  
        }
        else{
          const result = Math.abs(((normAge - normAgeNo[j]) + (normWage - normWageNo[j])));
          distance.push({distance: result.toFixed(4), age: normAgeNo[j], wage: normWageNo[j], credit: "N"});
        }
      }
      console.log(distance);
      distance.sort((a,b) => a.distance - b.distance)
      setData(distance);
      var yesCount = 0;
      var noCount = 0;
      for(var l = 0; l < values.n; l ++){
        if(distance[l].credit === "Y"){
          yesCount += 1;
        }
        else{
          noCount +=1;
        }
      }

      console.log("Yes", yesCount, "No", noCount);
      setCreditResult(yesCount > noCount ? "Y" : "N");
      
    } 
  })



  return (
    <Center
      flexDirection={"column"}
      color={"white"}
      paddingTop={"20"}
      backgroundColor={"gray.800"}
    >
      <Heading>K-NN Calculator</Heading>

      <FormControl
        marginTop={5}
        width={"container.md"}
        as={"form"}
        ref={useForm}
        onSubmit={handleSubmit}
      >
        <Flex align={"flex-end"}>
          <InputGroup marginX={2} flexDirection={"column"}>
            <Text fontWeight={"bold"}>Age</Text>
            <Input
              fontWeight={"bold"}
              textAlign={"center"}
              onChange={handleChange}
              value={values.age}
              name={"age"}
            />
          </InputGroup>
          <InputGroup marginX={2} flexDirection={"column"}>
            <Text fontWeight={"bold"}>Wage</Text>
            <Input
              fontWeight={"bold"}
              textAlign={"center"}
              onChange={handleChange}
              value={values.wage}
              name={"wage"}
            />
          </InputGroup>

          <InputGroup marginX={2} flexDirection={"column"}>
            <Text fontWeight={"bold"}>N</Text>
            <Input
            fontWeight={"bold"}
            textAlign={"center"}
                onChange={handleChange}
                value={values.n}
                name={"n"}
              />
          </InputGroup>

          <InputGroup marginX={2} flexDirection={"column"}>
            <Text fontWeight={"bold"}>Distance Functions</Text>
            <Select
              textAlign={"center"}
              fontWeight={"bold"}
              onChange={handleChange}
              name={"distance"}
              color={"black"}
              variant="filled"
              value={values.distance}
            >
              <option value="euclidean">Euclidean</option>
              <option value="manhattan">Manhattan</option>
            </Select>
          </InputGroup>

          <Button type="submit" width={"sm"} marginX={2} colorScheme={"green"}>
            Calculate
          </Button>
        </Flex>
      </FormControl>

      <Flex marginTop={10}>
        <Plot
          data={[
            {
              x: normAgeYes,
              y: normWageYes,
              mode: "markers",
              type: "scatter",
              marker: { color: "green", size: "10" },
              name: "Yes",
            },
            {
              x: normAgeNo,
              y: normWageNo,
              mode: "markers",
              type: "scatter",
              marker: { color: "red", size: "10" },
              name: "No",
            },
            {
              x: [age],
              y: [wage],
              mode: "markers",
              type: "scatter",
              marker: { color: "orange", size: "10" },
              name: "Input",
            },
          ]}
          layout={{
            xaxis: { range: [-0.1, 1.1], title: "Age" },
            yaxis: { range: [-0.1, 1.1], title: "Wage" },
            title: "Normalized Data",
          }}
        />
      </Flex>

      {data.length >= 0 && (
        <Flex align={"center"} flexDirection={"column"} paddingTop={5} marginY={"32"}>
          <Heading size={"md"} fontWeight={"bold"} marginY={5}>
            Credit result according to first {values.n} neighbors: {creditResult}
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Input Age</Th>
                  <Th>Input Wage</Th>
                  <Th>Age</Th>
                  <Th>Wage</Th>
                  <Th>Credit Result</Th>
                  <Th>Distance</Th>
                </Tr>
              </Thead>

              <Tbody>
                {data.map((item, key) => (
                  <Tr key={key}>
                    <Td>{age}</Td>
                    <Td>{wage}</Td>
                    <Td>{item.age}</Td>
                    <Td>{item.wage}</Td>
                    <Td>{item.credit}</Td>
                    <Td fontWeight={"bold"}>{item.distance}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      )}
    </Center>
  );
}

export default Result