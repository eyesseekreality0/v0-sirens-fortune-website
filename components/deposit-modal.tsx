"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import { createCryptoOnrampSession } from "@/app/actions/stripe"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !containerRef.current) return

    let stripeOnrampInstance: any = null

    const initializeOnramp = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const script = document.createElement("script")
        script.src = "https://crypto-js.stripe.com/crypto-onramp-outer.js"
        script.async = true

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })

        const { clientSecret } = await createCryptoOnrampSession()

        if (containerRef.current && (window as any).StripeOnramp) {
          const stripeOnramp = (window as any).StripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
          stripeOnrampInstance = stripeOnramp

          stripeOnramp
            .createEmbeddedComponent({
              clientSecret,
              appearance: {
                theme: "dark",
              },
            })
            .mount(containerRef.current)
        }
      } catch (err) {
        console.error("[v0] Failed to initialize Stripe Onramp:", err)
        setError("Failed to load deposit form. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    initializeOnramp()

    return () => {
      if (stripeOnrampInstance) {
        stripeOnrampInstance.destroy()
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold colorful-text font-serif">Deposit Crypto</DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-foreground font-serif">Loading deposit form...</div>
          </div>
        )}
        {error && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-destructive font-serif">{error}</div>
          </div>
        )}
        <div ref={containerRef} className="min-h-[400px]" />
      </DialogContent>
    </Dialog>
  )
}
