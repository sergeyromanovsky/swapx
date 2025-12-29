"use client";

import { Loader2 } from "lucide-react";
import type { Token, PriceData } from "../model/types";
import { TokenSelector } from "./TokenSelector";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

function AmountInput({ value, onChange }: AmountInputProps) {
  const handleChange = (newValue: string) => {
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder="0"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
    />
  );
}

interface TokenInputProps {
  label: string;
  amount: string;
  token: Token | null;
  disabledToken: Token | null;
  balance?: number;
  usdValue?: string;
  prices?: PriceData;
  isLoading?: boolean;
  onAmountChange?: (value: string) => void;
  onTokenSelect: (token: Token) => void;
}

export function TokenInput({
  label,
  amount,
  token,
  disabledToken,
  balance,
  usdValue,
  prices,
  isLoading,
  onAmountChange,
  onTokenSelect,
}: TokenInputProps) {
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
        <div className="flex flex-1 items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : null}
          <AmountInput value={amount} onChange={onAmountChange ?? (() => {})} />
        </div>
        <TokenSelector
          selectedToken={token}
          disabledToken={disabledToken}
          prices={prices}
          label={label === "You receive" ? "Select token to receive" : "Select token to pay"}
          onSelect={onTokenSelect}
        />
      </div>

      {usdValue && <p className="mt-2 text-sm text-muted-foreground">≈ {usdValue}</p>}
    </div>
  );
}
