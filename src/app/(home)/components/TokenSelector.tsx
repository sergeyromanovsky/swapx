"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TokenSelectorTrigger,
  TokenSearch,
  PopularTokens,
  TokenList,
} from "./token-selector";
import { TOKENS, type Token } from "@/lib/tokens";
import type { PriceData } from "@/lib/prices";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  prices?: PriceData;
  disabledToken?: Token | null;
  label?: string;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  prices,
  disabledToken,
  label,
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

        <TokenSearch value={search} onChange={setSearch} />

        <PopularTokens
          selectedToken={selectedToken}
          disabledToken={disabledToken}
          onSelect={handleSelect}
        />

        <div className="max-h-80 overflow-y-auto p-2">
          <TokenList
            tokens={filteredTokens}
            selectedToken={selectedToken}
            disabledToken={disabledToken}
            prices={prices}
            onSelect={handleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
