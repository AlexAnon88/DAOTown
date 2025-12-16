import { ethers } from 'ethers';
import { useNetwork } from 'wagmi';

// U2U Network provider configuration without ENS support
export const getU2UProvider = (chainId?: number) => {
  const rpcUrls = {
    39: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://rpc-mainnet.u2u.xyz',      // U2U Mainnet
    2484: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || 'https://rpc-nebulas-testnet.u2u.xyz' // U2U Testnet
  };

  const currentChainId = chainId || 2484; // Default to testnet
  const rpcUrl = rpcUrls[currentChainId as keyof typeof rpcUrls] || rpcUrls[2484];

  // Create provider without ENS support
  const provider = new ethers.providers.JsonRpcProvider({
    url: rpcUrl,
    timeout: 30000,
  });

  // Override the network detection to prevent ENS lookups
  provider.detectNetwork = async () => {
    return {
      name: currentChainId === 39 ? 'u2u-mainnet' : 'u2u-testnet',
      chainId: currentChainId,
      ensAddress: undefined, // Disable ENS
    };
  };

  return provider;
};

// Hook to get current network provider
export const useU2UProvider = () => {
  const { chain } = useNetwork();
  return getU2UProvider(chain?.id);
};

// Safe contract interaction without ENS
export const createSafeContract = (
  address: string,
  abi: any[],
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  // Validate address format
  if (!ethers.utils.isAddress(address)) {
    throw new Error('Invalid contract address format');
  }

  return new ethers.Contract(address, abi, signerOrProvider);
};

// Safe token details fetcher without ENS
export const fetchTokenDetailsU2U = async (
  tokenAddress: string,
  chainId?: number
): Promise<{ name: string; symbol: string; decimals: number }> => {
  try {
    // Validate address
    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }

    const provider = getU2UProvider(chainId);
    
    // ERC-20 ABI for basic token info
    const tokenABI = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
    ];

    const contract = createSafeContract(tokenAddress, tokenABI, provider);

    // Fetch token details with timeout
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return {
      name: name || 'Unknown Token',
      symbol: symbol || 'UNKNOWN',
      decimals: decimals || 18,
    };
  } catch (error: any) {
    console.warn('Token details fetch failed:', error.message);
    
    // Return default values instead of throwing
    return {
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
    };
  }
};

// Address validation without ENS
export const validateAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

// Format address for display (no ENS resolution)
export const formatAddress = (address: string, chars = 4): string => {
  if (!validateAddress(address)) return 'Invalid Address';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};
