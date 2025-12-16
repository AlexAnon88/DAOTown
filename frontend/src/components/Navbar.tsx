// @ts-nocheck comment
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { ethers } from "ethers";
import { Link } from "@chakra-ui/next-js";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import NetworkSwitcher from "./NetworkSwitcher";

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const account = useAccount();
  const { data: session, status } = useSession();

  return (
    <>
      <Box
        bg={useColorModeValue("white", "gray.800")}
        px={10}
        borderBottom="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        boxShadow="sm"
      >
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
          maxW="1400px"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="28px"
            fontWeight="bold"
            color={useColorModeValue("blue.600", "blue.300")}
          >
            <Link href="/" _hover={{ textDecoration: "none" }}>
              DAOTown
            </Link>
          </HStack>
          <Flex alignItems={"center"} gap={2}>
            <HStack
              as={"nav"}
              spacing={1}
              display={{ base: "none", md: "flex" }}
            >
              <Link href="/explore" _hover={{ textDecoration: "none" }}>
                <Button variant="ghost" size="md">
                  Explore DAOs
                </Button>
              </Link>
              {account.isConnected && session?.user && (
                <>
                  <Link href="/register" _hover={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="md">
                      Register
                    </Button>
                  </Link>
                  <Link href="/create-dao" _hover={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="md">
                      Create DAO
                    </Button>
                  </Link>
                  <Link href="/profile" _hover={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="md">
                      Profile
                    </Button>
                  </Link>
                </>
              )}
            </HStack>

            <ConnectButton
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <Link href="/explore" _hover={{ textDecoration: "none" }}>
                <Button w="full" variant="ghost">
                  Explore DAOs
                </Button>
              </Link>
              {account.isConnected && session?.user && (
                <>
                  <Link href="/register" _hover={{ textDecoration: "none" }}>
                    <Button w="full" variant="ghost">
                      Register
                    </Button>
                  </Link>
                  <Link href="/create-dao" _hover={{ textDecoration: "none" }}>
                    <Button w="full" variant="ghost">
                      Create DAO
                    </Button>
                  </Link>
                  <Link href="/profile" _hover={{ textDecoration: "none" }}>
                    <Button w="full" variant="ghost">
                      Profile
                    </Button>
                  </Link>
                </>
              )}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
