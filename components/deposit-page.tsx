"use client"

import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowLeft } from "lucide-react"
import { useState } from "react"

export function DepositPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLinkDeposit = () => {
    setIsLoading(true)
    window.open("https://sirenspay.vercel.app/api/deposit.js", "_blank")
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleHelioDeposit = () => {
    setIsLoading(true)
    window.open("/helio-checkout", "_blank")
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen relative">
      <OceanBackground />
      <AnimatedFish />
      <Navigation />

      <main className="relative z-10 pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
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

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center mb-3 colorful-text font-serif">
              Make a Deposit
            </h1>
            <p className="text-center text-base sm:text-lg md:text-xl text-foreground/90 mb-12 leading-relaxed">
              Choose your preferred deposit method
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Link Deposit Option */}
              <button
                onClick={handleLinkDeposit}
                disabled={isLoading}
                className="group relative p-8 rounded-2xl border-2 border-primary/30 bg-card/70 backdrop-blur-md hover:border-primary/60 hover:bg-card/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold colorful-text font-serif">Deposit with Link</h3>
                  <p className="text-sm text-foreground/70 text-center">
                    Card Deposit
                  </p>
                </div>
              </button>

              {/* Helio Card Option */}
              <button
                onClick={handleHelioDeposit}
                disabled={isLoading}
                className="group relative p-8 rounded-2xl border-2 border-accent/30 bg-card/70 backdrop-blur-md hover:border-accent/60 hover:bg-card/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 transition-colors">
                    <CreditCard className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold colorful-text font-serif">Deposit with Helio</h3>
                  <p className="text-sm text-foreground/70 text-center">
                    Pay with card or crypto
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
