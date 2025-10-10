// @ts-nocheck comment
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { Chain } from "wagmi/chains";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

// U2U Testnet (Nebulas)
const u2uTestnet: Chain = {
  id: 2484,
  name: "U2U Network Nebulas",
  network: "u2u-nebulas-testnet",
  iconUrl: "https://u2u.xyz/favicon.ico",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "U2U",
    symbol: "U2U",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-nebulas-testnet.u2u.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Nebulas Explorer",
      url: "https://testnet.u2uscan.xyz/",
    },
  },
  testnet: true,
};

// U2U Mainnet (Solaris)
const u2uMainnet: Chain = {
  id: 39,
  name: "U2U Network Solaris",
  network: "u2u-solaris-mainnet",
  iconUrl: "https://u2u.xyz/favicon.ico",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "U2U",
    symbol: "U2U",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.u2u.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "U2U Solaris Explorer",
      url: "https://u2uscan.xyz/",
    },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [u2uTestnet, u2uMainnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function WagmiConnect(props: any) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
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
      </WagmiConfig>
    </>
  );
}

export default WagmiConnect;
