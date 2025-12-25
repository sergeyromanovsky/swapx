"use client"

import Image from "next/image"
import { History, ExternalLink, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { SwapTransaction } from "@/hooks/useSwap"
import { cn, shortenAddress } from "@/lib/utils"

interface TransactionHistoryProps {
  transactions: SwapTransaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      variant: "warning" as const,
      label: "Pending",
    },
    completed: {
      icon: CheckCircle2,
      variant: "success" as const,
      label: "Completed",
    },
    failed: {
      icon: XCircle,
      variant: "destructive" as const,
      label: "Failed",
    },
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <History className="h-5 w-5" />
          {transactions.some((t) => t.status === "pending") && (
            <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70">
                Your swap history will appear here
              </p>
            </div>
          ) : (
            transactions.map((tx) => {
              const status = statusConfig[tx.status]
              const StatusIcon = status.icon

              return (
                <div
                  key={tx.id}
                  className={cn(
                    "rounded-xl border border-border p-4 transition-colors hover:bg-accent/50",
                    tx.status === "pending" && "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* From Token */}
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={tx.fromToken.icon}
                          alt={tx.fromToken.symbol}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.fromAmount.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.fromToken.symbol}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    {/* To Token */}
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={tx.toToken.icon}
                          alt={tx.toToken.symbol}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.toAmount.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.toToken.symbol}
                        </p>
                      </div>
                    </div>
                  </div>

                  {tx.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <span>{shortenAddress(tx.txHash, 8)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
