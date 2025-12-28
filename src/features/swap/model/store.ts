import { create } from "zustand";
import { getTokenById } from "./tokens";
import type { Token } from "./types";

interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  slippage: number;
}

interface SwapActions {
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  flipTokens: () => void;
  reset: () => void;
}

export type SwapStore = SwapState & SwapActions;

const DEFAULT_STATE: SwapState = {
  fromToken: getTokenById("eth") ?? null,
  toToken: getTokenById("usdc") ?? null,
  fromAmount: "",
  slippage: 0.5,
};

export const useSwapStore = create<SwapStore>((set) => ({
  ...DEFAULT_STATE,

  setFromToken: (token) =>
    set((state) => {
      if (token && state.toToken?.id === token.id) {
        return { fromToken: token, toToken: state.fromToken };
      }
      return { fromToken: token };
    }),

  setToToken: (token) =>
    set((state) => {
      if (token && state.fromToken?.id === token.id) {
        return { toToken: token, fromToken: state.toToken };
      }
      return { toToken: token };
    }),

  setFromAmount: (amount) => {
    if (amount === "" || /^\d*\.?\d*$/.test(amount)) {
      set({ fromAmount: amount });
    }
  },

  setSlippage: (slippage) => set({ slippage }),

  flipTokens: () =>
    set((state) => ({
      fromToken: state.toToken,
      toToken: state.fromToken,
      fromAmount: "",
    })),

  reset: () => set({ fromAmount: "" }),
}));
