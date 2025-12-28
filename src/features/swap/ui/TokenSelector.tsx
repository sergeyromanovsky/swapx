"use client";

import { useState, useMemo, forwardRef, type ComponentPropsWithoutRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatUSD } from "@/lib/utils";
import { TOKENS, POPULAR_TOKEN_IDS } from "../model/tokens";
import type { Token, PriceData, TokenPrice } from "../model/types";
import { TokenIcon } from "./TokenIcon";

interface TokenSelectorTriggerProps extends ComponentPropsWithoutRef<typeof Button> {
  selectedToken: Token | null;
}

const TokenSelectorTrigger = forwardRef<HTMLButtonElement, TokenSelectorTriggerProps>(
  ({ selectedToken, className, ...props }, ref) => {
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
  }
);
TokenSelectorTrigger.displayName = "TokenSelectorTrigger";

interface TokenListItemProps {
  token: Token;
  price?: TokenPrice;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

function TokenListItem({
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

interface TokenSelectorProps {
  selectedToken: Token | null;
  disabledToken?: Token | null;
  prices?: PriceData;
  label?: string;
  onSelect: (token: Token) => void;
}

export function TokenSelector({
  selectedToken,
  disabledToken,
  prices,
  label,
  onSelect,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(
    () =>
      TOKENS.filter(
        (token) =>
          token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          token.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const popularTokens = useMemo(
    () => TOKENS.filter((t) => POPULAR_TOKEN_IDS.includes(t.id)),
    []
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TokenSelectorTrigger selectedToken={selectedToken} />
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle>{label || "Select a token"}</DialogTitle>
        </DialogHeader>

        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-border p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular tokens
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleSelect(token)}
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

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredTokens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((token) => (
              <TokenListItem
                key={token.id}
                token={token}
                price={prices?.[token.id]}
                isSelected={token.id === selectedToken?.id}
                isDisabled={token.id === disabledToken?.id}
                onSelect={() => handleSelect(token)}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
