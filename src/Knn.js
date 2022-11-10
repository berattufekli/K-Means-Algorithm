import { Button, Center, Flex, FormControl, Heading, Input, InputGroup, Text, Select, Switch } from '@chakra-ui/react'
import { useFormik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import Plot from 'react-plotly.js';
import Papa from "papaparse";
import { Link } from 'react-router-dom';

export const ageValue = []

function Knn() {
  const [ageYes, setAgeYes] = useState([]);
  const [wageYes, setWageYes] = useState([]);
  const [ageNo, setAgeNo] = useState([]);
  const [wageNo, setWageNo] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [ageMin, setAgeMin] = useState();
  const [ageMax, setAgeMax] = useState();
  const [wageMin, setWageMin] = useState();
  const [wageMax, setWageMax] = useState();

  const ageData = []
  const wageData = []

  const useForm = useRef();

  const handleSwitch = e => {
    e.preventDefault();
    setToggle(toggle === false ? true : false);
  }

  useEffect(() => {
    
    localStorage.setItem("ageMin", ageMin);
    localStorage.setItem("ageMax", ageMax);
    localStorage.setItem("wageMin", wageMin);
    localStorage.setItem("wageMax", wageMax);
    localStorage.setItem("ageYes", ageYes);
    localStorage.setItem("wageYes", wageYes);
    localStorage.setItem("ageNo", ageNo);
    localStorage.setItem("wageNo", wageNo);
    
  }, [ageYes, ageNo, wageYes, wageNo, ageMin, ageMax, wageMax, wageMin]);

  const handleFile = e => {  
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const valuesArray = [];
        const ageYes = []
        const ageNo = []
        const wageYes = []
        const wageNo = []

        results.data.forEach((d) =>  {
          valuesArray.push(Object.values(d));
        });

        
        
        valuesArray.forEach(item => {
          ageData.push(item[0]);
          wageData.push(item[1]);
          setAgeMin(Math.min(...ageData));
          setAgeMax(Math.max(...ageData));
          setWageMin(Math.min(...wageData));
          setWageMax(Math.max(...wageData));
          if(item[2] === "Y"){
            ageYes.push(item[0])
            wageYes.push(item[1])
          }
          else{
            ageNo.push(item[0])
            wageNo.push(item[1])
          }
        });

        setAgeYes(ageYes);
        setWageYes(wageYes);
        setAgeNo(ageNo);
        setWageNo(wageNo);
      },
    });
  }

  

  const {handleSubmit, handleChange, values} = useFormik({
    initialValues: {
        age: "",
        wage: "",
        credit: "Y",
    },

    onSubmit: (values) => {
      console.log(values);
      if(values.credit === "Y"){
        setAgeYes([...ageYes, values.age]);
        setWageYes([...wageYes, values.wage]);
      }
      else{
        setAgeNo([...ageNo, values.age]);
        setWageNo([...wageNo, values.wage]);
      }
    } 
  })

  return (
    <Center
      flexDirection={"column"}
      color={"white"}
      height={"100vh"}
      backgroundColor={"gray.800"}
    >
      <Heading>K-NN Calculator</Heading>

      <Flex align={"center"} flexDirection={"column"}>
        <Flex marginTop={"5"} align={"center"}>
          <Text fontWeight={"bold"}>
            Add Data {toggle === false ? "Manually" : "from CSV"}
          </Text>
          <Switch
            marginLeft={5}
            onChange={handleSwitch}
            size={"lg"}
            fontWeight={"bold"}
          />
        </Flex>

        {toggle && (
          <Flex align={"flex-end"} marginTop={5}>
            <InputGroup marginX={2} flexDirection={"column"}>
              <Text fontWeight={"bold"}>
                CSV - (Input Format : Age, Wage, Result)
              </Text>
              <Input
                onChange={handleFile}
                fontWeight={"bold"}
                type={"file"}
                accept={".csv"}
              />
            </InputGroup>
          </Flex>
        )}

        {!toggle && (
          <FormControl
            marginTop={"5"}
            as={"form"}
            ref={useForm}
            onSubmit={handleSubmit}
          >
            <Flex>
              <InputGroup marginX={2} flexDirection={"column"}>
                <Text fontWeight={"bold"}>Age</Text>
                <Input
                  textAlign={"center"}
                  fontWeight={"bold"}
                  value={values.age}
                  name={"age"}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup marginX={2} flexDirection={"column"}>
                <Text fontWeight={"bold"}>Wage</Text>
                <Input
                  textAlign={"center"}
                  fontWeight={"bold"}
                  value={values.wage}
                  name={"wage"}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup marginX={2} flexDirection={"column"}>
                <Text fontWeight={"bold"}>Credit Result</Text>
                <Select
                  textAlign={"center"}
                  fontWeight={"bold"}
                  onChange={handleChange}
                  name={"credit"}
                  color={"black"}
                  variant="filled"
                  value={values.credit}
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </Select>
              </InputGroup>

              <Button
                alignSelf={"self-end"}
                width={32}
                marginX={2}
                type="submit"
                colorScheme={"green"}
              >
                Add
              </Button>
            </Flex>
          </FormControl>
        )}
      </Flex>

      <Flex marginTop={10}>
        <Plot
          data={[
            {
              x: ageYes,
              y: wageYes,
              mode: "markers",
              type: "scatter",
              marker: { color: "green", size: "10" },
              name: "Yes",
            },
            {
              x: ageNo,
              y: wageNo,
              mode: "markers",
              type: "scatter",
              marker: { color: "red", size: "10" },
              name: "No",
            },
          ]}
          layout={{
            xaxis: { range: [0, 80], title: "Age" },
            yaxis: { range: [0, 300000], title: "Wage" },
          }}
        />
      </Flex>

      <Link to={"/knn/result"}>
        <Button marginTop={5}  width={"40"} colorScheme={"teal"}>
          Calculate
        </Button>
      </Link>
    </Center>
  );
}

export default Knn