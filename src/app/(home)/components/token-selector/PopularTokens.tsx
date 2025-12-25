"use client";

import { TokenIcon } from "@/components/TokenIcon";
import { cn } from "@/lib/utils";
import { TOKENS, type Token } from "@/lib/tokens";

interface PopularTokensProps {
  selectedToken: Token | null;
  disabledToken?: Token | null;
  onSelect: (token: Token) => void;
}

export function PopularTokens({
  selectedToken,
  disabledToken,
  onSelect,
}: PopularTokensProps) {
  return (
    <div className="border-b border-border p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Popular tokens
      </p>
      <div className="flex flex-wrap gap-2">
        {TOKENS.slice(0, 6).map((token) => (
          <button
            key={token.id}
            onClick={() => onSelect(token)}
            disabled={token.id === disabledToken?.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent",
              token.id === selectedToken?.id && "border-primary bg-primary/10",
              token.id === disabledToken?.id && "cursor-not-allowed opacity-50"
            )}
          >
            <TokenIcon token={token} size="xs" />
            {token.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
