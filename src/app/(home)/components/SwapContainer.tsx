"use client";

import { useFormContext } from "react-hook-form";
import { useAppKit } from "@reown/appkit/react";
import { SwapCard } from "./SwapCard";
import {
  SwapHeader,
  SwapDirectionButton,
  ErrorAlert,
  SwapButton,
  ApproveButton,
  LivePrices,
} from "./swap";

import { usePrices } from "@/hooks/usePrices";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAppState, type SwapFormValues } from "@/providers/AppStateProvider";

export function SwapContainer() {
  const {
    data: prices,
    isLoading: pricesLoading,
    isError: pricesError,
  } = usePrices();

  // App state
  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    isLoading,
    error: swapError,
    needsApproval,
  } = useAppState();

  // Form context
  const form = useFormContext<SwapFormValues>();
  const fromAmount = form.watch("fromAmount");

  // SDK operations
  const { executeSwap, handleApprove, isConnected } = useSwap();

  const { open } = useAppKit();

  // Get real balances
  const fromBalance = useTokenBalance(fromToken?.id);
  const toBalance = useTokenBalance(toToken?.id);

  const handleSwap = async () => {
    if (!isConnected) {
      open();
      return;
    }
    await executeSwap();
  };

  const isSwapDisabled =
    !fromToken ||
    !toToken ||
    !fromAmount ||
    parseFloat(fromAmount) <= 0 ||
    isLoading ||
    pricesLoading;

  const showApproveButton =
    isConnected &&
    needsApproval &&
    fromToken &&
    fromToken.id !== "eth" &&
    fromAmount;

  return (
    <div className="w-full max-w-md">
      <SwapHeader />
      <div className="gradient-border overflow-hidden rounded-2xl">
        <div className="rounded-2xl bg-card p-4">
          <SwapCard
            variant="from"
            token={fromToken}
            onTokenSelect={setFromToken}
            balance={fromBalance ?? undefined}
            prices={prices}
            disabledToken={toToken}
          />
          <SwapDirectionButton onClick={swapTokens} />
          <div className="mt-1">
            <SwapCard
              variant="to"
              token={toToken}
              onTokenSelect={setToToken}
              balance={toBalance ?? undefined}
              prices={prices}
              disabledToken={fromToken}
              isLoading={pricesLoading || isLoading}
            />
          </div>
          {pricesError && (
            <ErrorAlert message="Failed to fetch prices. Using cached data." />
          )}
          {swapError && <ErrorAlert message={swapError} />}
          {showApproveButton && (
            <ApproveButton
              tokenSymbol={fromToken.symbol}
              isLoading={isLoading}
              onClick={handleApprove}
            />
          )}
          <SwapButton
            isLoading={isLoading}
            isConnected={isConnected}
            needsApproval={needsApproval && fromToken?.id !== "eth"}
            hasTokens={!!fromToken && !!toToken}
            hasAmount={!!fromAmount && parseFloat(fromAmount) > 0}
            fromTokenSymbol={fromToken?.symbol}
            disabled={isConnected ? isSwapDisabled || needsApproval : false}
            onClick={handleSwap}
          />
        </div>
      </div>
      {fromToken && toToken && prices && (
        <LivePrices fromToken={fromToken} toToken={toToken} prices={prices} />
      )}
    </div>
  );
}
