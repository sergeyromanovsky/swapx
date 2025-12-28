"use client";

import { useState } from "react";
import { Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSwapStore } from "../model/store";

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

export function SettingsModal() {
  const { slippage, setSlippage } = useSwapStore();
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage);
  
  // Track if the input is being actively edited
  const [inputValue, setInputValue] = useState<string | null>(null);
  const isEditing = inputValue !== null;
  
  // Displayed value: show local input while editing, otherwise derive from store
  const displayValue = isEditing ? inputValue : (isCustom ? String(slippage) : "");

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    
    const numValue = parseFloat(raw);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setSlippage(numValue);
    }
  };

  const handleBlur = () => {
    setInputValue(null);
  };

  const handlePresetClick = (preset: number) => {
    setSlippage(preset);
    setInputValue(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Transaction Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium">Slippage Tolerance</span>
              <div className="group relative">
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-popover p-3 text-xs text-popover-foreground shadow-xl group-hover:block">
                  Your transaction will revert if the price changes unfavorably
                  by more than this percentage.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {SLIPPAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-all hover:border-primary/50",
                    slippage === preset &&
                      "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {preset}%
                </button>
              ))}
              <div className="relative flex-1">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={displayValue}
                  onChange={handleCustomChange}
                  onBlur={handleBlur}
                  className={cn(
                    "w-full rounded-lg border border-border bg-transparent py-2 pr-7 text-center text-sm font-medium transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    isCustom && "border-primary bg-primary/10 text-primary"
                  )}
                />
                <span className={cn(
                  "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm",
                  isCustom ? "text-primary" : "text-muted-foreground"
                )}>
                  %
                </span>
              </div>
            </div>
            {slippage > 5 && (
              <p className="mt-2 text-xs text-amber-400">
                ⚠️ High slippage increases the risk of front-running
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
