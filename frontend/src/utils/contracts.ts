// Deployed Contract Addresses on U2U Testnet (Chain ID: 2484)
// Deployment Date: 2025-10-10
// Block: 60795542-60795544

export const CONTRACTS = {
  // U2U Testnet (Nebulas)
  2484: {
    GovernanceToken: "0x7075D321d3f586445609635763eF9Dbbc6B13127",
    CreateGovernanceToken: "0xbDD418Ea726a0b53662E42429BDAB867Ac746aAe",
    DAOManager: "0x8c2786cfc456232a4017658481C71a3FF3676418",
  },
  // U2U Mainnet (Solaris) - Update when deployed
  39: {
    GovernanceToken: "",
    CreateGovernanceToken: "",
    DAOManager: "",
  },
} as const;

// Helper function to get contract address by chain ID
export const getContractAddress = (
  chainId: number,
  contractName: keyof typeof CONTRACTS[2484]
): string => {
  const addresses = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  const address = addresses[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on chain ${chainId}`);
  }
  return address;
};

// Export individual addresses for convenience
export const DAO_MANAGER_ADDRESS = CONTRACTS[2484].DAOManager;
export const CREATE_GOVERNANCE_TOKEN_ADDRESS = CONTRACTS[2484].CreateGovernanceToken;
export const GOVERNANCE_TOKEN_ADDRESS = CONTRACTS[2484].GovernanceToken;

// Network configuration
export const NETWORK_CONFIG = {
  2484: {
    name: "U2U Network Nebulas",
    rpcUrl: "https://rpc-nebulas-testnet.u2u.xyz",
    explorer: "https://testnet.u2uscan.xyz",
    nativeCurrency: {
      name: "U2U",
      symbol: "U2U",
      decimals: 18,
    },
  },
  39: {
    name: "U2U Network Solaris",
    rpcUrl: "https://rpc-mainnet.u2u.xyz",
    explorer: "https://u2uscan.xyz",
    nativeCurrency: {
      name: "U2U",
      symbol: "U2U",
      decimals: 18,
    },
  },
} as const;
