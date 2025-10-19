"use client"

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Script from "next/script"

const PRESET_AMOUNTS = [5, 10, 15, 25, 50, 100]
const PAYLINK_ID = "68f2905e85c82a99dc39eb20"

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset when dialog closes
    if (!open) {
      setSelectedAmounts([])
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [open])

  const addAmount = (amount: number) => {
    setSelectedAmounts([...selectedAmounts, amount])
  }

  const removeAmount = (index: number) => {
    setSelectedAmounts(selectedAmounts.filter((_, i) => i !== index))
  }

  const totalAmount = selectedAmounts.reduce((sum, amount) => sum + amount, 0)

  const handleCheckout = () => {
    if (totalAmount === 0 || !scriptReady || !containerRef.current) return

    setIsProcessing(true)

    if (window.helioCheckout) {
      containerRef.current.innerHTML = ""
      window.helioCheckout(containerRef.current, {
        paylinkId: PAYLINK_ID,
        theme: { themeMode: "dark" },
        primaryColor: "#abff09",
        neutralColor: "#8200b7",
        amount: totalAmount.toString(),
      })
    }
  }

  return (
    <>
      <Script
        src="https://embed.hel.io/assets/index-v1.js"
        strategy="lazyOnload"
        onReady={() => {
          setScriptReady(true)
        }}
        onError={(e) => {
          console.error("Failed to load Helio script:", e)
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border-2 border-primary/30 p-0 overflow-hidden">
          {/* Show amount selector when Helio is not active */}
          {!isProcessing || totalAmount === 0 ? (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold colorful-text font-serif mb-2">
                  Choose Deposit Amount
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select one or more amounts. You can choose the same amount multiple times.
                </p>
              </div>

              {/* Preset Amounts Grid */}
              <div className="grid grid-cols-3 gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => addAmount(amount)}
                    className="py-4 px-2 bg-gradient-to-br from-[var(--button-primary-from)] via-[var(--button-primary-via)] to-[var(--button-primary-to)] hover:from-[var(--button-primary-hover-from)] hover:via-[var(--button-primary-hover-via)] hover:to-[var(--button-primary-hover-to)] border-0 rounded-xl font-bold text-primary-foreground transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                  >
                    +${amount}
                  </button>
                ))}
              </div>

              {/* Selected Amounts Display */}
              <div className="p-4 bg-card/60 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground font-semibold">Selected:</p>
                  {selectedAmounts.length > 0 && (
                    <button
                      onClick={() => setSelectedAmounts([])}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                {selectedAmounts.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No amounts selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedAmounts.map((amount, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-3 py-1"
                      >
                        <span className="font-semibold text-sm">${amount}</span>
                        <button
                          onClick={() => removeAmount(index)}
                          className="hover:text-accent transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-4xl font-black colorful-text font-serif">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={totalAmount === 0 || !scriptReady}
                className="w-full py-4 px-6 bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                Continue to Payment
              </Button>
            </div>
          ) : (
            /* Helio Checkout Container */
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit Amount</p>
                  <p className="text-2xl font-bold colorful-text font-serif">${totalAmount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setIsProcessing(false)
                    if (containerRef.current) containerRef.current.innerHTML = ""
                  }}
                  className="p-2 hover:bg-card rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div 
                ref={containerRef}
                id="helioCheckoutContainer" 
                className="min-h-[500px]"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
