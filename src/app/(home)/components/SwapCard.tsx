"use client";

import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { TokenSelector } from "./TokenSelector";
import { cn, formatUSD } from "@/lib/utils";
import type { Token } from "@/lib/tokens";
import type { PriceData } from "@/lib/prices";
import type { SwapFormValues } from "@/providers/AppStateProvider";

export interface SwapCardProps {
  variant: "from" | "to";
  token: Token | null;
  onTokenSelect: (token: Token) => void;
  balance?: number;
  prices?: PriceData;
  disabledToken: Token | null;
  isLoading?: boolean;
}

export function SwapCard({
  variant,
  token,
  onTokenSelect,
  balance,
  prices,
  disabledToken,
  isLoading,
}: SwapCardProps) {
  const form = useFormContext<SwapFormValues>();
  const isFrom = variant === "from";
  const label = isFrom ? "You pay" : "You receive";
  const selectorLabel = isFrom ? "Select token to pay" : "Select token to receive";

  // Field names based on variant
  const fieldName = isFrom ? "fromAmount" : "toAmount";
  const amount = form.watch(fieldName);

  const handleInputChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      form.setValue(fieldName, value);
    }
  };

  const usdValue =
    token && prices?.[token.id] && amount
      ? formatUSD(parseFloat(amount || "0") * prices[token.id].usd)
      : null;

  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {token && (
          <span className="text-sm text-muted-foreground">
            Balance: {balance?.toFixed(4) ?? "0.00"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isFrom ? (
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
          />
        ) : (
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-xl text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <span
                className={cn(
                  "text-3xl font-medium",
                  !amount && "text-muted-foreground/50"
                )}
              >
                {amount || "0"}
              </span>
            )}
          </div>
        )}

        <TokenSelector
          selectedToken={token}
          onSelect={onTokenSelect}
          prices={prices}
          disabledToken={disabledToken}
          label={selectorLabel}
        />
      </div>

      {usdValue && (
        <p className="mt-2 text-sm text-muted-foreground">≈ {usdValue}</p>
      )}
    </div>
  );
}
