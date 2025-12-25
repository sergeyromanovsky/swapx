"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, formatUnits, maxUint256, type Address } from "viem";
import { getFeeTier, ERC20_ABI, type Token } from "@/lib/tokens";
import { useAppState } from "@/providers/AppStateProvider";

// =============================================================================
// UNISWAP V3 CONTRACTS (Mainnet)
// =============================================================================

const UNISWAP_V3 = {
  SWAP_ROUTER_02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45" as Address,
  QUOTER_V2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e" as Address,
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
} as const;

// =============================================================================
// ABIs
// =============================================================================

const QUOTER_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// =============================================================================
// HELPERS
// =============================================================================

function getTokenAddress(token: Token): Address {
  // For native ETH, use WETH address in V3
  return token.address ?? UNISWAP_V3.WETH;
}

// =============================================================================
// HOOK
// =============================================================================

export function useSwap() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const {
    form,
    fromToken,
    toToken,
    isLoading,
    setIsLoading,
    setError,
    needsApproval,
    setNeedsApproval,
    resetForm,
  } = useAppState();

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Watch form values
  const fromAmount = form.watch("fromAmount");
  const slippage = form.watch("slippage");

  // ---------------------------------------------------------------------------
  // Get Quote from Uniswap V3 QuoterV2
  // ---------------------------------------------------------------------------
  const getQuote = useCallback(
    async (amountIn: string): Promise<bigint | null> => {
      if (!publicClient || !fromToken || !toToken) return null;

      const tokenIn = getTokenAddress(fromToken);
      const tokenOut = getTokenAddress(toToken);
      const fee = getFeeTier(fromToken, toToken);

      try {
        const exactAmount = parseUnits(amountIn, fromToken.decimals);

        console.log("📊 V3 Quote request:", {
          tokenIn,
          tokenOut,
          fee,
          amountIn: exactAmount.toString(),
        });

        const result = await publicClient.simulateContract({
          address: UNISWAP_V3.QUOTER_V2,
          abi: QUOTER_V2_ABI,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn,
              tokenOut,
              amountIn: exactAmount,
              fee,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });

        const [amountOut] = result.result as [bigint, bigint, number, bigint];

        console.log("✅ V3 Quote result:", {
          amountOut: amountOut.toString(),
        });

        return amountOut;
      } catch (err) {
        console.error("❌ V3 Quote error:", err);
        return null;
      }
    },
    [publicClient, fromToken, toToken]
  );

  // ---------------------------------------------------------------------------
  // Fetch Quote on Input Change (debounced)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!fromAmount || !fromToken || !toToken) {
      form.setValue("toAmount", "");
      return;
    }

    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) {
      form.setValue("toAmount", "");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const amountOut = await getQuote(fromAmount);

      if (amountOut) {
        const outputAmount = parseFloat(
          formatUnits(amountOut, toToken.decimals)
        );

        form.setValue("toAmount", outputAmount.toFixed(6));
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setError("Failed to get quote - pool may not exist");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    fromAmount,
    fromToken,
    toToken,
    slippage,
    getQuote,
    form,
    setIsLoading,
    setError,
  ]);

  // ---------------------------------------------------------------------------
  // Check and request ERC20 approval for SwapRouter02
  // ---------------------------------------------------------------------------
  const checkAndApprove = useCallback(async (): Promise<boolean> => {
    if (!walletClient || !publicClient || !address || !fromToken) {
      return false;
    }

    // Native ETH doesn't need approval
    if (fromToken.address === null) {
      return true;
    }

    const currentFromAmount = form.getValues("fromAmount");
    const amountIn = parseUnits(currentFromAmount, fromToken.decimals);

    try {
      // Check current allowance for SwapRouter02
      const allowance = await publicClient.readContract({
        address: fromToken.address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, UNISWAP_V3.SWAP_ROUTER_02],
      });

      console.log("📋 Current allowance:", allowance.toString());

      if (allowance >= amountIn) {
        return true;
      }

      console.log("🔓 Requesting approval for SwapRouter02...");

      // Request unlimited approval for SwapRouter02
      const approveHash = await walletClient.writeContract({
        address: fromToken.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [UNISWAP_V3.SWAP_ROUTER_02, maxUint256],
      });

      console.log("📝 Approval tx:", approveHash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: approveHash,
      });

      if (receipt.status === "success") {
        console.log("✅ Approval confirmed");
        return true;
      }

      return false;
    } catch (err) {
      console.error("❌ Approval error:", err);
      return false;
    }
  }, [walletClient, publicClient, address, fromToken, form]);

  // ---------------------------------------------------------------------------
  // Execute Swap via Uniswap V3 SwapRouter02
  // ---------------------------------------------------------------------------
  const executeSwap = useCallback(async () => {
    if (!walletClient || !publicClient || !address) {
      setError("Wallet not connected");
      return false;
    }

    if (!fromToken || !toToken) {
      setError("Select tokens");
      return false;
    }

    const currentFromAmount = form.getValues("fromAmount");
    const currentToAmount = form.getValues("toAmount");
    const currentSlippage = form.getValues("slippage");

    if (!currentToAmount || parseFloat(currentToAmount) <= 0) {
      setError("No quote available");
      return false;
    }

    const outputAmount = parseFloat(currentToAmount);
    const minimumReceived = outputAmount * (1 - currentSlippage / 100);

    setIsLoading(true);
    setError(null);

    try {
      // First check/request approval for ERC20 tokens
      if (fromToken.address !== null) {
        const approved = await checkAndApprove();
        if (!approved) {
          setError("Approval failed or rejected");
          setIsLoading(false);
          return false;
        }
      }

      const tokenIn = getTokenAddress(fromToken);
      const tokenOut = getTokenAddress(toToken);
      const isNativeETH = fromToken.address === null;
      const fee = getFeeTier(fromToken, toToken);

      const amountIn = parseUnits(currentFromAmount, fromToken.decimals);
      const amountOutMin = parseUnits(
        minimumReceived.toFixed(toToken.decimals),
        toToken.decimals
      );

      console.log("🚀 V3 Swap executing:", {
        tokenIn,
        tokenOut,
        fee,
        amountIn: amountIn.toString(),
        amountOutMin: amountOutMin.toString(),
        isNativeETH,
      });

      const hash = await walletClient.writeContract({
        address: UNISWAP_V3.SWAP_ROUTER_02,
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn,
            tokenOut,
            fee,
            recipient: address,
            amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n,
          },
        ],
        value: isNativeETH ? amountIn : 0n,
      });

      console.log("📝 Transaction sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transaction confirmed:", receipt.status);

      if (receipt.status === "success") {
        resetForm();
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err) {
      console.error("❌ Swap error:", err);

      const errorMsg =
        err instanceof Error
          ? err.message.includes("user rejected")
            ? "Transaction rejected"
            : err.message.includes("insufficient")
            ? "Insufficient balance or liquidity"
            : err.message.slice(0, 100)
          : "Swap failed";

      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  }, [
    walletClient,
    publicClient,
    address,
    fromToken,
    toToken,
    form,
    checkAndApprove,
    resetForm,
    setIsLoading,
    setError,
  ]);

  // Handle approval request from UI
  const handleApprove = useCallback(async () => {
    setIsLoading(true);
    const approved = await checkAndApprove();
    if (approved) {
      setNeedsApproval(false);
    }
    setIsLoading(false);
    return approved;
  }, [checkAndApprove, setNeedsApproval, setIsLoading]);

  return {
    getQuote,
    executeSwap,
    handleApprove,
    isConnected,
    isLoading,
    needsApproval,
  };
}
