"use client"

import { Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0]

export function SettingsModal({ slippage, onSlippageChange }: SettingsModalProps) {
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage)

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
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {SLIPPAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onSlippageChange(preset)}
                  className={cn(
                    "flex-1 rounded-lg border border-border py-2 text-sm font-medium transition-all hover:border-primary/50",
                    slippage === preset && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {preset}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Custom"
                  value={isCustom ? slippage : ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value > 0 && value <= 50) {
                      onSlippageChange(value)
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
                  Your transaction will revert if it is pending for more than this period of time.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={30}
                className="w-20 rounded-lg border border-border bg-transparent py-2 text-center text-sm font-medium focus:border-primary focus:outline-none"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          {/* Interface Settings */}
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">Interface</p>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-muted-foreground">Expert Mode</span>
                <input
                  type="checkbox"
                  className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-secondary transition-colors checked:bg-primary"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-muted-foreground">Disable Multihops</span>
                <input
                  type="checkbox"
                  className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-secondary transition-colors checked:bg-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
