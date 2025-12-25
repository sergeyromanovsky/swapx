"use client";

import { Settings, Info } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { SwapFormValues } from "@/providers/AppStateProvider";

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

export function SettingsModal() {
  const form = useFormContext<SwapFormValues>();
  const slippage = form.watch("slippage");
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage);

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
          {/* Slippage Tolerance */}
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
            <Controller
              control={form.control}
              name="slippage"
              render={({ field }) => (
                <div className="flex gap-2">
                  {SLIPPAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => field.onChange(preset)}
                      className={cn(
                        "flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-all hover:border-primary/50",
                        field.value === preset &&
                          "border-primary bg-primary/10 text-primary"
                      )}
                    >
                      {preset}%
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={isCustom ? field.value : ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value > 0 && value <= 50) {
                          field.onChange(value);
                        }
                      }}
                      className={cn(
                        "w-full rounded-lg border border-border bg-transparent py-2 text-center text-sm font-medium transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none",
                        isCustom && "border-primary bg-primary/10 text-primary"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              )}
            />
            {slippage > 5 && (
              <p className="mt-2 text-xs text-amber-400">
                ⚠️ High slippage increases the risk of front-running
              </p>
            )}
          </div>

          {/* Transaction Deadline */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium">Transaction Deadline</span>
              <div className="group relative">
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-popover p-3 text-xs text-popover-foreground shadow-xl group-hover:block">
                  Your transaction will revert if it is pending for more than
                  this period of time.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        field.onChange(value);
                      }
                    }}
                    className="w-20 rounded-lg border border-border bg-transparent py-2 text-center text-sm font-medium focus:border-primary focus:outline-none"
                  />
                )}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
