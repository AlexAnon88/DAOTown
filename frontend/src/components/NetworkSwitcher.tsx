import { useNetwork, useSwitchNetwork } from 'wagmi';
import { Button, Box, Text, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const SUPPORTED_NETWORKS = {
  39: {
    name: 'U2U Mainnet',
    chainId: 39,
    rpcUrl: 'https://rpc-mainnet.u2u.xyz',
    blockExplorer: 'https://u2uscan.xyz',
    nativeCurrency: { name: 'U2U', symbol: 'U2U', decimals: 18 }
  },
  2484: {
    name: 'U2U Testnet',
    chainId: 2484,
    rpcUrl: 'https://rpc-nebulas-testnet.u2u.xyz',
    blockExplorer: 'https://testnet.u2uscan.xyz',
    nativeCurrency: { name: 'U2U', symbol: 'U2U', decimals: 18 }
  }
};

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { switchNetwork, isLoading, error } = useSwitchNetwork();
  const [isManualSwitch, setIsManualSwitch] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (error && isManualSwitch) {
      toast({
        title: 'Network Switch Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsManualSwitch(false);
    }
  }, [error, isManualSwitch, toast]);

  const handleNetworkSwitch = async (chainId: number) => {
    setIsManualSwitch(true);
    
    try {
      // Add network to wallet if it doesn't exist
      const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
      
      if (window.ethereum) {
        try {
          // Try to switch to the network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorer],
              }],
            });
          } else {
            throw switchError;
          }
        }
      } else if (switchNetwork) {
        switchNetwork(chainId);
      }

      toast({
        title: 'Network Switched',
        description: `Switched to ${network.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Network Switch Failed',
        description: err.message || 'Failed to switch network',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsManualSwitch(false);
    }
  };

  const isUnsupportedNetwork = chain && !SUPPORTED_NETWORKS[chain.id as keyof typeof SUPPORTED_NETWORKS];

  return (
    <Box>
      {chain && (
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600">
            Current Network: <strong>{chain.name}</strong> (Chain ID: {chain.id})
          </Text>
          
          {isUnsupportedNetwork && (
            <Text fontSize="sm" color="red.500" mt={1}>
              ⚠️ Unsupported network. Please switch to U2U Mainnet or Testnet.
            </Text>
          )}
        </Box>
      )}

      <Box display="flex" gap={3} flexWrap="wrap">
        <Button
          size="sm"
          colorScheme={chain?.id === 39 ? "green" : "blue"}
          variant={chain?.id === 39 ? "solid" : "outline"}
          onClick={() => handleNetworkSwitch(39)}
          isLoading={isLoading && isManualSwitch}
          loadingText="Switching..."
        >
          🌐 U2U Mainnet
        </Button>

        <Button
          size="sm"
          colorScheme={chain?.id === 2484 ? "green" : "gray"}
          variant={chain?.id === 2484 ? "solid" : "outline"}
          onClick={() => handleNetworkSwitch(2484)}
          isLoading={isLoading && isManualSwitch}
          loadingText="Switching..."
        >
          🧪 U2U Testnet
        </Button>
      </Box>
    </Box>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
