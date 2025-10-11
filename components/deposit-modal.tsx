"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useRef } from "react"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !containerRef.current) return

    // Load Stripe Crypto Onramp
    const script = document.createElement("script")
    script.src = "https://crypto-js.stripe.com/crypto-onramp-outer.js"
    script.async = true

    script.onload = () => {
      if (containerRef.current && (window as any).StripeOnramp) {
        const stripeOnramp = (window as any).StripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

        stripeOnramp
          .createSession({
            transaction_details: {
              destination_currency: "usdc",
              destination_network: "ethereum",
            },
          })
          .then((session: any) => {
            if (containerRef.current) {
              containerRef.current.innerHTML = ""
              stripeOnramp.mount({
                clientSecret: session.client_secret,
                targetElement: containerRef.current,
              })
            }
          })
      }
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-cinzel)" }}>
            Deposit Crypto
          </DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="min-h-[400px]" />
      </DialogContent>
    </Dialog>
  )
}
