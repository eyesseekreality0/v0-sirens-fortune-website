"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card")

  useEffect(() => {
    if (!open) {
      setAmount("")
      setError("")
      setIsProcessing(false)
      setPaymentMethod("card")
    }
  }, [open])

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setError("")
    setIsProcessing(true)

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json()

      if (data.pageUrl) {
        // Add ?cardonly=true for card-only payment flow
        const finalUrl = paymentMethod === "card" ? `${data.pageUrl}?cardonly=true` : data.pageUrl
        window.location.href = finalUrl
      } else {
        setError(data.error || "Failed to create payment")
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      setError("Server error. Try again later.")
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg mx-auto p-6 bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Deposit</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold colorful-text font-serif">Enter Deposit Amount</h2>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-card rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 rounded-xl border border-primary/40 text-lg font-semibold bg-card/70 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter amount"
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value as "card")}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">Pay with Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="crypto"
                checked={paymentMethod === "crypto"}
                onChange={(e) => setPaymentMethod(e.target.value as "crypto")}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">Pay with Crypto</span>
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleDeposit}
            disabled={isProcessing || !amount}
            className="w-full py-4 px-6 bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Continue to Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
