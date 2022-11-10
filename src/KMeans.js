import { Center, Text, Flex, Heading, Input, Button, FormControl, InputGroup, Switch } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik'
import Papa from "papaparse";

function KMeans() {


  const [firstAttribute, setFirstAttribute] = useState([]);
  const [secondAttribute, setSecondAttribute] = useState([]);
  const [firstAttributeMax, setFirstAttributeMax] = useState();
  const [secondAttributeMax, setSecondAttributeMax] = useState();
  const useForm = useRef(); 



  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      firstAttribute: "",
      firstAttributeName: "",
      secondAttribute: "",
      secondAttributeName: "",
    },

    onSubmit: (values) => {
      console.log(values);
      if (secondToggle) {
        setFirstAttribute([...firstAttribute, values.firstAttribute]);
        setSecondAttribute([...secondAttribute, values.secondAttribute]);
        values.firstAttribute = "";
        values.secondAttribute = "";
      } else {
        setFirstAttribute([...firstAttribute, values.firstAttribute]);
        setSecondAttribute([...secondAttribute, 0]);
        values.firstAttribute = "";
        values.secondAttribute = "";
      }
    },
  });

  useEffect(()=>{
    setFirstAttributeMax(Math.max(...firstAttribute));
    setSecondAttributeMax(Math.max(...secondAttribute));
    localStorage.setItem("xvalues", firstAttribute);
    localStorage.setItem("yvalues", secondAttribute);
    localStorage.setItem("firstAttrMax", Math.max(...firstAttribute));
    localStorage.setItem("secondAttrMax", Math.max(...secondAttribute));
    localStorage.setItem("firstAttrMin", Math.min(...firstAttribute));
    localStorage.setItem("secondAttrMin", Math.min(...secondAttribute));
    localStorage.setItem("firstAttrName", values.firstAttributeName);
    localStorage.setItem("secondAttrName", values.secondAttributeName);
  }, [firstAttribute, secondAttribute, values.firstAttributeName, values.secondAttributeName])

  const [toggle, setToggle] = useState(false);
  const [secondToggle, setSecongToggle] = useState(localStorage.getItem("twoAttr") === "2" ? true : false);

  const handleSwitch = e => {
    e.preventDefault();
    setToggle(toggle === false ? true : false);
  }

  const handleSwitch2 = e => {
    e.preventDefault();
    setSecongToggle(secondToggle === false ? true : false);
    localStorage.setItem("twoAttr", localStorage.getItem("twoAttr") === "2" ? "1" : "2");
    setFirstAttribute([]);
    setSecondAttribute([]);
  }

  const handleFile = e => { 
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const valuesArray = [];
        const firstArray = [];
        const secondArray = [];

        results.data.forEach((d) => {
          valuesArray.push(Object.values(d));
        });

        if (!secondToggle) {
          valuesArray.forEach((item) => {
            firstArray.push(item[0]);
            secondArray.push(0);
          });
        } else {
          valuesArray.forEach((item) => {
            firstArray.push(item[0]);
            secondArray.push(item[1]);
          });
        }

        setFirstAttribute(firstArray);
        setSecondAttribute(secondArray);
      },
    });
   }

  return (
    <Center
      flexDirection={"column"}
      backgroundColor={"gray.800"}
      height={"100vh"}
      color={"white"}
    >
      <Heading>K-Means Calculator</Heading>

      <Flex flexDirection={"column"} align={"center"}>
        <Flex marginTop={"5"} align={"center"}>
          <Flex marginRight={4}>
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

          <Flex marginLeft={4}>
            <Text fontWeight={"bold"}>
              {secondToggle === false ? "One" : "Two"} Attribute
            </Text>
            <Switch
              isChecked={secondToggle}
              marginLeft={5}
              onChange={handleSwitch2}
              size={"lg"}
              fontWeight={"bold"}
            />
          </Flex>
        </Flex>

        {toggle && (
          <Flex align={"flex-end"} marginTop={5}>
            <InputGroup flexDirection={"column"}>
              <Text color={"white"} fontWeight={"bold"}>
                First Attribute Name
              </Text>
              <Input
                textAlign={"center"}
                fontWeight={"bold"}
                width={"60"}
                color={"white"}
                name="firstAttributeName"
                onChange={handleChange}
                value={values.firstAttributeName}
              />
            </InputGroup>

            {secondToggle && (
              <InputGroup flexDirection={"column"}>
                <Text color={"white"} fontWeight={"bold"}>
                  Second Attribute Name
                </Text>
                <Input
                  textAlign={"center"}
                  fontWeight={"bold"}
                  width={"60"}
                  color={"white"}
                  name="secondAttributeName"
                  onChange={handleChange}
                  value={values.secondAttributeName}
                />
              </InputGroup>
            )}

            <InputGroup flexDirection={"column"}>
              <Text fontWeight={"bold"}>
                CSV - (
                {secondToggle === true
                  ? "Attribute 1, Attribute 2 "
                  : "Attribute"}
                )
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
          <Flex align={"center"} marginTop={"5"}>
            <FormControl as={"form"} ref={useForm} onSubmit={handleSubmit}>
              <Flex align={"flex-end"}>
                <InputGroup flexDirection={"column"}>
                  <Text color={"white"} fontWeight={"bold"}>
                    First Attribute Name
                  </Text>
                  <Input
                    textAlign={"center"}
                    fontWeight={"bold"}
                    width={"60"}
                    color={"white"}
                    name="firstAttributeName"
                    onChange={handleChange}
                    value={values.firstAttributeName}
                  />
                </InputGroup>

                <InputGroup flexDirection={"column"}>
                  <Text color={"white"} fontWeight={"bold"}>
                    First Attribute Value
                  </Text>
                  <Input
                    textAlign={"center"}
                    fontWeight={"bold"}
                    width={"60"}
                    color={"white"}
                    name="firstAttribute"
                    onChange={handleChange}
                    value={values.firstAttribute}
                  />
                </InputGroup>

                {secondToggle && (
                  <InputGroup flexDirection={"column"}>
                    <Text color={"white"} fontWeight={"bold"}>
                      Second Attribute Name
                    </Text>
                    <Input
                      textAlign={"center"}
                      fontWeight={"bold"}
                      width={"60"}
                      color={"white"}
                      name="secondAttributeName"
                      onChange={handleChange}
                      value={values.secondAttributeName}
                    />
                  </InputGroup>
                )}

                {secondToggle && (
                  <InputGroup flexDirection={"column"}>
                    <Text color={"white"} fontWeight={"bold"}>
                      Second Attribute Value
                    </Text>
                    <Input
                      textAlign={"center"}
                      fontWeight={"bold"}
                      width={"60"}
                      color={"white"}
                      name="secondAttribute"
                      onChange={handleChange}
                      value={values.secondAttribute}
                    />
                  </InputGroup>
                )}

                <Button width={32} colorScheme={"green"} type="submit">
                  Add
                </Button>
              </Flex>
            </FormControl>
          </Flex>
        )}

        <Flex
          flexDirection={"column"}
          align={"center"}
          marginTop={4}
          color={"white"}
        >
          {!secondToggle && (
            <Plot
              data={[
                {
                  x: firstAttribute,
                  y: secondAttribute,
                  mode: "markers",
                  type: "scatter",
                  marker: { color: "red", size: "8" },
                },
              ]}
              layout={{
                yaxis: { range: [-0.1, 0.1] },
                xaxis: {
                  range: [0, firstAttributeMax + firstAttributeMax / 10],
                },
                title: values.firstAttributeName,
              }}
            />
          )}

          {secondToggle && (
            <Plot
              data={[
                {
                  x: firstAttribute,
                  y: secondAttribute,
                  mode: "markers",
                  type: "scatter",
                  marker: { color: "red", size: "8" },
                },
              ]}
              layout={{
                xaxis: {
                  range: [0, firstAttributeMax + firstAttributeMax / 10],
                  title: values.firstAttributeName,
                },
                yaxis: {
                  range: [0, secondAttributeMax + secondAttributeMax / 10],
                  title: values.secondAttributeName,
                },
              }}
            />
          )}

          <Link to={"/kmeans/iteration"}>
            <Button marginTop={"5"} width={"40"} colorScheme={"teal"}>
              Calculate
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Center>
  );
}

export default KMeans
