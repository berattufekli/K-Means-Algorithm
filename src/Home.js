import { Center, Text, Flex, Heading, Input, Button } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';


function Home() {
  const [value, setValue] = useState();

  const [xvalues, setxValues] = useState([]);
  const [yvalues, setyValues] = useState([]);

  const handleChange = event => {
    event.preventDefault();
    setValue(event.target.value);
  };

  const handleClick = event => {
    event.preventDefault();

    setxValues([...xvalues, value]);
    setyValues([...yvalues, 0]);
    setValue("");
  };

  useEffect(()=>{
    localStorage.setItem("xvalues", xvalues);
    localStorage.setItem("yvalues", yvalues);
  }, [xvalues, yvalues])

  return (
    <Center flexDirection={"column"} backgroundColor={"gray.800"} height={"100vh"}>
      <Heading color={"white"} size={"md"}>K-Means Algorithm</Heading>
      
      <Flex flexDirection={"column"} align={"center"} paddingTop={"8"}>
        
        
        <Flex align={"center"} marginTop={"4"}>
          <Text color={"white"} fontWeight={"bold"}>Add Age</Text>
          <Input textAlign={"center"} marginX={4} fontWeight={"bold"} width={"60"} color={"white"} id='value' name="value" onChange={handleChange} value={value}/> 
          <Button width={"32"}  colorScheme={"green"} onClick={handleClick}>Add</Button>
        </Flex>
        
        <Flex align={"center"} flexDirection={"column"} marginTop={8} color={"white"}>
            <Plot
            data={[
              {
                x: xvalues,
                y: yvalues,
                mode: 'markers',
                type: "scatter",
                marker: {color: "red", size: "8"}
              }
            ]}
            layout={ {yaxis: {range: [-1, 5]}, title:'Ages'} }
            />
            
            <Link to={"/iteration"}>
              <Button marginTop={"4"} width={"40"} colorScheme={"teal"}>Calculate</Button>
            </Link>
        
        </Flex>
      </Flex>
    </Center>
  )
}

export default Home