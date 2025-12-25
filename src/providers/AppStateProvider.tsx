"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import { getTokenById, type Token } from "@/lib/tokens";

// =============================================================================
// TYPES
// =============================================================================

export interface SwapFormValues {
  fromAmount: string;
  toAmount: string;
  slippage: number;
  deadline: number;
}

export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  isLoading: boolean;
  error: string | null;
  needsApproval: boolean;
}

interface AppStateContextValue {
  // Form methods from react-hook-form
  form: UseFormReturn<SwapFormValues>;

  // Token state (not in form because token selector is more complex)
  fromToken: Token | null;
  toToken: Token | null;
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  swapTokens: () => void;

  // UI/Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  needsApproval: boolean;
  setNeedsApproval: (needs: boolean) => void;

  // Reset form
  resetForm: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export function AppStateProvider({ children }: { children: ReactNode }) {
  // React Hook Form for input values
  const form = useForm<SwapFormValues>({
    defaultValues: {
      fromAmount: "",
      toAmount: "",
      slippage: 0.5,
      deadline: 30,
    },
    mode: "onChange",
  });

  // Token state
  const [fromToken, setFromTokenState] = useState<Token | null>(
    () => getTokenById("eth") || null
  );
  const [toToken, setToTokenState] = useState<Token | null>(
    () => getTokenById("usdc") || null
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Token setters with swap logic
  const setFromToken = useCallback(
    (token: Token | null) => {
      if (token && toToken?.id === token.id) {
        // Swap tokens if selecting the same token
        setFromTokenState(token);
        setToTokenState(fromToken);
      } else {
        setFromTokenState(token);
      }
      // Clear output when token changes
      form.setValue("toAmount", "");
    },
    [toToken, fromToken, form]
  );

  const setToToken = useCallback(
    (token: Token | null) => {
      if (token && fromToken?.id === token.id) {
        // Swap tokens if selecting the same token
        setToTokenState(token);
        setFromTokenState(toToken);
      } else {
        setToTokenState(token);
      }
      // Clear output when token changes
      form.setValue("toAmount", "");
    },
    [fromToken, toToken, form]
  );

  const swapTokens = useCallback(() => {
    const currentFromAmount = form.getValues("fromAmount");
    const currentToAmount = form.getValues("toAmount");

    setFromTokenState(toToken);
    setToTokenState(fromToken);
    form.setValue("fromAmount", currentToAmount);
    form.setValue("toAmount", currentFromAmount);
  }, [fromToken, toToken, form]);

  // Reset form helper
  const resetForm = useCallback(() => {
    form.reset({
      fromAmount: "",
      toAmount: "",
      slippage: form.getValues("slippage"),
      deadline: form.getValues("deadline"),
    });
    setError(null);
  }, [form]);

  const value: AppStateContextValue = {
    form,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    isLoading,
    setIsLoading,
    error,
    setError,
    needsApproval,
    setNeedsApproval,
    resetForm,
  };

  return (
    <AppStateContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </AppStateContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
