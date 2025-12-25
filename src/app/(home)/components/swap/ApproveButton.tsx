"use client";

import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApproveButtonProps {
  tokenSymbol: string;
  isLoading: boolean;
  onClick: () => void;
}

export function ApproveButton({
  tokenSymbol,
  isLoading,
  onClick,
}: ApproveButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="mt-4 w-full text-base"
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Approving...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Approve {tokenSymbol}
        </>
      )}
    </Button>
  );
}

