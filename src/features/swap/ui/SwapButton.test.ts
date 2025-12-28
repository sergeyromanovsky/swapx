import { describe, it, expect } from "vitest";
import { getButtonState } from "./SwapButton";

describe("getButtonState", () => {
  const defaultParams = {
    isConnected: true,
    hasTokens: true,
    hasAmount: true,
    hasSufficientBalance: true,
    needsApproval: false,
    isLoading: false,
  };

  it("returns 'loading' when isLoading", () => {
    expect(getButtonState({ ...defaultParams, isLoading: true })).toBe("loading");
  });

  it("returns 'not-connected' when wallet not connected", () => {
    expect(getButtonState({ ...defaultParams, isConnected: false })).toBe("not-connected");
  });

  it("returns 'select-tokens' when tokens not selected", () => {
    expect(getButtonState({ ...defaultParams, hasTokens: false })).toBe("select-tokens");
  });

  it("returns 'enter-amount' when no amount entered", () => {
    expect(getButtonState({ ...defaultParams, hasAmount: false })).toBe("enter-amount");
  });

  it("returns 'insufficient-balance' when balance too low", () => {
    expect(getButtonState({ ...defaultParams, hasSufficientBalance: false })).toBe(
      "insufficient-balance"
    );
  });

  it("returns 'approve' when approval needed", () => {
    expect(getButtonState({ ...defaultParams, needsApproval: true })).toBe("approve");
  });

  it("returns 'swap' when ready to swap", () => {
    expect(getButtonState(defaultParams)).toBe("swap");
  });

  it("prioritizes states correctly", () => {
    // Loading takes priority over everything
    expect(
      getButtonState({
        ...defaultParams,
        isLoading: true,
        isConnected: false,
        hasTokens: false,
      })
    ).toBe("loading");

    // Not connected takes priority over missing tokens
    expect(
      getButtonState({
        ...defaultParams,
        isConnected: false,
        hasTokens: false,
      })
    ).toBe("not-connected");

    // Missing tokens takes priority over missing amount
    expect(
      getButtonState({
        ...defaultParams,
        hasTokens: false,
        hasAmount: false,
      })
    ).toBe("select-tokens");

    // Insufficient balance takes priority over approval
    expect(
      getButtonState({
        ...defaultParams,
        hasSufficientBalance: false,
        needsApproval: true,
      })
    ).toBe("insufficient-balance");
  });
});
