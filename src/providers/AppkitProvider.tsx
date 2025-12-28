"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http, defineChain } from "viem";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const projectId = "7ca7cf94ee5b1caba51b405ce99386f0";

const metadata = {
  name: "SwapX",
  description: "Swap tokens using Uniswap v3",
  url: "https://swapx.io",
  icons: ["https://swapx.io/favicon.ico"],
};

export const anvilMainnetFork = defineChain({
  id: 31337,
  name: "Anvil (Mainnet Fork)",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Anvil", url: "" },
  },
  testnet: true,
});

const networks: [typeof anvilMainnetFork, typeof mainnet, typeof sepolia] = [
  anvilMainnetFork,
  mainnet,
  sepolia,
];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    [anvilMainnetFork.id]: http("http://127.0.0.1:8545"),
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
