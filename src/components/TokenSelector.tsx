"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TOKENS, type Token } from "@/lib/tokens"
import { cn, formatUSD } from "@/lib/utils"
import type { PriceData } from "@/lib/prices"

interface TokenSelectorProps {
  selectedToken: Token | null
  onSelect: (token: Token) => void
  prices?: PriceData
  disabledToken?: Token | null
  label?: string
}

export function TokenSelector({
  selectedToken,
  onSelect,
  prices,
  disabledToken,
  label,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredTokens = TOKENS.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (token: Token) => {
    onSelect(token)
    setOpen(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto gap-2 rounded-xl px-3 py-2 hover:bg-accent/50",
            selectedToken ? "pr-2" : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {selectedToken ? (
            <>
              <div className="relative h-7 w-7 overflow-hidden rounded-full">
                <Image
                  src={selectedToken.icon}
                  alt={selectedToken.symbol}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
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
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle>{label || "Select a token"}</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
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

        {/* Popular tokens */}
        <div className="border-b border-border p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular tokens
          </p>
          <div className="flex flex-wrap gap-2">
            {TOKENS.slice(0, 6).map((token) => (
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
                <div className="relative h-5 w-5 overflow-hidden rounded-full">
                  <Image
                    src={token.icon}
                    alt={token.symbol}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {token.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Token list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredTokens.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tokens found
            </div>
          ) : (
            filteredTokens.map((token) => {
              const price = prices?.[token.id]
              const isDisabled = token.id === disabledToken?.id
              const isSelected = token.id === selectedToken?.id

              return (
                <button
                  key={token.id}
                  onClick={() => handleSelect(token)}
                  disabled={isDisabled}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-accent",
                    isSelected && "bg-primary/10",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={token.icon}
                        alt={token.symbol}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
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
                          price.usd_24h_change >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        )}
                      >
                        {price.usd_24h_change >= 0 ? "+" : ""}
                        {price.usd_24h_change.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
