import { parseUnits, formatUnits, type PublicClient, type Address } from "viem";
import type { Token, QuoteResult } from "../model/types";
import { getFeeTier } from "../model/tokens";
import { UNISWAP_V3, QUOTER_V2_ABI } from "./contracts";
import { formatTokenAmount } from "@/lib/utils";
import type { InputMode } from "../model/store";

function getTokenAddress(token: Token): Address {
  return token.address ?? UNISWAP_V3.WETH;
}

export interface GetQuoteParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  inputMode: InputMode;
  publicClient: PublicClient;
}

export async function getQuote({
  fromToken,
  toToken,
  amount,
  inputMode,
  publicClient,
}: GetQuoteParams): Promise<QuoteResult> {
  const tokenIn = getTokenAddress(fromToken);
  const tokenOut = getTokenAddress(toToken);
  const fee = getFeeTier(fromToken, toToken);

  if (inputMode === "from") {
    const exactAmount = parseUnits(amount, fromToken.decimals);

    const result = await publicClient.simulateContract({
      address: UNISWAP_V3.QUOTER_V2,
      abi: QUOTER_V2_ABI,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          amountIn: exactAmount,
          fee,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const [amountOut] = result.result as [bigint, bigint, number, bigint];

    return {
      amountOut: formatTokenAmount(formatUnits(amountOut, toToken.decimals)),
      amountOutRaw: amountOut,
      amountIn: amount,
      amountInRaw: exactAmount,
    };
  } else {
    const exactAmount = parseUnits(amount, toToken.decimals);

    const result = await publicClient.simulateContract({
      address: UNISWAP_V3.QUOTER_V2,
      abi: QUOTER_V2_ABI,
      functionName: "quoteExactOutputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          amount: exactAmount,
          fee,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const [amountIn] = result.result as [bigint, bigint, number, bigint];

    return {
      amountOut: amount,
      amountOutRaw: exactAmount,
      amountIn: formatTokenAmount(formatUnits(amountIn, fromToken.decimals)),
      amountInRaw: amountIn,
    };
  }
}
