import {
  parseUnits,
  type PublicClient,
  type WalletClient,
  type Address,
} from "viem";
import type { Token, SwapResult } from "../model/types";
import { getFeeTier } from "../model/tokens";
import { UNISWAP_V3, SWAP_ROUTER_ABI } from "./contracts";
import { getQuote } from "./getQuote";
import { checkAndApprove } from "./approval";

function getTokenAddress(token: Token): Address {
  return token.address ?? UNISWAP_V3.WETH;
}

export interface ExecuteSwapParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage: number;
  address: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export async function executeSwap({
  fromToken,
  toToken,
  amount,
  slippage,
  address,
  publicClient,
  walletClient,
}: ExecuteSwapParams): Promise<SwapResult> {
  let quote;
  try {
    quote = await getQuote({ fromToken, toToken, amount, inputMode: "from", publicClient });
  } catch {
    return { success: false, error: "Failed to get quote" };
  }

  const outputAmount = parseFloat(quote.amountOut);
  const minimumReceived = outputAmount * (1 - slippage / 100);

  try {
    if (fromToken.address !== null) {
      const approved = await checkAndApprove({
        token: fromToken,
        amount,
        ownerAddress: address,
        spenderAddress: UNISWAP_V3.SWAP_ROUTER_02,
        publicClient,
        walletClient,
      });
      if (!approved) {
        return { success: false, error: "Approval failed or rejected" };
      }
    }

    const tokenIn = getTokenAddress(fromToken);
    const tokenOut = getTokenAddress(toToken);
    const isNativeETH = fromToken.address === null;
    const fee = getFeeTier(fromToken, toToken);

    const amountInParsed = parseUnits(amount, fromToken.decimals);
    const amountOutMin = parseUnits(
      minimumReceived.toFixed(toToken.decimals),
      toToken.decimals
    );

    const hash = await walletClient.writeContract({
      chain: walletClient.chain,
      account: walletClient.account!,
      address: UNISWAP_V3.SWAP_ROUTER_02,
      abi: SWAP_ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          fee,
          recipient: address,
          amountIn: amountInParsed,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0n,
        },
      ],
      value: isNativeETH ? amountInParsed : 0n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: receipt.status === "success",
      txHash: hash,
    };
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message.includes("user rejected")
          ? "Transaction rejected"
          : err.message.includes("insufficient")
            ? "Insufficient balance or liquidity"
            : err.message.slice(0, 100)
        : "Swap failed";

    return { success: false, error: errorMsg };
  }
}
