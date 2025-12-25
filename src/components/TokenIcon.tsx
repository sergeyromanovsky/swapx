"use client";

import Image from "next/image";
import type { Token } from "@/lib/tokens";
import { cn } from "@/lib/utils";

type TokenIconSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<TokenIconSize, string> = {
  xs: "h-5 w-5",
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

interface TokenIconProps {
  token: Token;
  size?: TokenIconSize;
  className?: string;
}

export function TokenIcon({ token, size = "md", className }: TokenIconProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={token.icon}
        alt={token.symbol}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

