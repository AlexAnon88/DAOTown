// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

export default function Home() {
  const router = useRouter();
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);
  const breakpointHeight = useBreakpointValue({ base: "20%", md: "30%" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const registerRedirect = () => {
    if (account.isConnected) router.push("/register");
    else openConnectModal();
  };

  const createDAO = () => {
    if (account.isConnected) router.push("/create-dao");
    else openConnectModal();
  };

  return (
    <Flex
      flex={1}
      direction="column"
      align="center"
      justify="center"
      px={{ base: 4, md: 8 }}
      py={12} // spacing top & bottom
    >
      <Flex
        flex={1}
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="center"
        maxW="1400px"
        w="full"
        gap={6}
      >
        {/* Left Text Section */}
        <Stack
          spacing={6}
          flex={{ base: 1, md: 1.2 }}
          maxW={{ base: "100%", md: "50%" }}
          align="flex-start"
          textAlign="left"
        >
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            whiteSpace={{ base: "normal", md: "nowrap" }}
          >
            <Text
              as="span"
              position="relative"
              _after={{
                content: "''",
                width: "full",
                height: breakpointHeight || "25%",
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: "blue.600",
                zIndex: -1,
              }}
            >
              Unlocking DAO Potential
            </Text>
            <br />
            <Text color="blue.500" as="span">
              Seamless, Secure, Inclusive.
            </Text>
          </Heading>

          <Text fontSize={{ base: "md", lg: "lg" }} color="gray.500">
            Empower your community with simplified DAO governance. Streamline
            decisions effortlessly for a decentralized revolution.
          </Text>

          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={4}
            w={{ base: "full", md: "auto" }}
          >
            <Button
              rounded="full"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              width={{ base: "full", md: "auto" }}
              onClick={registerRedirect}
            >
              Register Now!
            </Button>

            <Button
              width={{ base: "full", md: "auto" }}
              rounded="full"
              onClick={createDAO}
            >
              Create a DAO
            </Button>
          </Stack>
        </Stack>

        {/* Right Image Section */}
        <Image
          alt="DAO Landing"
          objectFit="contain"
          src="/assets/DAOLanding.svg"
          width={{ base: 250, md: 300, lg: 380 }}
          maxW="100%"
        />
      </Flex>
    </Flex>
  );
}
