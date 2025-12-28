import { describe, it, expect } from "vitest";
import { getTokenById, getTokenBySymbol, getFeeTier, TOKENS, FEE_TIERS } from "./tokens";

describe("getTokenById", () => {
  it("finds token by id", () => {
    const eth = getTokenById("eth");
    expect(eth?.symbol).toBe("ETH");
    expect(eth?.decimals).toBe(18);
  });

  it("returns undefined for unknown id", () => {
    expect(getTokenById("unknown")).toBeUndefined();
  });
});

describe("getTokenBySymbol", () => {
  it("finds token by symbol (case insensitive)", () => {
    expect(getTokenBySymbol("ETH")?.id).toBe("eth");
    expect(getTokenBySymbol("eth")?.id).toBe("eth");
    expect(getTokenBySymbol("Eth")?.id).toBe("eth");
  });

  it("returns undefined for unknown symbol", () => {
    expect(getTokenBySymbol("UNKNOWN")).toBeUndefined();
  });
});

describe("getFeeTier", () => {
  const eth = TOKENS.find((t) => t.id === "eth")!;
  const weth = TOKENS.find((t) => t.id === "weth")!;
  const usdc = TOKENS.find((t) => t.id === "usdc")!;
  const usdt = TOKENS.find((t) => t.id === "usdt")!;
  const dai = TOKENS.find((t) => t.id === "dai")!;
  const link = TOKENS.find((t) => t.id === "link")!;
  const uni = TOKENS.find((t) => t.id === "uni")!;

  it("returns LOWEST (0.01%) for stable/stable pairs", () => {
    expect(getFeeTier(usdc, usdt)).toBe(FEE_TIERS.LOWEST);
    expect(getFeeTier(usdc, dai)).toBe(FEE_TIERS.LOWEST);
    expect(getFeeTier(usdt, dai)).toBe(FEE_TIERS.LOWEST);
  });

  it("returns LOW (0.05%) for ETH/stable pairs", () => {
    expect(getFeeTier(eth, usdc)).toBe(FEE_TIERS.LOW);
    expect(getFeeTier(usdc, eth)).toBe(FEE_TIERS.LOW);
    expect(getFeeTier(weth, usdt)).toBe(FEE_TIERS.LOW);
    expect(getFeeTier(dai, weth)).toBe(FEE_TIERS.LOW);
  });

  it("returns MEDIUM (0.3%) for volatile pairs", () => {
    expect(getFeeTier(eth, link)).toBe(FEE_TIERS.MEDIUM);
    expect(getFeeTier(link, uni)).toBe(FEE_TIERS.MEDIUM);
    expect(getFeeTier(eth, weth)).toBe(FEE_TIERS.MEDIUM);
  });
});

describe("TOKENS", () => {
  it("has correct token count", () => {
    expect(TOKENS.length).toBe(7);
  });

  it("all tokens have required fields", () => {
    TOKENS.forEach((token) => {
      expect(token.id).toBeDefined();
      expect(token.symbol).toBeDefined();
      expect(token.name).toBeDefined();
      expect(token.decimals).toBeGreaterThan(0);
      expect(token.icon).toBeDefined();
      expect(token.coingeckoId).toBeDefined();
    });
  });

  it("ETH is native (no address)", () => {
    const eth = getTokenById("eth");
    expect(eth?.address).toBeNull();
  });

  it("ERC20 tokens have valid addresses", () => {
    const erc20Tokens = TOKENS.filter((t) => t.address !== null);
    erc20Tokens.forEach((token) => {
      expect(token.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
