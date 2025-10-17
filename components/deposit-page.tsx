"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowLeft } from "lucide-react"

export function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState<"link" | "helio" | null>(null)
  const [helioLoaded, setHelioLoaded] = useState(false)

  useEffect(() => {
    if (selectedMethod === "helio" && !helioLoaded) {
      // Load Helio checkout script
      const script = document.createElement("script")
      script.type = "module"
      script.crossOrigin = "anonymous"
      script.src = "https://embed.hel.io/assets/index-v1.js"
      
      script.onload = () => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const container = document.getElementById("helioCheckoutContainer")
          if (container && window.helioCheckout) {
            window.helioCheckout(container, {
              paylinkId: "68ef6f7d89c8017dde33644f",
              theme: { themeMode: "dark" },
              primaryColor: "#abff09",
              neutralColor: "#8200b7",
            })
            setHelioLoaded(true)
          }
        }, 100)
      }
      
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [selectedMethod, helioLoaded])

  return (
    <div className="min-h-screen relative">
      <OceanBackground />
      <AnimatedFish />
      <Navigation />

      <main className="relative z-10 pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {!selectedMethod ? (
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
                  onClick={() => setSelectedMethod("link")}
                  className="group relative p-8 rounded-2xl border-2 border-primary/30 bg-card/70 backdrop-blur-md hover:border-primary/60 hover:bg-card/90 transition-all duration-300 transform hover:scale-105"
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
                    <h3 className="text-2xl font-bold colorful-text font-serif">Link</h3>
                    <p className="text-sm text-foreground/70 text-center">
                      Stripe Crypto On-ramp
                    </p>
                  </div>
                </button>

                {/* Helio Card Option */}
                <button
                  onClick={() => setSelectedMethod("helio")}
                  className="group relative p-8 rounded-2xl border-2 border-accent/30 bg-card/70 backdrop-blur-md hover:border-accent/60 hover:bg-card/90 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 group-hover:from-accent/30 group-hover:to-primary/30 transition-colors">
                      <CreditCard className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold colorful-text font-serif">Card</h3>
                    <p className="text-sm text-foreground/70 text-center">
                      Pay with credit or debit card
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : selectedMethod === "link" ? (
            <div className="bg-card/70 backdrop-blur-md rounded-xl border-2 border-primary/30 p-8">
              <button
                onClick={() => setSelectedMethod(null)}
                className="mb-6 text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h2 className="text-3xl font-bold colorful-text font-serif mb-6">Stripe Crypto On-ramp</h2>
              <div className="w-full">
                <iframe
                  src="https://sirenspay.vercel.app/api/deposit.js"
                  title="Stripe Crypto Deposit"
                  className="w-full rounded-lg border border-border"
                  style={{ height: "600px" }}
                  allow="payment"
                />
              </div>
            </div>
          ) : (
            <div className="bg-card/70 backdrop-blur-md rounded-xl border-2 border-accent/30 p-8">
              <button
                onClick={() => setSelectedMethod(null)}
                className="mb-6 text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h2 className="text-3xl font-bold colorful-text font-serif mb-6">Card Deposit</h2>
              <div
                id="helioCheckoutContainer"
                className="w-full"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

declare global {
  interface Window {
    helioCheckout?: (el: HTMLElement, config: any) => void
  }
}
