"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap, CreditCard, Sparkles } from "lucide-react"
import { LightningDepositModal } from "./lightning-deposit-modal"

export function DepositPage() {
  const [showLightning, setShowLightning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const stripeOnrampUrl = process.env.NEXT_PUBLIC_STRIPE_CRYPTO_ONRAMP_URL

  useEffect(() => {
    if (!statusMessage) return
    const timeout = window.setTimeout(() => setStatusMessage(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [statusMessage])

  const handleStripeOnramp = () => {
    if (!stripeOnrampUrl) {
      setStatusMessage("Stripe Crypto Onramp URL is not configured yet. Please contact support.")
      return
    }

    setIsLoading(true)
    const newTab = window.open(stripeOnrampUrl, "_blank", "noopener")
    if (!newTab) {
      setStatusMessage("Pop-up blocked. Please allow pop-ups for this site to continue.")
    }
    setTimeout(() => setIsLoading(false), 800)
  }

  return (
    <div className="min-h-screen relative">
      <OceanBackground />
      <AnimatedFish />
      <Navigation />

      <main className="relative z-10 pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="absolute inset-x-4 sm:inset-x-12 -top-6 sm:-top-12 h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30 blur-3xl rounded-full opacity-60 pointer-events-none" />

          <div className="mb-10">
            <Button
              onClick={() => window.history.back()}
              className="magical-button animated-button-colors bg-gradient-to-br from-[var(--button-primary-from)] via-[var(--button-primary-via)] to-[var(--button-primary-to)] hover:from-[var(--button-primary-hover-from)] hover:via-[var(--button-primary-hover-via)] hover:to-[var(--button-primary-hover-to)] text-primary-foreground font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl px-6 py-3 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
                Back to Home
              </span>
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/40 via-secondary/40 to-accent/40 rounded-full blur-3xl opacity-80 animate-float-slow pointer-events-none" />
            <div className="absolute -bottom-16 -left-20 w-40 h-40 bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 rounded-full blur-3xl opacity-70 animate-float-slower pointer-events-none" />

            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-card/70 border border-primary/30 px-5 py-2 text-sm uppercase tracking-[0.3em] text-foreground/80 animate-pulse-soft">
                <Sparkles className="w-4 h-4 text-secondary" />
                Premium Deposits
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center colorful-text font-serif drop-shadow-xl">
                  Choose Your Treasure Path
                </h1>
                <p className="text-center text-base sm:text-lg md:text-xl text-foreground/90 leading-relaxed max-w-2xl mx-auto">
                  Seamlessly fund your voyage with Stripe Crypto Onramp or lightning-fast Bitcoin via TrySpeed.
                </p>
              </div>

              {statusMessage && (
                <div className="mx-auto max-w-xl rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-glow">
                  {statusMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={handleStripeOnramp}
                  disabled={isLoading}
                  className="group relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 shadow-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--vibrant-cyan)_0%,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center rounded-2xl bg-card/50 p-4 shadow-glow">
                      <CreditCard className="w-9 h-9 text-primary group-hover:animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold colorful-text font-serif">Stripe Crypto Onramp</h3>
                      <p className="text-sm text-foreground/80">
                        Convert your fiat seamlessly to crypto with Stripe&rsquo;s secure onramp experience.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-4 py-2 text-xs uppercase tracking-widest text-foreground/70">
                      <span className="h-2 w-2 rounded-full bg-secondary animate-ping" />
                      Instant Card Conversion
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setShowLightning(true)}
                  className="group relative overflow-hidden rounded-3xl border border-secondary/40 bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/20 p-8 shadow-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,var(--vibrant-purple)_0%,transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center rounded-2xl bg-card/50 p-4 shadow-glow">
                      <Zap className="w-9 h-9 text-secondary group-hover:animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold colorful-text font-serif">TrySpeed Lightning</h3>
                      <p className="text-sm text-foreground/80">
                        Generate an LN invoice using TrySpeed&rsquo;s official Lightning API for blazing-fast settlements.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-card/70 px-4 py-2 text-xs uppercase tracking-widest text-foreground/70">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
                      Bitcoin Ready in Seconds
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LightningDepositModal open={showLightning} onOpenChange={setShowLightning} />
    </div>
  )
}
