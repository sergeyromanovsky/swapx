import type { Address } from "viem";

export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  color: string;
  coingeckoId: string;
  address: Address | null;
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

export type PriceData = Record<string, TokenPrice>;

export interface QuoteResult {
  amountOut: string;
  amountOutRaw: bigint;
}

export interface SwapParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}
