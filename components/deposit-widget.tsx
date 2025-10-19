"use client"

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Script from "next/script"

const PRESET_AMOUNTS = [5, 10, 15, 25, 50, 100]

// Map amounts to their paylink IDs
const PAYLINK_MAP: Record<number, string> = {
  5: "68f2905e85c82a99dc39eb20",
  10: "68ef6f7d89c8017dde33644f",
  15: "68ef6c937967b9161b5ecb9e",
  25: "68f47572dd8fc3e1076094d7",
  50: "68f475b64f8b7a6ca16062e0",
  100: "68f475e866ef198625487887",
}

// Fallback paylink for custom/combined amounts
const FALLBACK_PAYLINK = "68f47622c9daf9bc20b39af1"

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [error, setError] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset when dialog closes
    if (!open) {
      setSelectedAmounts([])
      setIsProcessing(false)
      setError("")
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [open])

  useEffect(() => {
    // Check if script loaded - runs whenever dialog opens
    if (open) {
      const checkScript = setInterval(() => {
        if (typeof window !== 'undefined' && window.helioCheckout) {
          setScriptReady(true)
          clearInterval(checkScript)
        }
      }, 100)

      return () => clearInterval(checkScript)
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
    if (totalAmount === 0) {
      setError("Please select an amount")
      return
    }

    if (!window.helioCheckout) {
      setError("Payment system not ready. Please refresh and try again.")
      return
    }

    if (!containerRef.current) {
      setError("Payment container not found")
      return
    }

    try {
      setError("")
      setIsProcessing(true)
      containerRef.current.innerHTML = ""
      
      // Check if all selected amounts are the same
      const uniqueAmounts = [...new Set(selectedAmounts)]
      let paylinkId: string
      
      if (uniqueAmounts.length === 1) {
        // All amounts are the same, use the specific paylink
        paylinkId = PAYLINK_MAP[uniqueAmounts[0]] || FALLBACK_PAYLINK
      } else {
        // Mixed amounts, use fallback paylink
        paylinkId = FALLBACK_PAYLINK
      }
      
      if (!paylinkId) {
        setError("Payment link not configured for this amount")
        setIsProcessing(false)
        return
      }
      
      window.helioCheckout(containerRef.current, {
        paylinkId: paylinkId,
        theme: { themeMode: "dark" },
        primaryColor: "#abff09",
        neutralColor: "#8200b7",
        amount: totalAmount.toString(),
      })
    } catch (err) {
      console.error("Checkout error:", err)
      setError("Failed to initialize checkout")
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script
        src="https://embed.hel.io/assets/index-v1.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Helio script loaded")
          setScriptReady(true)
        }}
        onError={(e) => {
          console.error("Failed to load Helio script:", e)
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border-2 border-primary/30 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Deposit Widget</DialogTitle>
          {/* Show amount selector when Helio is not active */}
          {!isProcessing ? (
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/20 border border-destructive/40 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={totalAmount === 0}
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
                    setError("")
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
