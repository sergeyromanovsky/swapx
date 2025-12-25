"use client";

import { TOKENS } from "./tokens";

// =============================================================================
// TYPES
// =============================================================================

export interface PriceData {
  [tokenId: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// =============================================================================
// FETCH PRICES
// =============================================================================

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function fetchPrices(): Promise<PriceData> {
  const ids = TOKENS.map((t) => t.coingeckoId).join(",");

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) throw new Error("Failed to fetch prices");

    const data = await response.json();

    const priceData: PriceData = {};
    for (const token of TOKENS) {
      const coinData = data[token.coingeckoId];
      if (coinData) {
        priceData[token.id] = {
          usd: coinData.usd,
          usd_24h_change: coinData.usd_24h_change || 0,
        };
      }
    }

    return priceData;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return getMockPrices();
  }
}

// =============================================================================
// MOCK DATA (fallback)
// =============================================================================

export function getMockPrices(): PriceData {
  return {
    eth: { usd: 3450, usd_24h_change: 2.5 },
    usdc: { usd: 1.0, usd_24h_change: 0.01 },
    usdt: { usd: 1.0, usd_24h_change: -0.02 },
    dai: { usd: 1.0, usd_24h_change: 0.0 },
    weth: { usd: 3450, usd_24h_change: 2.5 },
    link: { usd: 23.5, usd_24h_change: 1.9 },
    uni: { usd: 12.3, usd_24h_change: -0.5 },
  };
}
