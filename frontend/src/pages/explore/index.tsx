// @ts-nocheck comment
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import daomanagerabi from "../../utils/abis/DAOManager.json";
import governancetokenabi from "../../utils/abis/GovernanceToken.json";
import { getContractAddress } from "../../utils/contracts";
import { getU2UProvider, createSafeContract } from "../../utils/u2uProvider";
import { getSafeChainId, getDAOManagerAddress, getNetworkInfo } from "../../utils/networkUtils";
import {
  Box,
  Container,
  GridItem,
  AbsoluteCenter,
  Spinner,
  Button,
  Flex,
  Heading,
  Text,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import DaosCard from "../../components/DaosCard/DaosCard";
import daoService from "../../services/daoService";

const PAGE_SIZE = 12;

const Explore = () => {
  const [daos, setDaos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalDAOs, setTotalDAOs] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { chain } = useNetwork();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onLoad = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!window.ethereum || !window.ethereum._state || window.ethereum._state.accounts.length === 0) {
        console.log("No wallet connected");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadingProgress(0);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const currentChainId = getSafeChainId(chain?.id);
      const networkInfo = getNetworkInfo(currentChainId);
      const daoManagerAddress = getDAOManagerAddress(currentChainId);
      
      console.log(`🌐 Loading DAOs from ${networkInfo.name} (Chain ${currentChainId})`);
      console.log(`📄 Page ${pageNum}, Size ${PAGE_SIZE}`);
      
      const contract = createSafeContract(
        daoManagerAddress,
        daomanagerabi,
        signer
      );

      // Use the scalable DAO service
      const result = await daoService.loadDAOsPage(
        pageNum,
        PAGE_SIZE,
        contract,
        signer,
        (loaded, total) => {
          const progress = (loaded / total) * 100;
          setLoadingProgress(progress);
          console.log(`📊 Progress: ${loaded}/${total} (${progress.toFixed(0)}%)`);
        }
      );

      console.log(`✅ Loaded ${result.daos.length} DAOs (Total: ${result.total}, Has More: ${result.hasMore})`);
      
      // Debug: Show all DAOs
      if (result.daos.length > 0) {
        console.log(`📋 DAOs loaded:`);
        result.daos.forEach((dao, idx) => {
          console.log(`  ${idx + 1}. ${dao.daoInfo.daoName} - ${dao.daoInfo.isPrivate ? 'PRIVATE' : 'PUBLIC'}`);
        });
      } else {
        console.log(`⚠️ NO DAOs RETURNED FROM SERVICE`);
        console.log(`Total DAOs in contract: ${result.total}`);
      }

      setTotalDAOs(result.total);
      setHasMore(result.hasMore);
      
      if (append) {
        setDaos(prev => [...prev, ...result.daos]);
      } else {
        setDaos(result.daos);
      }

      // Prefetch next page for smooth scrolling
      if (result.hasMore) {
        daoService.prefetchNextPage(pageNum, PAGE_SIZE, contract, signer);
      }

    } catch (error) {
      console.error("Error loading DAOs:", error);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  useEffect(() => {
    // Clear cache on mount to always get fresh data
    daoService.clearCache();
    onLoad();
  }, [chain?.id]); // Reload when network changes

  // Add a refresh function that can be called externally
  useEffect(() => {
    const handleRefresh = () => {
      setIsLoading(true);
      onLoad();
    };

    // Listen for custom refresh events
    window.addEventListener('refreshDAOs', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshDAOs', handleRefresh);
    };
  }, []);

  const handleRefresh = () => {
    console.log(`🔄 FORCE REFRESH - Clearing all caches`);
    daoService.clearCache();
    setPage(1);
    setDaos([]);
    setTotalDAOs(0);
    onLoad(1, false);
  };


  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    onLoad(nextPage, true);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      handleRefresh();
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const currentChainId = getSafeChainId(chain?.id);
      const daoManagerAddress = getDAOManagerAddress(currentChainId);
      const contract = createSafeContract(daoManagerAddress, daomanagerabi, signer);

      const results = await daoService.searchDAOs(query, contract, signer);
      setDaos(results);
      setHasMore(false);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Box flex={1} py={8}>
      <Container maxW="7xl">
        <VStack spacing={6} mb={8}>
          <Flex justify="space-between" align="center" w="full">
            <Box>
              <Heading size="lg">Explore DAOs</Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {mounted && (
                  <>
                    {totalDAOs} DAOs on {chain?.name || 'Unknown'}
                  </>
                )}
              </Text>
            </Box>
            <Flex gap={3}>
              <Button 
                colorScheme="green" 
                onClick={() => window.location.href = '/create-dao'}
              >
                Create DAO
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleRefresh}
                isLoading={isLoading}
                loadingText="Refreshing..."
              >
                Refresh
              </Button>
            </Flex>
          </Flex>

          <InputGroup maxW="600px">
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search DAOs by name, creator, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <Button
              ml={2}
              onClick={() => handleSearch(searchQuery)}
              isLoading={isSearching}
            >
              Search
            </Button>
          </InputGroup>

          {loadingProgress > 0 && loadingProgress < 100 && (
            <Box w="full" maxW="600px">
              <Progress value={loadingProgress} size="sm" colorScheme="blue" hasStripe isAnimated />
              <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                Loading DAOs... {loadingProgress.toFixed(0)}%
              </Text>
            </Box>
          )}
        </VStack>
      
      {isLoading ? (
        <>
          <AbsoluteCenter>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="orange.500"
              size="xl"
            />
          </AbsoluteCenter>
          <AbsoluteCenter style={{ marginTop: "60px", whiteSpace: "nowrap" }}>
            <h2>Loading Public DAOs</h2>
          </AbsoluteCenter>
        </>
      ) : (
        <>
          {daos && daos.length > 0 ? (
            <Flex
              wrap="wrap"
              gap={6}
              justify="space-between"
            >
              {daos
                .map((dao) => (
                  <DaosCard
                    key={dao.daoInfo.daoId}
                    daoName={dao.daoInfo.daoName}
                    joiningThreshold={dao.daoInfo.joiningThreshold}
                    creatorName={dao.creatorInfo.userName}
                    tokenName={dao.tokenName}
                    tokenSymbol={dao.tokenSymbol}
                    totalDaoMember={dao.totalDaoMembers}
                    daoId={dao.daoInfo.daoId}
                    channel={dao.daoInfo.discordID}
                  />
                ))}
            </Flex>
          ) : (
            <Box textAlign="center" py={20}>
              <Heading size="lg" mb={4} color="gray.500">
                No Public DAOs Found
              </Heading>
              <Box fontSize="md" color="gray.400" mb={6}>
                <p>There are currently no public DAOs on this network.</p>
                <p>Be the first to create one!</p>
              </Box>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => window.location.href = '/create-dao'}
              >
                Create Your First DAO
              </Button>
            </Box>
          )}

          {hasMore && daos.length > 0 && (
            <Box textAlign="center" mt={8}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={loadMore}
                isLoading={isLoading}
                loadingText="Loading more..."
              >
                Load More DAOs
              </Button>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Showing {daos.length} of {totalDAOs} DAOs
              </Text>
            </Box>
          )}
        </>
      )}
      </Container>
    </Box>
  );
};

export default Explore;
