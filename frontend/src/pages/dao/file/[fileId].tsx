// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Link,
  Icon,
} from "@chakra-ui/react";
import { ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import daomanagerabi from "../../../utils/abis/DAOManager.json";
import { getDAOManagerAddress, getSafeChainId } from "../../../utils/networkUtils";
import { createSafeContract } from "../../../utils/u2uProvider";

const FileView = () => {
  const router = useRouter();
  const { fileId } = router.query;
  const { chain } = useNetwork();
  const { address } = useAccount();
  
  const [fileData, setFileData] = useState(null);
  const [daoData, setDaoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (fileId && address) {
      loadFileData();
    }
  }, [fileId, address]);

  const loadFileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const currentChainId = getSafeChainId(chain?.id);
      const daoManagerAddress = getDAOManagerAddress(currentChainId);
      
      const contract = createSafeContract(
        daoManagerAddress,
        daomanagerabi,
        signer
      );

      console.log(`📁 Loading file ${fileId}...`);

      // Get file data from contract
      const fileInfo = await contract.getFile(fileId);
      console.log("File info:", fileInfo);

      // Get DAO data
      const daoInfo = await contract.daoIdtoDao(fileInfo.daoId);
      console.log("DAO info:", daoInfo);

      // Check if user has access (is DAO member)
      const userAddress = await signer.getAddress();
      const userId = await contract.addressToUserId(userAddress);
      const daoMembers = await contract.getDaoMembers(fileInfo.daoId);
      
      const isMember = daoMembers.some(member => 
        member.userAddress.toLowerCase() === userAddress.toLowerCase()
      );

      setFileData({
        id: fileId,
        name: fileInfo.fileName,
        description: fileInfo.description,
        ipfsHash: fileInfo.ipfsHash,
        uploadedBy: fileInfo.uploadedBy,
        timestamp: new Date(fileInfo.timestamp * 1000),
        daoId: fileInfo.daoId,
      });

      setDaoData({
        id: fileInfo.daoId,
        name: daoInfo.daoName,
        isPrivate: daoInfo.isPrivate,
      });

      setHasAccess(isMember || !daoInfo.isPrivate);

    } catch (error) {
      console.error("Error loading file:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIPFSUrl = (hash) => {
    return `https://gateway.lighthouse.storage/ipfs/${hash}`;
  };

  const handleDownload = () => {
    if (fileData?.ipfsHash) {
      window.open(getIPFSUrl(fileData.ipfsHash), '_blank');
    }
  };

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading file...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Error loading file: {error}
        </Alert>
      </Container>
    );
  }

  if (!hasAccess) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          You don't have access to this file. Only DAO members can view private DAO files.
        </Alert>
        <Button mt={4} onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
        </Box>

        <Card>
          <CardHeader>
            <VStack align="start" spacing={2}>
              <HStack>
                <Heading size="lg">{fileData?.name}</Heading>
                <Badge colorScheme={daoData?.isPrivate ? "red" : "green"}>
                  {daoData?.isPrivate ? "Private" : "Public"}
                </Badge>
              </HStack>
              <Text color="gray.600">
                From DAO: <strong>{daoData?.name}</strong>
              </Text>
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack align="start" spacing={4}>
              {fileData?.description && (
                <Box>
                  <Text fontWeight="semibold">Description:</Text>
                  <Text>{fileData.description}</Text>
                </Box>
              )}

              <Box>
                <Text fontWeight="semibold">Uploaded:</Text>
                <Text>{fileData?.timestamp?.toLocaleString()}</Text>
              </Box>

              <Box>
                <Text fontWeight="semibold">IPFS Hash:</Text>
                <Text fontFamily="mono" fontSize="sm" color="gray.600">
                  {fileData?.ipfsHash}
                </Text>
              </Box>

              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  leftIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download File
                </Button>
                
                <Link href={getIPFSUrl(fileData?.ipfsHash)} isExternal>
                  <Button variant="outline" leftIcon={<ExternalLinkIcon />}>
                    View on IPFS
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Box textAlign="center">
          <Button
            colorScheme="green"
            onClick={() => router.push(`/dao/${daoData?.id}`)}
          >
            Back to DAO
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default FileView;
