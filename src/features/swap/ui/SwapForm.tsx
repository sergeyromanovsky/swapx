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
    slippage,
    setFromToken,
    setToToken,
    setFromAmount,
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

  const toAmount = quote?.amountOut ?? "";
  const hasTokens = !!fromToken && !!toToken;
  const hasAmount = !!fromAmount && parseFloat(fromAmount) > 0;
  const hasSufficientBalance =
    fromBalance !== undefined && parseFloat(fromAmount || "0") <= fromBalance;
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
            amount={fromAmount}
            token={fromToken}
            disabledToken={toToken}
            balance={fromBalance}
            usdValue={calcUsdValue(fromAmount, prices, fromToken)}
            prices={prices}
            onAmountChange={setFromAmount}
            onTokenSelect={setFromToken}
          />

          <FlipButton onClick={flipTokens} />

          <div className="mt-1">
            <TokenInput
              label="You receive"
              amount={toAmount}
              token={toToken}
              disabledToken={fromToken}
              balance={toBalance}
              usdValue={calcUsdValue(toAmount, prices, toToken)}
              prices={prices}
              readOnly
              isLoading={quoteLoading && hasAmount}
              onTokenSelect={setToToken}
            />
          </div>

          {fromToken && toToken && prices && toAmount && (
            <SwapDetails
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={fromAmount}
              toAmount={toAmount}
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
