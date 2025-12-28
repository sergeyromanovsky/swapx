"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useSwapStore } from "../model/store";
import { getQuote } from "../api/getQuote";

export function useQuote() {
  const publicClient = usePublicClient();
  const { fromToken, toToken, fromAmount } = useSwapStore();

  const enabled =
    !!publicClient && !!fromToken && !!toToken && !!fromAmount && parseFloat(fromAmount) > 0;

  return useQuery({
    queryKey: ["quote", fromToken?.id, toToken?.id, fromAmount],
    queryFn: () =>
      getQuote({
        fromToken: fromToken!,
        toToken: toToken!,
        amount: fromAmount,
        publicClient: publicClient!,
      }),
    enabled,
    staleTime: 10_000,
    refetchInterval: enabled ? 15_000 : false,
    retry: 1,
  });
}
