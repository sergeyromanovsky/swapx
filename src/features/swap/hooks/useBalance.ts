"use client";

import {
  useConnection,
  useBalance as useWagmiBalance,
  useReadContract,
} from "wagmi";
import { formatUnits, type Address } from "viem";
import { ERC20_ABI } from "../model/tokens";
import type { Token } from "../model/types";

export function useBalance(token: Token | null) {
  const { address } = useConnection();

  const { data: ethBalance } = useWagmiBalance({
    address,
    query: { enabled: !!address && token?.id === "eth" },
  });

  const { data: tokenBalance } = useReadContract({
    address: token?.address as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token?.address },
  });

  if (!token || !address) return undefined;

  if (token.id === "eth" && ethBalance) {
    return parseFloat(formatUnits(ethBalance.value, 18));
  }

  if (token.address && tokenBalance !== undefined) {
    return parseFloat(formatUnits(tokenBalance, token.decimals));
  }

  return undefined;
}
