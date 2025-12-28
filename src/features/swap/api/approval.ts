import {
  parseUnits,
  maxUint256,
  type PublicClient,
  type WalletClient,
  type Address,
} from "viem";
import type { Token } from "../model/types";
import { ERC20_ABI } from "../model/tokens";

export interface CheckAllowanceParams {
  token: Token;
  amount: string;
  ownerAddress: Address;
  spenderAddress: Address;
  publicClient: PublicClient;
}

export async function checkAllowance({
  token,
  amount,
  ownerAddress,
  spenderAddress,
  publicClient,
}: CheckAllowanceParams): Promise<boolean> {
  if (token.address === null) return true;

  const requiredAmount = parseUnits(amount, token.decimals);

  try {
    const allowance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [ownerAddress, spenderAddress],
    });

    return allowance >= requiredAmount;
  } catch {
    return false;
  }
}

export interface ApproveTokenParams {
  token: Token;
  spenderAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export async function approveToken({
  token,
  spenderAddress,
  publicClient,
  walletClient,
}: ApproveTokenParams): Promise<boolean> {
  if (token.address === null) return true;

  try {
    const hash = await walletClient.writeContract({
      chain: walletClient.chain,
      account: walletClient.account!,
      address: token.address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, maxUint256],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.status === "success";
  } catch {
    return false;
  }
}

export interface CheckAndApproveParams {
  token: Token;
  amount: string;
  ownerAddress: Address;
  spenderAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export async function checkAndApprove({
  token,
  amount,
  ownerAddress,
  spenderAddress,
  publicClient,
  walletClient,
}: CheckAndApproveParams): Promise<boolean> {
  if (token.address === null) return true;

  const requiredAmount = parseUnits(amount, token.decimals);

  try {
    const allowance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [ownerAddress, spenderAddress],
    });

    if (allowance >= requiredAmount) return true;

    return approveToken({ token, spenderAddress, publicClient, walletClient });
  } catch {
    return false;
  }
}
