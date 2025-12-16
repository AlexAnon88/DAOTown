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
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { DownloadIcon, ArrowBackIcon } from "@chakra-ui/icons";
import daomanagerabi from "../../../utils/abis/DAOManager.json";
import { getDAOManagerAddress, getSafeChainId } from "../../../utils/networkUtils";
import { createSafeContract } from "../../../utils/u2uProvider";

const DaoFiles = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const { chain } = useNetwork();
  const { address } = useAccount();
  
  const [files, setFiles] = useState([]);
  const [daoData, setDaoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (daoId && address) {
      loadFiles();
    }
  }, [daoId, address]);

  const loadFiles = async () => {
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

      console.log(`📁 Loading files for DAO ${daoId}...`);

      // Get DAO data
      const daoInfo = await contract.daoIdtoDao(daoId);
      console.log("DAO info:", daoInfo);

      // Check if user has access (is DAO member)
      const userAddress = await signer.getAddress();
      const daoMembers = await contract.getDaoMembers(daoId);
      
      const isMember = daoMembers.some(member => 
        member.userAddress.toLowerCase() === userAddress.toLowerCase()
      );

      setHasAccess(isMember || !daoInfo.isPrivate);
      setDaoData({
        id: daoId,
        name: daoInfo.daoName,
        isPrivate: daoInfo.isPrivate,
      });

      if (!isMember && daoInfo.isPrivate) {
        setIsLoading(false);
        return;
      }

      // Get all files for this DAO
      // Note: This assumes you have a way to get files by DAO ID
      // You might need to adjust this based on your contract structure
      const filesList = [];
      let fileIndex = 0;
      let hasMoreFiles = true;

      while (hasMoreFiles && fileIndex < 100) { // Limit to 100 files for safety
        try {
          const fileInfo = await contract.getDaoFile(daoId, fileIndex);
          if (fileInfo && fileInfo.fileName) {
            filesList.push({
              id: fileIndex,
              name: fileInfo.fileName,
              description: fileInfo.description,
              ipfsHash: fileInfo.ipfsHash,
              uploadedBy: fileInfo.uploadedBy,
              timestamp: new Date(fileInfo.timestamp * 1000),
            });
            fileIndex++;
          } else {
            hasMoreFiles = false;
          }
        } catch (err) {
          hasMoreFiles = false;
        }
      }

      setFiles(filesList);

    } catch (error) {
      console.error("Error loading files:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = (fileId) => {
    router.push(`/dao/file/${fileId}`);
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading files...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Error loading files: {error}
        </Alert>
        <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!hasAccess) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          You don't have access to view files in this DAO. Only DAO members can view private DAO files.
        </Alert>
        <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Button size="sm" variant="ghost" leftIcon={<ArrowBackIcon />} onClick={() => router.push(`/dao/${daoId}`)}>
              Back to DAO
            </Button>
            <Heading size="xl" mt={2}>Files in {daoData?.name}</Heading>
            <Badge colorScheme={daoData?.isPrivate ? "red" : "green"} mt={2}>
              {daoData?.isPrivate ? "Private DAO" : "Public DAO"}
            </Badge>
          </Box>
          <Button colorScheme="blue" onClick={() => router.push(`/upload-file?daoId=${daoId}`)}>
            Upload New File
          </Button>
        </HStack>

        {files.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {files.map((file) => (
              <Card key={file.id} cursor="pointer" onClick={() => handleFileClick(file.id)} _hover={{ shadow: "lg" }}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md" noOfLines={1}>{file.name}</Heading>
                    <Icon as={DownloadIcon} />
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    {file.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {file.description}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      Uploaded: {file.timestamp.toLocaleDateString()}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontFamily="mono" noOfLines={1}>
                      {file.ipfsHash}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={20}>
            <Heading size="lg" mb={4} color="gray.500">
              No Files Yet
            </Heading>
            <Text color="gray.400" mb={6}>
              This DAO doesn't have any files yet. Be the first to upload one!
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => router.push(`/upload-file?daoId=${daoId}`)}
            >
              Upload First File
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default DaoFiles;
