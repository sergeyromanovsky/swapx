"use client";

import { ArrowDownUp } from "lucide-react";

interface FlipButtonProps {
  onClick: () => void;
}

export function FlipButton({ onClick }: FlipButtonProps) {
  return (
    <div className="relative z-10 flex h-0 items-center justify-center">
      <button
        onClick={onClick}
        className="group flex h-10 w-10 items-center justify-center rounded-xl border-4 border-card bg-secondary transition-all hover:scale-110 hover:bg-accent"
      >
        <ArrowDownUp className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </button>
    </div>
  );
}
