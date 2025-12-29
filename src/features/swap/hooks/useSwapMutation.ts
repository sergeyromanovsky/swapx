"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConnection, usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSwapStore } from "../model/store";
import { executeSwap } from "../api/executeSwap";
import { useQuote } from "./useQuote";

function fireConfetti() {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const end = Date.now() + 200;

  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);

    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ["#6366f1", "#8b5cf6", "#a855f7", "#22c55e"],
    });
  }, 50);
}

export function useSwapMutation() {
  const queryClient = useQueryClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: quote } = useQuote();

  const { fromToken, toToken, fromAmount, toAmount, inputMode, slippage, reset } = useSwapStore();

  // Use the actual calculated amount from quote when in exactOutput mode
  const effectiveFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? fromAmount);

  return useMutation({
    mutationKey: ["swap", fromToken?.id, toToken?.id, effectiveFromAmount],
    mutationFn: async () => {
      if (
        !publicClient ||
        !walletClient ||
        !address ||
        !fromToken ||
        !toToken
      ) {
        throw new Error("Missing required parameters");
      }

      const result = await executeSwap({
        fromToken,
        toToken,
        amount: effectiveFromAmount,
        slippage,
        address,
        publicClient,
        walletClient,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Swap failed");
      }

      return result;
    },
    onSuccess: (data) => {
      fireConfetti();

      const displayFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? fromAmount);
      const displayToAmount = inputMode === "to" ? toAmount : (quote?.amountOut ?? toAmount);

      toast.success("Swap successful!", {
        description: `Swapped ${displayFromAmount} ${fromToken?.symbol} for ${displayToAmount} ${toToken?.symbol}`,
        action: data.txHash
          ? {
              label: "View TX",
              onClick: () =>
                window.open(`https://etherscan.io/tx/${data.txHash}`, "_blank"),
            }
          : undefined,
      });

      reset();

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["quote"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
      toast.error("Swap failed", { description: message });
    },
  });
}
