import { Menu, MenuButton, MenuList, MenuItem, IconButton, Flex,  } from '@chakra-ui/react'
import React from 'react'
import { HamburgerIcon } from "@chakra-ui/icons"
import { Link } from 'react-router-dom'

function NavBar() {
  return (
    <Flex position={"absolute"} top={4} left={4} backgroundColor={"gray.800"}>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
        />
        <MenuList>
          <Link to={"/"}>
            <MenuItem fontWeight={"bold"}>Home</MenuItem>
          </Link>
          <Link to={"/knn"}>
            <MenuItem fontWeight={"bold"}>K-NN</MenuItem>
          </Link>
          <Link to={"/kmeans"}>
            <MenuItem fontWeight={"bold"}>K-Means</MenuItem>
          </Link>
        </MenuList>
      </Menu>
    </Flex>
  );
}

export default NavBar