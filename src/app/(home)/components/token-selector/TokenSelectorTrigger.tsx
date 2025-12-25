"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenIcon } from "@/components/TokenIcon";
import { cn } from "@/lib/utils";
import type { Token } from "@/lib/tokens";

interface TokenSelectorTriggerProps
  extends ComponentPropsWithoutRef<typeof Button> {
  selectedToken: Token | null;
}

export const TokenSelectorTrigger = forwardRef<
  HTMLButtonElement,
  TokenSelectorTriggerProps
>(({ selectedToken, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "h-auto gap-2 rounded-xl px-3 py-2 hover:bg-accent/50",
        selectedToken
          ? "pr-2"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      {...props}
    >
      {selectedToken ? (
        <>
          <TokenIcon token={selectedToken} size="md" />
          <span className="font-semibold">{selectedToken.symbol}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </>
      ) : (
        <>
          <span className="font-semibold">Select token</span>
          <ChevronDown className="h-4 w-4" />
        </>
      )}
    </Button>
  );
});

TokenSelectorTrigger.displayName = "TokenSelectorTrigger";
