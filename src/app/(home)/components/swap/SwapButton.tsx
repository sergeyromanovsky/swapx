"use client";

import { Loader2, Wallet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwapButtonProps {
  isLoading: boolean;
  isConnected: boolean;
  needsApproval: boolean;
  hasTokens: boolean;
  hasAmount: boolean;
  fromTokenSymbol?: string;
  disabled: boolean;
  onClick: () => void;
}

export function SwapButton({
  isLoading,
  isConnected,
  needsApproval,
  hasTokens,
  hasAmount,
  fromTokenSymbol,
  disabled,
  onClick,
}: SwapButtonProps) {
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {needsApproval ? "Approving..." : "Swapping..."}
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

    if (!hasTokens) {
      return "Select tokens";
    }

    if (!hasAmount) {
      return "Enter amount";
    }

    if (needsApproval && fromTokenSymbol) {
      return (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Approve {fromTokenSymbol}
        </>
      );
    }

    return "Swap";
  };

  return (
    <Button
      variant="glow"
      size="lg"
      className="mt-4 w-full text-base"
      disabled={disabled}
      onClick={onClick}
    >
      {getButtonContent()}
    </Button>
  );
}

