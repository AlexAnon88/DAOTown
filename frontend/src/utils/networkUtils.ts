import { getContractAddress, getRpcUrl, getNetworkName } from './contracts';

// Network constants
export const TESTNET_CHAIN_ID = 2484;
export const MAINNET_CHAIN_ID = 39;

// Default network (testnet for safety)
export const DEFAULT_CHAIN_ID = TESTNET_CHAIN_ID;

// Check if chain ID is supported
export const isSupportedNetwork = (chainId: number): boolean => {
  return [TESTNET_CHAIN_ID, MAINNET_CHAIN_ID].includes(chainId);
};

// Get safe chain ID (defaults to testnet if unsupported)
export const getSafeChainId = (chainId?: number): number => {
  if (!chainId || !isSupportedNetwork(chainId)) {
    console.warn(`Unsupported or missing chain ID: ${chainId}, defaulting to testnet (${TESTNET_CHAIN_ID})`);
    return TESTNET_CHAIN_ID;
  }
  return chainId;
};

// Network info helper
export const getNetworkInfo = (chainId?: number) => {
  const safeChainId = getSafeChainId(chainId);
  return {
    chainId: safeChainId,
    name: getNetworkName(safeChainId),
    rpcUrl: getRpcUrl(safeChainId),
    isTestnet: safeChainId === TESTNET_CHAIN_ID,
    isMainnet: safeChainId === MAINNET_CHAIN_ID,
  };
};

// Contract address helpers with safe defaults
export const getDAOManagerAddress = (chainId?: number): string => {
  return getContractAddress(getSafeChainId(chainId), "DAOManager");
};

export const getCreateGovernanceTokenAddress = (chainId?: number): string => {
  return getContractAddress(getSafeChainId(chainId), "CreateGovernanceToken");
};

export const getGovernanceTokenAddress = (chainId?: number): string => {
  return getContractAddress(getSafeChainId(chainId), "GovernanceToken");
};

// Network display helpers
export const getNetworkDisplayName = (chainId?: number): string => {
  const info = getNetworkInfo(chainId);
  return `${info.name} ${info.isTestnet ? '(Testnet)' : '(Mainnet)'}`;
};

export const getNetworkBadgeColor = (chainId?: number): string => {
  const info = getNetworkInfo(chainId);
  return info.isTestnet ? 'orange' : 'green';
};
