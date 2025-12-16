"use client";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Chain } from "wagmi";

// U2U Testnet (Nebulas)
const u2uTestnet: Chain = {
  id: 2484,
  name: "U2U Network Nebulas",
  network: "u2u-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "U2U",
    symbol: "U2U",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-nebulas-testnet.u2u.xyz"],
    },
    public: {
      http: ["https://rpc-nebulas-testnet.u2u.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Nebulas Explorer",
      url: "https://testnet.u2uscan.xyz",
    },
  },
  testnet: true,
};

// U2U Mainnet (Solaris)
const u2uMainnet: Chain = {
  id: 39,
  name: "U2U Network Solaris",
  network: "u2u-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "U2U",
    symbol: "U2U",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.u2u.xyz"],
    },
    public: {
      http: ["https://rpc-mainnet.u2u.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Solaris Explorer",
      url: "https://u2uscan.xyz",
    },
  },
  testnet: false,
};

const { chains, publicClient } = configureChains(
  [u2uMainnet, u2uTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "DAOTown",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "daotown-u2u-mainnet",
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  logger: {
    warn: (message) => {
      // Suppress WalletConnect relayer warnings
      if (message.includes('relayer') || message.includes('core')) return;
      console.warn(message);
    },
  },
});

const queryClient = new QueryClient();

function WagmiConnect(props: any) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: "#1E88E5",
            borderRadius: "large",
            overlayBlur: "small",
          })}
          coolMode
        >
          {props.children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default WagmiConnect;
