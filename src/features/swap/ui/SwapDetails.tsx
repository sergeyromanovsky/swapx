"use client";

import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Token, PriceData } from "../model/types";

interface SwapDetailsProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  prices: PriceData;
  slippage: number;
}

export function SwapDetails({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  prices,
  slippage,
}: SwapDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fromNum = parseFloat(fromAmount) || 0;
  const toNum = parseFloat(toAmount) || 0;

  if (fromNum === 0 || toNum === 0) return null;

  const quoteRate = toNum / fromNum;

  const fromPrice = prices[fromToken.id]?.usd || 0;
  const toPrice = prices[toToken.id]?.usd || 0;
  const marketRate = toPrice > 0 ? fromPrice / toPrice : 0;

  const priceImpact = marketRate > 0 ? ((marketRate - quoteRate) / marketRate) * 100 : 0;
  const impactSeverity =
    Math.abs(priceImpact) > 5 ? "high" : Math.abs(priceImpact) > 1 ? "medium" : "low";

  const minReceived = toNum * (1 - slippage / 100);

  return (
    <div className="mt-3 rounded-lg bg-secondary/30 px-3 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm"
      >
        <span className="text-muted-foreground">
          1 {fromToken.symbol} = {quoteRate.toFixed(6)} {toToken.symbol}
        </span>
        <div className="flex items-center gap-2">
          {impactSeverity !== "low" && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                impactSeverity === "high" ? "text-destructive" : "text-warning"
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {Math.abs(priceImpact).toFixed(2)}%
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-border/50 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price Impact</span>
            <span
              className={cn(
                impactSeverity === "high"
                  ? "text-destructive"
                  : impactSeverity === "medium"
                    ? "text-warning"
                    : "text-success"
              )}
            >
              {priceImpact >= 0 ? "-" : "+"}
              {Math.abs(priceImpact).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min. Received</span>
            <span>
              {minReceived.toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slippage</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" />
              Ethereum
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
