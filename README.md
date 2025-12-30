# SwapX — Decentralized Token Swap

A modern Uniswap V3 swap interface built with Next.js 16, integrating directly with Uniswap smart contracts on Ethereum mainnet.

## Features

- **Direct Uniswap V3 Integration** — Swaps execute directly on-chain via SwapRouter02
- **Real-time Quotes** — Live price quotes from QuoterV2 contract
- **Smart Fee Tier Selection** — Automatically selects optimal fee tier (0.01%, 0.05%, 0.3%)
- **ERC-20 Approvals** — Handles token approvals with max approval pattern
- **Live Price Feed** — Real-time prices from CoinGecko API
- **Wallet Connect** — WalletConnect v2 via Reown AppKit

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Blockchain | viem, wagmi v2 |
| Wallet | Reown AppKit (WalletConnect v2) |
| State | Zustand, TanStack Query |
| Styling | Tailwind CSS 4, Radix UI |
| Language | TypeScript (strict mode) |

## Architecture

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                 # Shadcn/ui primitives
│   ├── layout/             # Header, Footer
│   └── home/               # Landing page sections
├── features/
│   └── swap/
│       ├── api/            # Contract interactions (pure functions)
│       ├── hooks/          # React hooks (useQuote, useBalance, etc.)
│       ├── model/          # Store, types, token configs
│       └── ui/             # Swap form components
├── lib/                    # Utilities
└── providers/              # AppKit provider setup
```

## Smart Contract Integration

| Contract | Address | Purpose |
|----------|---------|---------|
| SwapRouter02 | `0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45` | Execute swaps |
| QuoterV2 | `0x61fFE014bA17989E743c5F6cB21bF9697530B21e` | Get quotes |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | Wrap ETH |

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Add your WalletConnect Project ID

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Testing

```bash
# Run tests
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage
```

**33 unit tests** covering:
- Utility functions (`formatTokenAmount`, `shortenAddress`, etc.)
- Token configuration and fee tier logic
- Button state machine

## Environment Variables

```env
NEXT_PUBLIC_APPKIT_PROJECT_ID=your_project_id
```

Get your Project ID at [cloud.reown.com](https://cloud.reown.com)

## Supported Tokens

- ETH (Native)
- USDC
- USDT
- LINK
- UNI

## Key Implementation Details

### Quote Fetching
Uses `quoteExactInputSingle` from QuoterV2 to simulate swaps and get accurate output amounts including price impact.

### Fee Tier Logic
- Stable/Stable pairs → 0.01% fee
- ETH/Stable pairs → 0.05% fee  
- All other pairs → 0.3% fee

### Approval Flow
1. Check current allowance via `allowance()`
2. If insufficient, request `approve()` with max uint256
3. Wait for confirmation before swap

## License

MIT
