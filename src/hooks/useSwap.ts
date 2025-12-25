"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { CommandType, RoutePlanner } from "@uniswap/universal-router-sdk";
import {
  Token,
  getTokenById,
  getV4TokenAddress,
  getFeeTier,
  sortCurrencies,
  isZeroForOne,
  UNISWAP_V4,
  TICK_SPACING,
  UNIVERSAL_ROUTER_ABI,
  QUOTER_V4_ABI,
} from "@/lib/tokens";

// =============================================================================
// TYPES
// =============================================================================

export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  error: string | null;
}

export interface SwapDetails {
  outputAmount: number;
  rate: number;
  minimumReceived: number;
  priceImpact: number;
  fee: number;
  gas: { eth: number; usd: number };
}

export interface SwapTransaction {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  txHash?: string;
}

// =============================================================================
// HOOK
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSwap(_prices?: any) {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<SwapState>({
    fromToken: getTokenById("eth") || null,
    toToken: getTokenById("usdc") || null,
    fromAmount: "",
    toAmount: "",
    slippage: 0.5,
    isLoading: false,
    error: null,
  });

  const [swapDetails, setSwapDetails] = useState<SwapDetails | null>(null);
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------------------------------------------------------------
  // Get Quote from Uniswap V4 Quoter
  // ---------------------------------------------------------------------------
  const getQuote = useCallback(
    async (amountIn: string): Promise<bigint | null> => {
      if (!publicClient || !state.fromToken || !state.toToken) return null;

      const tokenIn = getV4TokenAddress(state.fromToken);
      const tokenOut = getV4TokenAddress(state.toToken);
      const [currency0, currency1] = sortCurrencies(tokenIn, tokenOut);
      const zeroForOne = isZeroForOne(tokenIn, tokenOut);

      const fee = getFeeTier(state.fromToken, state.toToken);
      const tickSpacing = TICK_SPACING[fee as keyof typeof TICK_SPACING];

      try {
        const exactAmount = parseUnits(amountIn, state.fromToken.decimals);

        console.log("📊 V4 Quote request:", {
          currency0,
          currency1,
          fee,
          tickSpacing,
          zeroForOne,
          exactAmount: exactAmount.toString(),
        });

        const result = await publicClient.simulateContract({
          address: UNISWAP_V4.QUOTER,
          abi: QUOTER_V4_ABI,
          functionName: "quoteExactInputSingle",
          args: [
            {
              poolKey: {
                currency0,
                currency1,
                fee,
                tickSpacing,
                hooks: UNISWAP_V4.NATIVE_ETH,
              },
              zeroForOne,
              exactAmount,
              hookData: "0x",
            },
          ],
        });

        const [amountOut, gasEstimate] = result.result as [bigint, bigint];

        console.log("✅ V4 Quote result:", {
          amountOut: amountOut.toString(),
          gasEstimate: gasEstimate.toString(),
        });

        return amountOut;
      } catch (err) {
        console.error("❌ V4 Quote error:", err);
        return null;
      }
    },
    [publicClient, state.fromToken, state.toToken]
  );

  // ---------------------------------------------------------------------------
  // Fetch Quote on Input Change (debounced)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!state.fromAmount || !state.fromToken || !state.toToken) {
      setSwapDetails(null);
      setState((prev) => ({ ...prev, toAmount: "" }));
      return;
    }

    const amount = parseFloat(state.fromAmount);
    if (isNaN(amount) || amount <= 0) {
      setSwapDetails(null);
      setState((prev) => ({ ...prev, toAmount: "" }));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const amountOut = await getQuote(state.fromAmount);

      if (amountOut) {
        const outputAmount = parseFloat(
          formatUnits(amountOut, state.toToken!.decimals)
        );
        const rate = outputAmount / amount;
        const minimumReceived = outputAmount * (1 - state.slippage / 100);

        setSwapDetails({
          outputAmount,
          rate,
          minimumReceived,
          priceImpact: 0.05,
          fee: 0.0005 * amount,
          gas: { eth: 0.002, usd: 7 },
        });

        setState((prev) => ({
          ...prev,
          toAmount: outputAmount.toFixed(6),
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to get quote - pool may not exist",
        }));
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    state.fromAmount,
    state.fromToken,
    state.toToken,
    state.slippage,
    getQuote,
  ]);

  // ---------------------------------------------------------------------------
  // Execute Swap via Universal Router V4 (using official SDK)
  // ---------------------------------------------------------------------------
  const executeSwap = useCallback(async () => {
    if (!walletClient || !publicClient || !address || !swapDetails) {
      setState((prev) => ({ ...prev, error: "Wallet not connected" }));
      return false;
    }

    if (!state.fromToken || !state.toToken) {
      setState((prev) => ({ ...prev, error: "Select tokens" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const tx: SwapTransaction = {
      id: crypto.randomUUID(),
      fromToken: state.fromToken,
      toToken: state.toToken,
      fromAmount: parseFloat(state.fromAmount),
      toAmount: swapDetails.outputAmount,
      timestamp: new Date(),
      status: "pending",
    };

    setTransactions((prev) => [tx, ...prev]);

    try {
      const tokenIn = getV4TokenAddress(state.fromToken);
      const tokenOut = getV4TokenAddress(state.toToken);
      const [currency0, currency1] = sortCurrencies(tokenIn, tokenOut);
      const zeroForOne = isZeroForOne(tokenIn, tokenOut);
      const isNativeETH = state.fromToken.address === null;

      const fee = getFeeTier(state.fromToken, state.toToken);
      const tickSpacing = TICK_SPACING[fee as keyof typeof TICK_SPACING];

      const amountIn = parseUnits(state.fromAmount, state.fromToken.decimals);
      const amountOutMin = parseUnits(
        swapDetails.minimumReceived.toFixed(state.toToken.decimals),
        state.toToken.decimals
      );

      console.log("🚀 V4 Swap executing with SDK:", {
        currency0,
        currency1,
        zeroForOne,
        amountIn: amountIn.toString(),
        amountOutMin: amountOutMin.toString(),
        isNativeETH,
      });

      // Build swap config for SDK
      const swapConfig = {
        poolKey: {
          currency0,
          currency1,
          fee,
          tickSpacing,
          hooks: UNISWAP_V4.NATIVE_ETH,
        },
        zeroForOne,
        amountIn: amountIn.toString(),
        amountOutMinimum: amountOutMin.toString(),
        hookData: "0x",
      };

      // Use V4Planner from @uniswap/v4-sdk
      const v4Planner = new V4Planner();

      // Add actions
      v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapConfig]);
      v4Planner.addAction(Actions.SETTLE_ALL, [
        zeroForOne ? currency0 : currency1,
        amountIn.toString(),
      ]);
      v4Planner.addAction(Actions.TAKE_ALL, [
        zeroForOne ? currency1 : currency0,
        amountOutMin.toString(),
      ]);

      // Finalize V4 actions
      const v4Actions = v4Planner.finalize();

      // Use RoutePlanner from @uniswap/universal-router-sdk
      const routePlanner = new RoutePlanner();
      routePlanner.addCommand(CommandType.V4_SWAP, [
        v4Planner.actions,
        v4Planner.params,
      ]);

      // Deadline: 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      console.log("📦 Encoded commands:", {
        commands: routePlanner.commands,
        inputs: [v4Actions],
      });

      const hash = await walletClient.writeContract({
        address: UNISWAP_V4.UNIVERSAL_ROUTER,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: "execute",
        args: [
          routePlanner.commands as `0x${string}`,
          [v4Actions] as `0x${string}`[],
          deadline,
        ],
        value: isNativeETH ? amountIn : 0n,
      });

      console.log("📝 V4 Transaction sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ V4 Transaction confirmed:", receipt.status);

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === tx.id
            ? {
                ...t,
                status: receipt.status === "success" ? "completed" : "failed",
                txHash: hash,
              }
            : t
        )
      );

      if (receipt.status === "success") {
        setState((prev) => ({
          ...prev,
          fromAmount: "",
          toAmount: "",
          isLoading: false,
        }));
        setSwapDetails(null);
        return true;
      }

      return false;
    } catch (err) {
      console.error("❌ V4 Swap error:", err);

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "failed" } : t))
      );

      const errorMsg =
        err instanceof Error
          ? err.message.includes("user rejected")
            ? "Transaction rejected"
            : err.message.slice(0, 100)
          : "Swap failed";

      setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
      return false;
    }
  }, [walletClient, publicClient, address, state, swapDetails]);

  // ---------------------------------------------------------------------------
  // Token Setters
  // ---------------------------------------------------------------------------
  const setFromToken = useCallback((token: Token | null) => {
    setState((prev) => {
      if (token && prev.toToken?.id === token.id) {
        return { ...prev, fromToken: token, toToken: prev.fromToken };
      }
      return { ...prev, fromToken: token, toAmount: "" };
    });
    setSwapDetails(null);
  }, []);

  const setToToken = useCallback((token: Token | null) => {
    setState((prev) => {
      if (token && prev.fromToken?.id === token.id) {
        return { ...prev, toToken: token, fromToken: prev.toToken };
      }
      return { ...prev, toToken: token, toAmount: "" };
    });
    setSwapDetails(null);
  }, []);

  const setFromAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, fromAmount: amount }));
  }, []);

  const setSlippage = useCallback((slippage: number) => {
    setState((prev) => ({ ...prev, slippage }));
  }, []);

  const swapTokens = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
    setSwapDetails(null);
  }, []);

  // Stub for compatibility (ETH doesn't need approval)
  const handleApprove = useCallback(async () => true, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    state: { ...state, needsApproval: false, swapError: state.error },
    swapDetails,
    transactions,
    setFromToken,
    setToToken,
    setFromAmount,
    setSlippage,
    swapTokens,
    executeSwap,
    handleApprove,
    isConnected,
  };
}
