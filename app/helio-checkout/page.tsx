"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function HelioCheckoutPage() {
  const [amount, setAmount] = useState<string>("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Updated Paylink ID
  const PAYLINK_ID = "68f2905e85c82a99dc39eb20"

  const quickAmounts = ["5", "10", "15", "25", "50", "100"]

  const loadCheckout = (amountValue: string) => {
    const container = document.getElementById("helioCheckoutContainer")
    if (container && window.helioCheckout && scriptLoaded && amountValue) {
      container.innerHTML = ""
      window.helioCheckout(container, {
        paylinkId: PAYLINK_ID,
        theme: { themeMode: "dark" },
        primaryColor: "#abff09",
        neutralColor: "#8200b7",
        amount: amountValue,
      })
    }
  }

  // Load Helio SDK
  useEffect(() => {
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

  // Render checkout when amount is set
  useEffect(() => {
    if (scriptLoaded && amount && showCheckout) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        loadCheckout(amount)
      }, 100)
    }
  }, [amount, scriptLoaded, showCheckout])

  const handleSelectAmount = (val: string) => {
    setAmount(val)
    setShowCheckout(true)
  }

  const handleChangeAmount = () => {
    setShowCheckout(false)
    setAmount("")
  }

  return (
    <div className="min-h-screen w-full bg-background text-center flex flex-col items-center justify-center p-6">
      {!showCheckout ? (
        <div className="w-full max-w-md bg-card/90 backdrop-blur-md border border-primary/30 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-4 colorful-text font-serif">Choose Deposit Amount</h1>
          <p className="text-muted-foreground mb-8">Select how much you'd like to deposit</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {quickAmounts.map((amt) => (
              <Button
                key={amt}
                onClick={() => handleSelectAmount(amt)}
                className="py-4 text-lg font-semibold rounded-xl"
              >
                ${amt}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b-2 border-primary/30 p-4 flex items-center justify-between w-full max-w-3xl mb-6">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground">Deposit Amount:</p>
              <p className="text-2xl font-bold">${amount}</p>
            </div>
            <Button onClick={handleChangeAmount} variant="outline" className="ml-4">
              Change
            </Button>
          </div>

          <div id="helioCheckoutContainer" className="flex-1 w-full max-w-3xl flex items-center justify-center p-6" />
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
