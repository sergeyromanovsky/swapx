"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_APPKIT_PROJECT_ID is not set");
}

const metadata = {
  name: "SwapX",
  description: "Swap tokens using Uniswap v3",
  url: "https://swapx.io",
  icons: ["https://swapx.io/favicon.ico"],
};

const networks: [typeof mainnet, typeof sepolia] = [mainnet, sepolia];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
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
