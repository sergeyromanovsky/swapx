import { describe, it, expect } from "vitest";
import { formatNumber, formatUSD, shortenAddress, formatTokenAmount } from "./utils";

describe("formatNumber", () => {
  it("formats billions", () => {
    expect(formatNumber(1_500_000_000)).toBe("1.50B");
    expect(formatNumber(2_400_000_000, 1)).toBe("2.4B");
  });

  it("formats millions", () => {
    expect(formatNumber(1_500_000)).toBe("1.50M");
    expect(formatNumber(42_000_000, 0)).toBe("42M");
  });

  it("formats thousands", () => {
    expect(formatNumber(1_500)).toBe("1.50K");
    expect(formatNumber(999)).toBe("999.00");
  });

  it("formats small numbers", () => {
    expect(formatNumber(42.5678, 2)).toBe("42.57");
    expect(formatNumber(0.123, 3)).toBe("0.123");
  });
});

describe("formatUSD", () => {
  it("formats currency correctly", () => {
    expect(formatUSD(1234.56)).toBe("$1,234.56");
    expect(formatUSD(0.99)).toBe("$0.99");
    expect(formatUSD(1000000)).toBe("$1,000,000.00");
  });

  it("handles zero", () => {
    expect(formatUSD(0)).toBe("$0.00");
  });
});

describe("shortenAddress", () => {
  const address = "0x1234567890abcdef1234567890abcdef12345678";

  it("shortens address with default chars", () => {
    expect(shortenAddress(address)).toBe("0x1234...5678");
  });

  it("shortens address with custom chars", () => {
    expect(shortenAddress(address, 6)).toBe("0x123456...345678");
  });

  it("handles undefined", () => {
    expect(shortenAddress(undefined)).toBe("undefined...undefined");
  });
});

describe("formatTokenAmount", () => {
  it("formats regular numbers", () => {
    expect(formatTokenAmount("123.456789012345")).toBe("123.456789");
    expect(formatTokenAmount(0.123456789)).toBe("0.123457");
  });

  it("removes trailing zeros", () => {
    expect(formatTokenAmount("100.000000")).toBe("100");
    expect(formatTokenAmount("1.500000")).toBe("1.5");
  });

  it("handles very small numbers with exponential", () => {
    expect(formatTokenAmount(0.00001)).toBe("1.00e-5");
    expect(formatTokenAmount("0.000001")).toBe("1.00e-6");
  });

  it("handles NaN", () => {
    expect(formatTokenAmount("not a number")).toBe("0");
    expect(formatTokenAmount(NaN)).toBe("0");
  });

  it("respects custom decimals", () => {
    expect(formatTokenAmount("1.123456789", 4)).toBe("1.1235");
  });
});
