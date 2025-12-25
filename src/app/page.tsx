"use client";

import { Header } from "@/components/Header";
import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Background decorations */}
        <div className="pointer-events-none abs`zolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-3xl" />
        </div>

        {/* Hero section */}
        <div className="relative mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Swap Instantly
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Trade tokens with the best rates across decentralized exchanges
          </p>
        </div>

        {/* Swap Card */}
        <div className="relative z-10">
          <SwapCard />
        </div>

        {/* Stats Section */}
        <div className="relative mt-16 grid grid-cols-3 gap-8 text-center sm:gap-16">
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">
              $2.4B+
            </p>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">
              150K+
            </p>
            <p className="text-sm text-muted-foreground">Total Trades</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">
              12+
            </p>
            <p className="text-sm text-muted-foreground">Supported Tokens</p>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>Powered by decentralized liquidity</p>
      </footer>
    </div>
  );
}
