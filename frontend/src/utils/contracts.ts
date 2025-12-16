// Deployed Contract Addresses on U2U Testnet (Chain ID: 2484)
// Deployment Date: 2025-10-10
// Block: 60795542-60795544

export const CONTRACTS = {
  // U2U Testnet (Nebulas) - Chain ID: 2484
  2484: {
    GovernanceToken: process.env.NEXT_PUBLIC_TESTNET_GOVERNANCE_TOKEN_ADDRESS || "0x7075D321d3f586445609635763eF9Dbbc6B13127",
    CreateGovernanceToken: process.env.NEXT_PUBLIC_TESTNET_CREATE_GOVERNANCE_ADDRESS || "0xbDD418Ea726a0b53662E42429BDAB867Ac746aAe",
    DAOManager: process.env.NEXT_PUBLIC_TESTNET_DAOMANAGER_ADDRESS || "0x8c2786cfc456232a4017658481C71a3FF3676418",
    MaciWrapper: process.env.NEXT_PUBLIC_TESTNET_MACI_WRAPPER_ADDRESS || "0xec5798703687a08475821DF5C6017980319FEF72",
  },
  // U2U Mainnet (Solaris) - Chain ID: 39
  39: {
    GovernanceToken: process.env.NEXT_PUBLIC_MAINNET_GOVERNANCE_TOKEN_ADDRESS || "0xe42d9fFA1367eF66d4fEAc78ef2cc5B67ce8F073",
    CreateGovernanceToken: process.env.NEXT_PUBLIC_MAINNET_CREATE_GOVERNANCE_ADDRESS || "0x1F9aF1a990728bA27D0ac46d57baEe17d4a67E1d",
    DAOManager: process.env.NEXT_PUBLIC_MAINNET_DAOMANAGER_ADDRESS || "0x52533caE078F0782A3c33C2EC77b1a81C3Fce832",
    MaciWrapper: process.env.NEXT_PUBLIC_MAINNET_MACI_WRAPPER_ADDRESS || "0xec5798703687a08475821DF5C6017980319FEF72",
  },
} as const;

// Helper function to get contract address by chain ID (defaults to testnet)
export const getContractAddress = (
  chainId: number = 2484, // Default to testnet
  contractName: keyof typeof CONTRACTS[2484]
): string => {
  // If unsupported chain, default to testnet
  const supportedChainId = [2484, 39].includes(chainId) ? chainId : 2484;

  const addresses = CONTRACTS[supportedChainId as keyof typeof CONTRACTS];
  if (!addresses) {
    console.warn(`Unsupported chain ID: ${chainId}, defaulting to testnet (2484)`);
    return CONTRACTS[2484][contractName];
  }

  const address = addresses[contractName];
  if (!address) {
    console.warn(`Contract ${contractName} not found on chain ${chainId}, defaulting to testnet`);
    return CONTRACTS[2484][contractName];
  }

  return address;
};

// Async helpers to resolve addresses using an ethers.js provider
export const getDaoManagerAddress = async (
  provider: any
) => {
  const network = await provider.getNetwork();
  return getContractAddress(Number(network.chainId), "DAOManager");
};

export const getCreateGovernanceTokenAddress = async (
  provider: any
) => {
  const network = await provider.getNetwork();
  return getContractAddress(Number(network.chainId), "CreateGovernanceToken");
};

export const getGovernanceTokenAddress = async (
  provider: any
) => {
  const network = await provider.getNetwork();
  return getContractAddress(Number(network.chainId), "GovernanceToken");
};

// Export individual addresses for convenience
export const DAO_MANAGER_ADDRESS = CONTRACTS[2484].DAOManager;
export const CREATE_GOVERNANCE_TOKEN_ADDRESS = CONTRACTS[2484].CreateGovernanceToken;
export const GOVERNANCE_TOKEN_ADDRESS = CONTRACTS[2484].GovernanceToken;

// Network configuration with environment variable support
export const NETWORK_CONFIG = {
  2484: {
    name: "U2U Network Nebulas",
    rpcUrl: process.env.NEXT_PUBLIC_TESTNET_RPC_URL || "https://rpc-nebulas-testnet.u2u.xyz",
    explorer: "https://testnet.u2uscan.xyz",
    nativeCurrency: {
      name: "U2U",
      symbol: "U2U",
      decimals: 18,
    },
  },
  39: {
    name: "U2U Network Solaris",
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://rpc-mainnet.u2u.xyz",
    explorer: "https://u2uscan.xyz",
    nativeCurrency: {
      name: "U2U",
      symbol: "U2U",
      decimals: 18,
    },
  },
} as const;

// Helper to get RPC URL for network
export const getRpcUrl = (chainId: number = 2484): string => {
  return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.rpcUrl || NETWORK_CONFIG[2484].rpcUrl;
};

// Helper to get network name
export const getNetworkName = (chainId: number = 2484): string => {
  return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.name || NETWORK_CONFIG[2484].name;
};
