"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits, type Address } from "viem";
import { getTokenById, ERC20_ABI } from "@/lib/tokens";

/**
 * Hook to get token balance for the connected wallet
 * Returns undefined if not connected or token not found
 */
export function useTokenBalance(tokenId: string | undefined) {
  const { address } = useAccount();
  const token = tokenId ? getTokenById(tokenId) : undefined;

  // For native ETH
  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: !!address && tokenId === "eth" },
  });

  // For ERC20 tokens
  const { data: tokenBalance } = useReadContract({
    address: token?.address as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token?.address },
  });

  if (!tokenId || !address) return undefined;

  if (tokenId === "eth" && ethBalance) {
    return parseFloat(formatUnits(ethBalance.value, 18));
  }

  if (token?.address && tokenBalance !== undefined) {
    return parseFloat(formatUnits(tokenBalance, token.decimals));
  }

  return undefined;
}
