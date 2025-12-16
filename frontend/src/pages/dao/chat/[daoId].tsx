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
  Input,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChatIcon } from "@chakra-ui/icons";
import daomanagerabi from "../../../utils/abis/DAOManager.json";
import { getDAOManagerAddress, getSafeChainId } from "../../../utils/networkUtils";
import { createSafeContract } from "../../../utils/u2uProvider";

const DaoChat = () => {
  const router = useRouter();
  const { daoId } = router.query;
  const { chain } = useNetwork();
  const { address } = useAccount();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [daoData, setDaoData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (daoId && address) {
      loadChatData();
    }
  }, [daoId, address]);

  const loadChatData = async () => {
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

      console.log(`💬 Loading chat for DAO ${daoId}...`);

      // Get DAO data
      const daoInfo = await contract.daoIdtoDao(daoId);
      
      // Get user data
      const userAddress = await signer.getAddress();
      const userId = await contract.addressToUserId(userAddress);
      const userInfo = await contract.userIdtoUser(userId);

      // Check if user has access (is DAO member)
      const daoMembers = await contract.getDaoMembers(daoId);
      
      const isMember = daoMembers.some(member => 
        member.userAddress.toLowerCase() === userAddress.toLowerCase()
      );

      setHasAccess(isMember || !daoInfo.isPrivate);
      setDaoData({
        id: daoId,
        name: daoInfo.daoName,
        isPrivate: daoInfo.isPrivate,
        discordId: daoInfo.discordID,
      });

      setUserData({
        id: userId.toString(),
        name: userInfo.userName,
        address: userAddress,
      });

      // Load messages (this is a placeholder - you'll need to implement message storage)
      // For now, we'll show a message about using Discord
      setMessages([]);

    } catch (error) {
      console.error("Error loading chat:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      // TODO: Implement on-chain or off-chain message storage
      // For now, just add to local state
      const message = {
        id: Date.now(),
        sender: userData.name,
        senderAddress: userData.address,
        content: newMessage,
        timestamp: new Date(),
      };

      setMessages([...messages, message]);
      setNewMessage("");

      // You could also send to Discord if integrated
      if (daoData?.discordId) {
        // Send to Discord channel
        console.log("Sending to Discord channel:", daoData.discordId);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading chat...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Error loading chat: {error}
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
          You don't have access to this DAO's chat. Only DAO members can participate.
        </Alert>
        <Button mt={4} leftIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch" height="80vh">
        <HStack justify="space-between">
          <Box>
            <Button size="sm" variant="ghost" leftIcon={<ArrowBackIcon />} onClick={() => router.push(`/dao/${daoId}`)}>
              Back to DAO
            </Button>
            <Heading size="xl" mt={2}>{daoData?.name} Chat</Heading>
            <Badge colorScheme={daoData?.isPrivate ? "red" : "green"} mt={2}>
              {daoData?.isPrivate ? "Private DAO" : "Public DAO"}
            </Badge>
          </Box>
        </HStack>

        {daoData?.discordId && daoData.discordId !== "discord-channel-failed" ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Discord Integration Active</Text>
              <Text fontSize="sm">
                This DAO has a Discord channel. Join the Discord server to chat with other members!
              </Text>
            </Box>
          </Alert>
        ) : (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">On-Chain Chat (Beta)</Text>
              <Text fontSize="sm">
                This is a basic on-chain chat. For better experience, consider setting up Discord integration.
              </Text>
            </Box>
          </Alert>
        )}

        <Card flex="1" overflow="hidden">
          <CardBody display="flex" flexDirection="column" height="100%">
            <VStack 
              flex="1" 
              spacing={4} 
              align="stretch" 
              overflowY="auto" 
              mb={4}
              p={4}
              bg="gray.50"
              borderRadius="md"
            >
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <Flex key={msg.id} gap={3}>
                    <Avatar size="sm" name={msg.sender} />
                    <Box flex="1">
                      <HStack spacing={2} mb={1}>
                        <Text fontWeight="bold" fontSize="sm">{msg.sender}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {msg.timestamp.toLocaleTimeString()}
                        </Text>
                      </HStack>
                      <Text fontSize="sm">{msg.content}</Text>
                    </Box>
                  </Flex>
                ))
              ) : (
                <Box textAlign="center" py={10}>
                  <ChatIcon boxSize={12} color="gray.400" mb={4} />
                  <Text color="gray.500">No messages yet. Start the conversation!</Text>
                </Box>
              )}
            </VStack>

            <HStack>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
              />
              <Button
                colorScheme="blue"
                onClick={handleSendMessage}
                isLoading={isSending}
                loadingText="Sending"
              >
                Send
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default DaoChat;
