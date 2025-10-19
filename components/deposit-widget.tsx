"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Script from "next/script"

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [scriptReady, setScriptReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setAmount("")
      setIsProcessing(false)
      setError("")
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [open])

  // Poll for helio script when open
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).helioCheckout) {
        setScriptReady(true)
        clearInterval(id)
      }
    }, 120)
    return () => clearInterval(id)
  }, [open])

  const startCheckout = () => {
    const n = parseFloat(amount)
    if (!n || n <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!containerRef.current) {
      setError("Payment container not found")
      return
    }
    if (typeof window === "undefined" || !(window as any).helioCheckout) {
      setError("Payment system not ready. Refresh and try again.")
      return
    }

    try {
      setError("")
      setIsProcessing(true)
      containerRef.current.innerHTML = ""

      ;(window as any).helioCheckout(containerRef.current, {
        paylinkId: "68f4797ca6507e2626af2587", // your dynamic Helio paylink
        theme: { themeMode: "dark" },
        primaryColor: "#abff09",
        neutralColor: "#8200b7",
        amount: n.toString(),
      })
    } catch (err) {
      console.error("Helio init error:", err)
      setError("Failed to start checkout. Try refreshing.")
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Helio embed script */}
      <Script
        src="https://embed.hel.io/assets/index-v1.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
        onError={(e) => {
          console.error("Helio script failed to load", e)
          setError("Payment script failed to load.")
        }}
      />

      {/* Accessible dialog wrapper (keeps your existing Dialog component) */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Modal backdrop + animated content */}
        <div
          aria-hidden={!open}
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 pointer-events-none`}
        >
          {/* BACKDROP */}
          <div
            onClick={() => onOpenChange(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          />

          {/* DIALOG CONTENT - uses your DialogContent for layout but adds animation classes */}
          <DialogContent
            className={`relative pointer-events-auto w-full max-w-md transform transition-all duration-300 rounded-2xl overflow-hidden
              ${open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"}
              bg-card/90 backdrop-blur-md border-2 border-accent/30 p-0 shadow-2xl`}
          >
            <DialogTitle className="sr-only">Deposit Widget</DialogTitle>

            {/* --- Step 1: Amount input --- */}
            {!isProcessing ? (
              <div className="p-8 space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-black colorful-text font-serif mb-2">
                    Deposit with Helio
                  </h2>
                  <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">
                    Enter the amount you’d like to deposit. Pay securely with card or crypto.
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-card/70 border border-accent/40 rounded-2xl px-6 py-4 shadow-lg w-full">
                    <span className="text-2xl font-bold text-accent">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-transparent text-3xl font-black text-primary-foreground placeholder:text-muted-foreground focus:outline-none font-serif"
                      aria-label="Deposit amount in USD"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/20 border border-destructive/40 rounded-lg text-center">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={startCheckout}
                  disabled={!scriptReady || !amount}
                  className="w-full py-4 px-6 text-lg font-bold rounded-2xl magical-button animated-button-colors bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Continue to Payment
                </Button>
              </div>
            ) : (
              /* --- Step 2: Helio embed container (checkout) --- */
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit Amount</p>
                    <p className="text-2xl font-bold colorful-text font-serif">${parseFloat(amount).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProcessing(false)
                      setError("")
                      if (containerRef.current) containerRef.current.innerHTML = ""
                    }}
                    className="p-2 hover:bg-card rounded-lg transition-colors"
                    aria-label="Close checkout"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div ref={containerRef} className="min-h-[480px]" />
              </div>
            )}
          </DialogContent>
        </div>
      </Dialog>
    </>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
