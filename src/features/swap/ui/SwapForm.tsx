"use client";

import { useConnection } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { formatUSD } from "@/lib/utils";
import { useSwapStore } from "../model/store";
import {
  useQuote,
  useSwapMutation,
  useNeedsApproval,
  useApprovalMutation,
  usePrices,
  useBalance,
} from "../hooks";
import { TokenInput } from "./TokenInput";
import { FlipButton } from "./FlipButton";
import { SwapButton, getButtonState } from "./SwapButton";
import { ErrorAlert } from "./ErrorAlert";
import { SettingsModal } from "./SettingsModal";
import { LivePrices } from "./LivePrices";
import { SwapDetails } from "./SwapDetails";

function calcUsdValue(
  amount: string | undefined,
  prices: Record<string, { usd: number }> | undefined,
  token: { id: string } | null
): string | undefined {
  if (!amount || !prices || !token) return undefined;
  const num = parseFloat(amount);
  if (isNaN(num) || num === 0) return undefined;
  const price = prices[token.id]?.usd;
  return price ? formatUSD(num * price) : undefined;
}

export function SwapForm() {
  const { isConnected } = useConnection();
  const { open: openWallet } = useAppKit();

  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    inputMode,
    slippage,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    flipTokens,
  } = useSwapStore();

  const { data: prices, isLoading: pricesLoading } = usePrices();
  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuote();
  const { data: needsApproval = false } = useNeedsApproval();
  const fromBalance = useBalance(fromToken);
  const toBalance = useBalance(toToken);

  const swapMutation = useSwapMutation();
  const approvalMutation = useApprovalMutation();

  // Compute displayed amounts based on inputMode
  const displayFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? fromAmount);
  const displayToAmount = inputMode === "to" ? toAmount : (quote?.amountOut ?? toAmount);
  
  const hasTokens = !!fromToken && !!toToken;
  const activeAmount = inputMode === "from" ? fromAmount : toAmount;
  const hasAmount = !!activeAmount && parseFloat(activeAmount) > 0;
  const effectiveFromAmount = inputMode === "from" ? fromAmount : (quote?.amountIn ?? "0");
  const hasSufficientBalance =
    fromBalance !== undefined && parseFloat(effectiveFromAmount || "0") <= fromBalance;
  const isLoading =
    swapMutation.isPending || approvalMutation.isPending || quoteLoading;

  // Native ETH doesn't need approval
  const actualNeedsApproval = needsApproval && fromToken?.address !== null;

  const buttonState = getButtonState({
    isConnected,
    hasTokens,
    hasAmount,
    hasSufficientBalance,
    needsApproval: actualNeedsApproval,
    isLoading,
  });

  const isButtonDisabled =
    isLoading ||
    (isConnected &&
      (pricesLoading ||
        !hasTokens ||
        !hasAmount ||
        !hasSufficientBalance ||
        (actualNeedsApproval && buttonState !== "approve")));

  const error =
    swapMutation.error?.message ||
    approvalMutation.error?.message ||
    (quoteError instanceof Error
      ? quoteError.message
      : quoteError
      ? String(quoteError)
      : null);

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Swap</h2>
        <SettingsModal />
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl">
        <div className="rounded-2xl bg-card p-4">
          <TokenInput
            label="You pay"
            amount={displayFromAmount}
            token={fromToken}
            disabledToken={toToken}
            balance={fromBalance}
            usdValue={calcUsdValue(displayFromAmount, prices, fromToken)}
            prices={prices}
            isLoading={inputMode === "to" && quoteLoading && hasAmount}
            onAmountChange={setFromAmount}
            onTokenSelect={setFromToken}
          />

          <FlipButton onClick={flipTokens} />

          <div className="mt-1">
            <TokenInput
              label="You receive"
              amount={displayToAmount}
              token={toToken}
              disabledToken={fromToken}
              balance={toBalance}
              usdValue={calcUsdValue(displayToAmount, prices, toToken)}
              prices={prices}
              isLoading={inputMode === "from" && quoteLoading && hasAmount}
              onAmountChange={setToAmount}
              onTokenSelect={setToToken}
            />
          </div>

          {fromToken && toToken && prices && displayToAmount && displayFromAmount && (
            <SwapDetails
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={displayFromAmount}
              toAmount={displayToAmount}
              prices={prices}
              slippage={slippage}
            />
          )}

          {error && <ErrorAlert message={error} />}

          <SwapButton
            state={buttonState}
            tokenSymbol={fromToken?.symbol}
            disabled={isButtonDisabled}
            onConnect={() => openWallet()}
            onApprove={() => approvalMutation.mutate()}
            onSwap={() => swapMutation.mutate()}
          />
        </div>
      </div>

      {fromToken && toToken && prices && (
        <LivePrices fromToken={fromToken} toToken={toToken} prices={prices} />
      )}
    </div>
  );
}
