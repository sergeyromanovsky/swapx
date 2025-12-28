"use client";

import { Loader2, Wallet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ButtonState =
  | "loading"
  | "not-connected"
  | "select-tokens"
  | "enter-amount"
  | "insufficient-balance"
  | "approve"
  | "swap";

interface SwapButtonProps {
  state: ButtonState;
  tokenSymbol?: string;
  disabled: boolean;
  onConnect: () => void;
  onApprove: () => void;
  onSwap: () => void;
}

export function SwapButton({
  state,
  tokenSymbol,
  disabled,
  onConnect,
  onApprove,
  onSwap,
}: SwapButtonProps) {
  const content = {
    loading: (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Processing...
      </>
    ),
    "not-connected": (
      <>
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </>
    ),
    "select-tokens": "Select tokens",
    "enter-amount": "Enter amount",
    "insufficient-balance": "Insufficient balance",
    approve: (
      <>
        <CheckCircle className="mr-2 h-5 w-5" />
        Approve {tokenSymbol}
      </>
    ),
    swap: "Swap",
  };

  const handleClick = () => {
    if (state === "not-connected") onConnect();
    else if (state === "approve") onApprove();
    else if (state === "swap") onSwap();
  };

  return (
    <Button
      variant="glow"
      size="lg"
      className="mt-4 w-full text-base"
      disabled={disabled}
      onClick={handleClick}
    >
      {content[state]}
    </Button>
  );
}

interface GetButtonStateParams {
  isConnected: boolean;
  hasTokens: boolean;
  hasAmount: boolean;
  hasSufficientBalance: boolean;
  needsApproval: boolean;
  isLoading: boolean;
}

export function getButtonState({
  isConnected,
  hasTokens,
  hasAmount,
  hasSufficientBalance,
  needsApproval,
  isLoading,
}: GetButtonStateParams): ButtonState {
  if (isLoading) return "loading";
  if (!isConnected) return "not-connected";
  if (!hasTokens) return "select-tokens";
  if (!hasAmount) return "enter-amount";
  if (!hasSufficientBalance) return "insufficient-balance";
  if (needsApproval) return "approve";
  return "swap";
}
