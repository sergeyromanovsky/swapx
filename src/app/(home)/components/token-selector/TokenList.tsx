"use client";

import { TokenListItem } from "./TokenListItem";
import type { Token } from "@/lib/tokens";
import type { PriceData } from "@/lib/prices";

interface TokenListProps {
  tokens: Token[];
  selectedToken: Token | null;
  disabledToken?: Token | null;
  prices?: PriceData;
  onSelect: (token: Token) => void;
}

export function TokenList({
  tokens,
  selectedToken,
  disabledToken,
  prices,
  onSelect,
}: TokenListProps) {
  if (tokens.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No tokens found
      </div>
    );
  }

  return (
    <>
      {tokens.map((token) => (
        <TokenListItem
          key={token.id}
          token={token}
          price={prices?.[token.id]}
          isSelected={token.id === selectedToken?.id}
          isDisabled={token.id === disabledToken?.id}
          onSelect={() => onSelect(token)}
        />
      ))}
    </>
  );
}
