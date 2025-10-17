"use client"

import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { OceanBackground } from "@/components/ocean-background"
import { AnimatedFish } from "@/components/animated-fish"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CreditCard, Link as LinkIcon } from "lucide-react"
import { useState } from "react"

export function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState<"link" | "helio" | null>(null)

  useEffect(() => {
    if (selectedMethod === "helio") {
      // Load Helio checkout script
      const script = document.createElement("script")
      script.type = "module"
      script.crossOrigin = "anonymous"
      script.src = "https://embed.hel.io/assets/index-v1.js"
      document.head.appendChild(script)

      // Initialize Helio after script loads
      script.onload = () => {
        if (window.helioCheckout) {
          window.helioCheckout(
            document.getElementById("helioCheckoutContainer"),
            {
              paylinkId: "68ef6f7d89c8017dde33644f",
              theme: { themeMode: "dark" },
              primaryColor: "#abff09",
              neutralColor: "#8200b7",
            }
          )
        }
      }

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [selectedMethod])

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
                      <LinkIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold colorful-text font-serif">Link</h3>
                    <p className="text-sm text-foreground/70 text-center">
                      Use your existing deposit method
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
                      Deposit with credit or debit card
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
                ← Back
              </button>
              <h2 className="text-3xl font-bold colorful-text font-serif mb-6">Link Deposit</h2>
              <div className="flex items-center justify-center min-h-96">
                <iframe
                  src="https://sirenspay.vercel.app/api/deposit.js"
                  title="Link Deposit"
                  className="w-full h-96 rounded-lg border border-border"
                />
              </div>
            </div>
          ) : (
            <div className="bg-card/70 backdrop-blur-md rounded-xl border-2 border-accent/30 p-8">
              <button
                onClick={() => setSelectedMethod(null)}
                className="mb-6 text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                ← Back
              </button>
              <h2 className="text-3xl font-bold colorful-text font-serif mb-6">Card Deposit</h2>
              <div
                id="helioCheckoutContainer"
                className="flex items-center justify-center min-h-96"
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
