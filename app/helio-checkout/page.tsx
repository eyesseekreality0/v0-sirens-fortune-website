"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function HelioCheckoutPage() {
  const [amount, setAmount] = useState<string>("")
  const [inputAmount, setInputAmount] = useState<string>("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const loadCheckout = (amountValue: string) => {
    const container = document.getElementById("helioCheckoutContainer")
    if (container && window.helioCheckout && scriptLoaded && amountValue) {
      // Clear previous checkout
      container.innerHTML = ""
      
      window.helioCheckout(container, {
        paylinkId: "68ef6f7d89c8017dde33644f",
        theme: { themeMode: "dark" },
        primaryColor: "#13ffbd",
        neutralColor: "#8200b7",
        amount: amountValue,
      })
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
      setScriptLoaded(true)
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (scriptLoaded && amount && showCheckout) {
      loadCheckout(amount)
    }
  }, [amount, scriptLoaded, showCheckout])

  const handleContinue = () => {
    const numAmount = parseFloat(inputAmount)
    if (numAmount > 0) {
      setAmount(inputAmount)
      setShowCheckout(true)
    } else {
      alert("Please enter a valid amount greater than $0")
    }
  }

  const handleChangeAmount = () => {
    setShowCheckout(false)
    setAmount("")
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {!showCheckout ? (
        // Amount Selection Screen
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl p-8 shadow-2xl">
              <h1 className="text-3xl font-bold text-center mb-2 colorful-text font-serif">
                Enter Deposit Amount
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                Choose how much you'd like to deposit
              </p>

              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount-input" className="block text-sm font-semibold text-foreground mb-2">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/70 text-xl">$</span>
                    <input
                      id="amount-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleContinue()
                        }
                      }}
                      className="w-full pl-10 pr-4 py-4 text-xl bg-input border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Quick Select:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["10", "25", "50", "100", "250", "500"].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        onClick={() => setInputAmount(quickAmount)}
                        variant="outline"
                        className="bg-card/50 hover:bg-primary/20 border-primary/30 hover:border-primary/60"
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-br from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-primary-foreground font-bold py-6 text-lg rounded-xl"
                  disabled={!inputAmount || parseFloat(inputAmount) <= 0}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Checkout Screen
        <>
          {/* Amount Display Header */}
          <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-primary/30 p-4">
            <div className="container mx-auto max-w-2xl flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground">Deposit Amount:</p>
                <p className="text-2xl font-bold text-foreground">${amount}</p>
              </div>
              <Button
                onClick={handleChangeAmount}
                variant="outline"
                className="ml-4"
              >
                Change Amount
              </Button>
            </div>
          </div>

          {/* Checkout Container */}
          <div
            id="helioCheckoutContainer"
            className="w-full min-h-[calc(100vh-100px)] flex items-center justify-center p-4"
          />
        </>
      )}
    </div>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
