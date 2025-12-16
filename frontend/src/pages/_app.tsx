// @ts-nocheck comment
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import WagmiProvider from "../utils/wagmiprovider";
import Footer from "@/components/Footer";
import "../utils/suppressConsoleErrors";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

const colors = {
  brand: {
    50: "#ecefff",
    100: "#cbceeb",
    200: "#a9aed6",
    300: "#888ec5",
    400: "#666db3",
    500: "#4d5499",
    600: "#3c4178",
    700: "#2a2f57",
    800: "#181c37",
    900: "#080819",
  },
};
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ colors, config });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <title>DAOTown</title>
        <meta name="description" content="Unlocking DAO Potential" />
      </Head>
      <WagmiProvider>
        <SessionProvider session={session}>
          <ChakraProvider theme={theme}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
              }}
            >
              <Navbar />
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Component {...pageProps} />
                <Footer />
              </div>
            </div>
          </ChakraProvider>
        </SessionProvider>
      </WagmiProvider>
    </>
  );
}
