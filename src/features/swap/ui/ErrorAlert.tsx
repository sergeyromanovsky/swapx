"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="break-all">{message}</span>
    </div>
  );
}
