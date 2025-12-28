"use client";

import { formatUSD } from "@/lib/utils";
import type { Token, PriceData } from "../model/types";
import { TokenIcon } from "./TokenIcon";

interface LivePricesProps {
  fromToken: Token;
  toToken: Token;
  prices: PriceData;
}

export function LivePrices({ fromToken, toToken, prices }: LivePricesProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <TokenIcon token={fromToken} size="sm" />
        <span>{formatUSD(prices[fromToken.id]?.usd || 0)}</span>
      </div>
      <span className="text-muted-foreground/50">•</span>
      <div className="flex items-center gap-2">
        <TokenIcon token={toToken} size="sm" />
        <span>{formatUSD(prices[toToken.id]?.usd || 0)}</span>
      </div>
    </div>
  );
}
