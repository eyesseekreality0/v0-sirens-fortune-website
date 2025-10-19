"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const startCheckout = async () => {
    const n = parseFloat(amount)
    if (!n || n <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setError("")
    setIsProcessing(true)

    try {
      const res = await fetch("/api/create-paylink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create paylink")

      window.open(data.url, "_blank") // Open Helio checkout
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to start checkout")
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border-2 border-primary/30 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Deposit Widget</DialogTitle>

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
              disabled={!amount}
              className="w-full py-4 px-6 text-lg font-bold rounded-2xl magical-button animated-button-colors bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              Continue to Payment
            </Button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-xl font-bold colorful-text font-serif">Redirecting to payment...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
