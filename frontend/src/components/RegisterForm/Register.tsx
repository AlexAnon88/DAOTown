// @ts-nocheck comment
import React, { useState, useRef, use, useEffect } from "react";
import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  chakra,
  VisuallyHidden,
  Text,
  Stack,
  ring,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import daomanagerabi from "../../utils/abis/DAOManager.json";

const RegisterForm = () => {
  const toast = useToast();
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  // Store file when selected (don't upload yet)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfileImage(file.name);
      toast({
        title: "Image Selected",
        description: `${file.name} - Will upload when you click Register`,
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // Upload file to IPFS
  const uploadFileToIPFS = async (file) => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    
    if (!apiKey) {
      throw new Error("Lighthouse API key is not configured. Please add it to your .env file.");
    }

    setIsUploading(true);
    try {
      const output = await lighthouse.upload(
        [file],
        apiKey,
        false,
        null,
        progressCallback
      );
      console.log("File Status:", output);
      console.log("Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash);
      return output.data.Hash;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!name || !email || !bio) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields (Name, Email, Bio).",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Missing Profile Image",
        description: "Please select a profile image.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsRegistering(true);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Step 1: Connect to wallet and get signer FIRST
      toast({
        title: "Connecting Wallet",
        description: "Please approve in MetaMask...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // Step 2: Validate contract setup
      const contractAddress = process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS;
      
      if (!contractAddress) {
        throw new Error("Contract address not configured. Please check your .env.local file.");
      }
      
      console.log("Contract address:", contractAddress);
      console.log("User address:", userAddress);
      console.log("Chain ID:", (await provider.getNetwork()).chainId);
      
      const contract = new ethers.Contract(
        contractAddress,
        daomanagerabi,
        signer
      );

      // Step 3: Estimate gas with TEMPORARY hash to check if transaction will succeed
      // This validates the user isn't already registered BEFORE we upload to IPFS
      toast({
        title: "Validating Registration",
        description: "Checking if you can register...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      const tempHash = "QmTemp"; // Temporary placeholder for gas estimation
      try {
        await contract.estimateGas.createUser(
          name,
          email,
          bio,
          tempHash,
          userAddress
        );
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        
        // Extract revert reason if available
        let revertReason = "Transaction will fail.";
        if (gasError.error?.message) {
          revertReason = gasError.error.message;
        } else if (gasError.message) {
          revertReason = gasError.message;
        }
        
        // Check for common errors
        if (revertReason.includes("User is not registered")) {
          throw new Error("Please connect your wallet and ensure it's on the correct network.");
        } else if (revertReason.includes("already")) {
          throw new Error("This wallet address is already registered. Each wallet can only register once.");
        }
        
        throw new Error(revertReason);
      }

      // Step 4: NOW upload to IPFS (only after confirming transaction will succeed)
      toast({
        title: "Uploading to IPFS",
        description: "Uploading your profile image...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      const ipfsHash = await uploadFileToIPFS(selectedFile);
      
      toast({
        title: "Upload Complete!",
        description: "Submitting transaction to blockchain...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      console.log("Creating user with:", { name, email, bio, ipfsHash, userAddress });

      // Step 5: Submit actual transaction with real IPFS hash
      const tx = await contract.createUser(
        name,
        email,
        bio,
        ipfsHash,
        userAddress,
        {
          gasLimit: 500000, // Set explicit gas limit
        }
      );
      
      console.log("Transaction hash:", tx.hash);
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      await tx.wait();

      toast({
        title: "Registration Successful!",
        description: "Welcome to DAOTown 🎉",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Clear form
      setName("");
      setEmail("");
      setBio("");
      setSelectedFile(null);
      setProfileImage("");
      
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "An error occurred during registration.";
      
      if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected.";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "This user is already registered.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient U2U tokens for gas fees.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getUser = async () => {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not installed");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        console.log("No accounts connected");
        return;
      }

      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DAOMANAGER_ADDRESS,
        daomanagerabi,
        signer
      );
      const tempUser = await userSideInstance.userIdtoUser(2);
      console.log(tempUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <SimpleGrid columns={1} spacing={6}>
          <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
            Join Now!🎯
          </Heading>
          <FormControl mr="2%">
            <FormLabel htmlFor="name" fontWeight={"normal"}>
              User Name
            </FormLabel>
            <Input
              id="name"
              placeholder="Name"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email" fontWeight={"normal"}>
              Email Address
            </FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="abc@gmail.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="bio">
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Bio
            </FormLabel>
            <Textarea
              placeholder="Write a short bio for yourself"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: "sm",
              }}
              onChange={(e) => setBio(e.target.value)}
            />
            <FormHelperText>Short Bio. URLs are hyperlinked.</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel
              fontWeight={"normal"}
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Profile Image
            </FormLabel>

            <Input 
              onChange={handleFileSelect} 
              type="file" 
              accept="image/*"
              disabled={isRegistering}
            />
            {profileImage && (
              <FormHelperText color="green.500">
                ✓ {profileImage} selected
              </FormHelperText>
            )}
          </FormControl>
        </SimpleGrid>
        <Button
          display="block"
          mx="auto"
          mt={6}
          w="10rem"
          colorScheme="purple"
          variant="solid"
          onClick={handleSubmit}
          isLoading={isRegistering || isUploading}
          loadingText={isUploading ? "Uploading..." : "Registering..."}
          disabled={isRegistering || isUploading}
        >
          Register
        </Button>
      </Box>
    </>
  );
};

export default RegisterForm;
