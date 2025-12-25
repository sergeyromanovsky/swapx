"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http, defineChain } from "viem";
import { ReactNode } from "react";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = "7ca7cf94ee5b1caba51b405ce99386f0";

// 2. Create a metadata object
const metadata = {
  name: "Crypto Swapper",
  description: "Swap tokens using Uniswap v4",
  url: "https://example.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Define Anvil chain (mainnet fork)
// Запускай: anvil --fork-url https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY --chain-id 31337
export const anvilMainnetFork = defineChain({
  id: 31337, // Anvil default chainId
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

// 4. Set the networks - можно переключаться между сетями
const networks: [typeof anvilMainnetFork, typeof mainnet, typeof sepolia] = [
  anvilMainnetFork, // Для локальной разработки
  mainnet, // Для продакшена
  sepolia, // Для тестов на testnet
];

// 5. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    // Anvil local fork (chainId 31337)
    [anvilMainnetFork.id]: http("http://127.0.0.1:8545"),
  },
});

// 6. Create modal
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
