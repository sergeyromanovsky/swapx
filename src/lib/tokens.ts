import { type Address } from "viem";

// =============================================================================
// TOKEN TYPES
// =============================================================================

export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  color: string;
  coingeckoId: string;
  /** Contract address (null for native ETH) */
  address: Address | null;
}

// =============================================================================
// SUPPORTED TOKENS
// =============================================================================

export const TOKENS: Token[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    color: "#627EEA",
    coingeckoId: "ethereum",
    address: null, // Native token
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
    id: "dai",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    color: "#F5AC37",
    coingeckoId: "dai",
    address: "0x6B175474E89094C44Da98b954EecscdDfF4c5d0",
  },
  {
    id: "weth",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    icon: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    color: "#627EEA",
    coingeckoId: "weth",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
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

// =============================================================================
// TOKEN HELPERS
// =============================================================================

export function getTokenById(id: string): Token | undefined {
  return TOKENS.find((t) => t.id === id);
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}

export function getTokenByAddress(address: Address): Token | undefined {
  return TOKENS.find(
    (t) => t.address?.toLowerCase() === address.toLowerCase()
  );
}

// =============================================================================
// UNISWAP V4 CONFIG (Mainnet addresses, work on Anvil fork)
// =============================================================================

export const UNISWAP_V4 = {
  UNIVERSAL_ROUTER: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af" as Address,
  QUOTER: "0x52f0e24d1c21c8a0cb1e5a5dd6198556bd9e1203" as Address,
  POOL_MANAGER: "0x000000000004444c5dc75cb358380d2e3de08a90" as Address,
  PERMIT2: "0x000000000022d473030f116ddee9f6b43ac78ba3" as Address,
  // For native ETH, V4 uses address(0)
  NATIVE_ETH: "0x0000000000000000000000000000000000000000" as Address,
} as const;

// Pool fee tiers (in hundredths of a bip, same as V3)
export const FEE_TIERS = {
  LOWEST: 100,   // 0.01%
  LOW: 500,      // 0.05% - best for ETH/stables
  MEDIUM: 3000,  // 0.30%
  HIGH: 10000,   // 1.00%
} as const;

// Tick spacing for each fee tier
export const TICK_SPACING = {
  [FEE_TIERS.LOWEST]: 1,
  [FEE_TIERS.LOW]: 10,
  [FEE_TIERS.MEDIUM]: 60,
  [FEE_TIERS.HIGH]: 200,
} as const;

// =============================================================================
// UNISWAP V4 ABIs
// =============================================================================

// Universal Router - execute function
export const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      { name: "commands", type: "bytes" },
      { name: "inputs", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Quoter V4 - quoteExactInputSingle
export const QUOTER_V4_ABI = [
  {
    inputs: [
      {
        components: [
          {
            components: [
              { name: "currency0", type: "address" },
              { name: "currency1", type: "address" },
              { name: "fee", type: "uint24" },
              { name: "tickSpacing", type: "int24" },
              { name: "hooks", type: "address" },
            ],
            name: "poolKey",
            type: "tuple",
          },
          { name: "zeroForOne", type: "bool" },
          { name: "exactAmount", type: "uint128" },
          { name: "hookData", type: "bytes" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC20 ABI for balances and approvals
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

// =============================================================================
// V4 HELPERS
// =============================================================================

const STABLECOINS = ["usdc", "usdt", "dai"];

/**
 * Get the best fee tier for a token pair
 */
export function getFeeTier(tokenA: Token, tokenB: Token): number {
  const aIsStable = STABLECOINS.includes(tokenA.id);
  const bIsStable = STABLECOINS.includes(tokenB.id);

  // Stable/Stable → 0.01%
  if (aIsStable && bIsStable) return FEE_TIERS.LOWEST;

  // ETH/Stable or WETH/Stable → 0.05%
  const aIsEth = tokenA.id === "eth" || tokenA.id === "weth";
  const bIsEth = tokenB.id === "eth" || tokenB.id === "weth";
  if ((aIsEth && bIsStable) || (bIsEth && aIsStable)) return FEE_TIERS.LOW;

  // All other pairs (volatile/volatile) → 0.30%
  return FEE_TIERS.MEDIUM;
}

/**
 * Get token address for V4 (address(0) for native ETH)
 */
export function getV4TokenAddress(token: Token): Address {
  return token.address ?? UNISWAP_V4.NATIVE_ETH;
}

/**
 * Sort addresses for pool key (currency0 < currency1)
 */
export function sortCurrencies(a: Address, b: Address): [Address, Address] {
  return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
}

/**
 * Check if swap is zeroForOne (tokenIn is currency0)
 */
export function isZeroForOne(tokenIn: Address, tokenOut: Address): boolean {
  return tokenIn.toLowerCase() < tokenOut.toLowerCase();
}
