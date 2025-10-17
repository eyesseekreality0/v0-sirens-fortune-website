"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function HelioCheckoutPage() {
  const [amount, setAmount] = useState<string>("5.99")
  const [inputAmount, setInputAmount] = useState<string>("5.99")
  const [isCheckoutReady, setIsCheckoutReady] = useState(false)

  const loadCheckout = () => {
    const container = document.getElementById("helioCheckoutContainer")
    if (container && window.helioCheckout) {
      // Clear previous checkout
      container.innerHTML = ""
      
      window.helioCheckout(container, {
        paylinkId: "68ef6f7d89c8017dde33644f",
        theme: { themeMode: "dark" },
        primaryColor: "#13ffbd",
        neutralColor: "#8200b7",
        amount: amount,
        paymentRequestId: undefined,
      })
      
      setIsCheckoutReady(true)
    }
  }

  useEffect(() => {
    // Load Helio checkout script
    const script = document.createElement("script")
    script.type = "module"
    script.crossOrigin = "anonymous"
    script.src = "https://embed.hel.io/assets/index-v1.js"
    document.body.appendChild(script)

    script.onload = () => {
      loadCheckout()
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [amount])

  const handleAmountUpdate = () => {
    const numAmount = parseFloat(inputAmount)
    if (numAmount > 0) {
      setAmount(inputAmount)
    } else {
      alert("Please enter a valid amount greater than 0")
    }
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Amount Input Section */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-primary/30 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <label htmlFor="amount-input" className="text-foreground font-semibold whitespace-nowrap">
              Deposit Amount:
            </label>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">$</span>
                <input
                  id="amount-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="w-full sm:w-32 pl-7 pr-3 py-2 bg-input border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={handleAmountUpdate}
                className="bg-gradient-to-br from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-primary-foreground font-bold px-6"
              >
                Update
              </Button>
            </div>
          </div>
          {isCheckoutReady && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Current amount: <span className="font-bold text-foreground">${amount}</span>
            </p>
          )}
        </div>
      </div>

      {/* Checkout Container */}
      <div
        id="helioCheckoutContainer"
        className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center p-4"
      />
    </div>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
