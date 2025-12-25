"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowDownUp,
  Info,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Fuel,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "./TokenSelector";
import { SettingsModal } from "./SettingsModal";
import { TransactionHistory } from "./TransactionHistory";
import { cn, formatUSD } from "@/lib/utils";
import { usePrices } from "@/hooks/usePrices";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAppKit } from "@reown/appkit/react";

export function SwapCard() {
  const {
    data: prices,
    isLoading: pricesLoading,
    isError: pricesError,
  } = usePrices();

  const {
    state,
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
  } = useSwap(prices);

  const { open } = useAppKit();
  const [showDetails, setShowDetails] = useState(false);

  // Get real balances
  const fromBalance = useTokenBalance(state.fromToken?.id);
  const toBalance = useTokenBalance(state.toToken?.id);

  const handleInputChange = (value: string) => {
    // Only allow valid number input
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      open();
      return;
    }
    await executeSwap();
  };

  const handleApproveClick = async () => {
    await handleApprove();
  };

  const isSwapDisabled =
    !state.fromToken ||
    !state.toToken ||
    !state.fromAmount ||
    parseFloat(state.fromAmount) <= 0 ||
    state.isLoading ||
    pricesLoading;

  // Determine button text and action
  const getButtonContent = () => {
    if (state.isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {state.needsApproval ? "Approving..." : "Swapping..."}
        </>
      );
    }

    if (!isConnected) {
      return (
        <>
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </>
      );
    }

    if (!state.fromToken || !state.toToken) {
      return "Select tokens";
    }

    if (!state.fromAmount || parseFloat(state.fromAmount) <= 0) {
      return "Enter amount";
    }

    if (state.needsApproval && state.fromToken.id !== "eth") {
      return (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Approve {state.fromToken.symbol}
        </>
      );
    }

    return "Swap";
  };

  return (
    <div className="w-full max-w-md">
      {/* Card Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Swap</h2>
        <div className="flex items-center gap-1">
          <TransactionHistory transactions={transactions} />
          <SettingsModal
            slippage={state.slippage}
            onSlippageChange={setSlippage}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="gradient-border overflow-hidden rounded-2xl">
        <div className="rounded-2xl bg-card p-4">
          {/* From Token Input */}
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You pay</span>
              {state.fromToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {fromBalance?.toFixed(4) ?? "0.00"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={state.fromAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
              />
              <TokenSelector
                selectedToken={state.fromToken}
                onSelect={setFromToken}
                prices={prices}
                disabledToken={state.toToken}
                label="Select token to pay"
              />
            </div>
            {state.fromToken &&
              prices?.[state.fromToken.id] &&
              state.fromAmount && (
                <p className="mt-2 text-sm text-muted-foreground">
                  ≈{" "}
                  {formatUSD(
                    parseFloat(state.fromAmount || "0") *
                      prices[state.fromToken.id].usd
                  )}
                </p>
              )}
          </div>

          {/* Swap Button */}
          <div className="relative z-10 flex h-0 items-center justify-center">
            <button
              onClick={swapTokens}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border-4 border-card bg-secondary transition-all hover:bg-accent hover:scale-110"
            >
              <ArrowDownUp className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
          </div>

          {/* To Token Input */}
          <div className="mt-1 rounded-xl bg-secondary/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">You receive</span>
              {state.toToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {toBalance?.toFixed(4) ?? "0.00"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {pricesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-xl text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-3xl font-medium",
                      !swapDetails && "text-muted-foreground/50"
                    )}
                  >
                    {swapDetails ? swapDetails.outputAmount.toFixed(6) : "0"}
                  </span>
                )}
              </div>
              <TokenSelector
                selectedToken={state.toToken}
                onSelect={setToToken}
                prices={prices}
                disabledToken={state.fromToken}
                label="Select token to receive"
              />
            </div>
            {swapDetails && state.toToken && prices?.[state.toToken.id] && (
              <p className="mt-2 text-sm text-muted-foreground">
                ≈{" "}
                {formatUSD(
                  swapDetails.outputAmount * prices[state.toToken.id].usd
                )}
              </p>
            )}
          </div>

          {/* Swap Details */}
          {swapDetails && (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    1 {state.fromToken?.symbol} = {swapDetails.rate.toFixed(6)}{" "}
                    {state.toToken?.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    ~{formatUSD(swapDetails.gas.usd)}
                  </span>
                </div>
              </button>

              {showDetails && (
                <div className="mt-2 space-y-2 rounded-lg bg-secondary/30 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span
                      className={cn(
                        swapDetails.priceImpact > 3
                          ? "text-amber-400"
                          : "text-foreground"
                      )}
                    >
                      {swapDetails.priceImpact > 3 && (
                        <AlertTriangle className="mr-1 inline h-3 w-3" />
                      )}
                      {swapDetails.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Minimum received
                    </span>
                    <span>
                      {swapDetails.minimumReceived.toFixed(6)}{" "}
                      {state.toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        Slippage tolerance
                      </span>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span>{state.slippage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Network fee</span>
                    <span>
                      ~{swapDetails.gas.eth.toFixed(6)} ETH (
                      {formatUSD(swapDetails.gas.usd)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Error */}
          {pricesError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to fetch prices. Using cached data.</span>
            </div>
          )}

          {/* Error Message */}
          {state.swapError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="break-all">{state.swapError}</span>
            </div>
          )}

          {/* Approve Button (if needed) */}
          {isConnected &&
            state.needsApproval &&
            state.fromToken &&
            state.fromToken.id !== "eth" &&
            state.fromAmount && (
              <Button
                variant="outline"
                size="lg"
                className="mt-4 w-full text-base"
                disabled={state.isLoading}
                onClick={handleApproveClick}
              >
                {state.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Approve {state.fromToken.symbol}
                  </>
                )}
              </Button>
            )}

          {/* Swap Button */}
          <Button
            variant="glow"
            size="lg"
            className="mt-4 w-full text-base"
            disabled={
              isConnected ? isSwapDisabled || state.needsApproval : false
            }
            onClick={handleSwap}
          >
            {getButtonContent()}
          </Button>
        </div>
      </div>

      {/* Live Prices */}
      {state.fromToken && state.toToken && prices && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image
                src={state.fromToken.icon}
                alt={state.fromToken.symbol}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span>{formatUSD(prices[state.fromToken.id]?.usd || 0)}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image
                src={state.toToken.icon}
                alt={state.toToken.symbol}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span>{formatUSD(prices[state.toToken.id]?.usd || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
