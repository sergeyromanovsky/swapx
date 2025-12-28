import type { Token } from "./types";

export const TOKENS: Token[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    color: "#627EEA",
    coingeckoId: "ethereum",
    address: null,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    color: "#2775CA",
    coingeckoId: "usd-coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    color: "#26A17B",
    coingeckoId: "tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    id: "link",
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    color: "#2A5ADA",
    coingeckoId: "chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },
  {
    id: "uni",
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
    color: "#FF007A",
    coingeckoId: "uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
];

export const POPULAR_TOKEN_IDS = ["eth", "usdc", "usdt", "weth"];

export function getTokenById(id: string): Token | undefined {
  return TOKENS.find((t) => t.id === id);
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}

export const FEE_TIERS = {
  LOWEST: 100,
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
} as const;

const STABLECOINS = ["usdc", "usdt", "dai"];

export function getFeeTier(tokenA: Token, tokenB: Token): number {
  const aIsStable = STABLECOINS.includes(tokenA.id);
  const bIsStable = STABLECOINS.includes(tokenB.id);

  if (aIsStable && bIsStable) return FEE_TIERS.LOWEST;

  const aIsEth = tokenA.id === "eth" || tokenA.id === "weth";
  const bIsEth = tokenB.id === "eth" || tokenB.id === "weth";
  if ((aIsEth && bIsStable) || (bIsEth && aIsStable)) return FEE_TIERS.LOW;

  return FEE_TIERS.MEDIUM;
}

export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
