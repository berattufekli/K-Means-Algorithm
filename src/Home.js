import { Button, Text, Center, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <Center
      color={"white"}
      flexDirection={"column"}
      paddingTop={40}
      backgroundColor={"gray.800"}
    >
      <Heading>K-NN & K-Means Calculator</Heading>

      <Flex>
        <Flex
          justify={"space-around"}
          align={"center"}
          flexDirection={"column"}
          margin={"10"}
          width={"xs"}
          height={"sm"}
          borderRadius={"8px"}
          backgroundColor={"gray.700"}
          boxShadow={"lg"}
        >
          <Heading size={"md"}>What is K-NN?</Heading>
          <Text fontSize={"20"} textAlign={"justify"} marginX={"4"}>
            KNN is a{" "}
            <b>
              <u>supervised</u>
            </b>{" "}
            machine learning algorithm that is used for{" "}
            <b>
              <u>classification</u>
            </b>{" "}
            problems. Since it is a supervised machine learning algorithm, it
            uses labeled data to make predictions.
          </Text>
          <Link to={"/knn"}>
            <Button
              boxShadow={"xl"}
              colorScheme={"green"}
              fontWeight={"bold"}
              width={"40"}
            >
              Try Now
            </Button>
          </Link>
        </Flex>

        <Flex
          justify={"space-around"}
          align={"center"}
          flexDirection={"column"}
          margin={"10"}
          width={"xs"}
          height={"sm"}
          borderRadius={"8px"}
          backgroundColor={"gray.700"}
          boxShadow={"lg"}
        >
          <Heading size={"md"}>What is K-Means?</Heading>
          <Text fontSize={"20"} textAlign={"justify"} marginX={"4"}>
            K-Means is an{" "}
            <b>
              <u>unsupervised</u>
            </b>{" "}
            machine learning algorithm that is used for{" "}
            <b>
              <u>clustering</u>
            </b>{" "}
            problems. Since it is an unsupervised machine learning algorithm, it
            uses unlabelled data to make predictions.
          </Text>
          <Link to={"/kmeans"}>
            <Button
              boxShadow={"xl"}
              colorScheme={"green"}
              fontWeight={"bold"}
              width={"40"}
            >
              Try Now
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Center>
  );
}

export default Home