"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePublicClient, useWalletClient, useConnection } from "wagmi";
import { toast } from "sonner";
import { useSwapStore } from "../model/store";
import { checkAllowance, approveToken, UNISWAP_V3 } from "../api";
import { useQuote } from "./useQuote";

/**
 * Hook to check if approval is needed for the current swap
 */
export function useNeedsApproval() {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { fromToken, fromAmount, inputMode } = useSwapStore();
  const { data: quote } = useQuote();

  // Use the actual calculated amount from quote when in exactOutput mode
  const effectiveFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? fromAmount);

  const enabled =
    !!publicClient &&
    !!address &&
    !!fromToken &&
    fromToken.address !== null && // Native ETH doesn't need approval
    !!effectiveFromAmount &&
    parseFloat(effectiveFromAmount) > 0;

  return useQuery({
    queryKey: ["allowance", fromToken?.id, effectiveFromAmount, address],
    queryFn: async () => {
      const hasSufficientAllowance = await checkAllowance({
        token: fromToken!,
        amount: effectiveFromAmount,
        ownerAddress: address!,
        spenderAddress: UNISWAP_V3.SWAP_ROUTER_02,
        publicClient: publicClient!,
      });
      return !hasSufficientAllowance; // Returns true if approval IS needed
    },
    enabled,
    staleTime: 30_000, // Cache for 30 seconds
  });
}

/**
 * Hook for approving token spending
 */
export function useApprovalMutation() {
  const queryClient = useQueryClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { fromToken, fromAmount, inputMode } = useSwapStore();
  const { data: quote } = useQuote();

  // Use the actual calculated amount from quote when in exactOutput mode
  const effectiveFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? fromAmount);

  return useMutation({
    mutationKey: ["approve", fromToken?.id],
    mutationFn: async () => {
      if (!publicClient || !walletClient || !fromToken || !fromToken.address) {
        throw new Error("Missing required parameters");
      }

      const approved = await approveToken({
        token: fromToken,
        spenderAddress: UNISWAP_V3.SWAP_ROUTER_02,
        publicClient,
        walletClient,
      });

      if (!approved) {
        throw new Error("Approval failed or rejected");
      }

      return approved;
    },
    onSuccess: () => {
      toast.success("Approval successful!", {
        description: `${fromToken?.symbol} is now approved for swapping`,
      });

      queryClient.invalidateQueries({
        queryKey: ["allowance", fromToken?.id, effectiveFromAmount, address],
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Approval failed";

      toast.error("Approval failed", {
        description: message,
      });
    },
  });
}
