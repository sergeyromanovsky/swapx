"use client";
import {
  Wallet,
  ChevronDown,
  Zap,
  ExternalLink,
  Copy,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { shortenAddress, formatTokenAmount } from "@/lib/utils";
import { useConnection, useBalance, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { formatEther } from "viem";

export function Header() {
  const { isConnected, address } = useConnection();

  const { data: balance } = useBalance({ address });

  const { mutateAsync: disconnect } = useDisconnect();
  const { open: openModal } = useAppKit();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-purple-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight glow-text">
              SwapX
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Swap
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Pools
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Portfolio
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">Ethereum</span>
            </div>

            {isConnected ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-border/50 bg-secondary/50 hover:bg-secondary"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                      <span className="text-xs font-bold text-black">
                        {address?.charAt(2).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline">
                      {shortenAddress(address as `0x${string}`)}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end">
                  <div className="border-b border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
                        <span className="text-lg font-bold text-black">
                          {address?.charAt(2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {shortenAddress(address, 6)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {balance &&
                            formatTokenAmount(
                              formatEther(balance.value),
                              4
                            )}{" "}
                          {balance?.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(address as `0x${string}`)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Copy className="h-4 w-4" />
                      Copy address
                    </button>
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Explorer
                    </a>
                    <button
                      onClick={() => disconnect()}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="glow"
                onClick={() => openModal()}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
