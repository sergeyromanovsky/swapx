"use client";

import { TokenIcon } from "@/components/TokenIcon";
import { cn, formatUSD } from "@/lib/utils";
import type { Token } from "@/lib/tokens";

interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

interface TokenListItemProps {
  token: Token;
  price?: TokenPrice;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

export function TokenListItem({
  token,
  price,
  isSelected,
  isDisabled,
  onSelect,
}: TokenListItemProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "flex w-full items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-accent",
        isSelected && "bg-primary/10",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex items-center gap-3">
        <TokenIcon token={token} size="lg" />
        <div>
          <p className="font-semibold">{token.symbol}</p>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
      </div>
      {price && (
        <div className="text-right">
          <p className="font-medium">{formatUSD(price.usd)}</p>
          <p
            className={cn(
              "text-sm",
              price.usd_24h_change >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {price.usd_24h_change >= 0 ? "+" : ""}
            {price.usd_24h_change.toFixed(2)}%
          </p>
        </div>
      )}
    </button>
  );
}
