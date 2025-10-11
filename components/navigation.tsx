"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { DepositModal } from "./deposit-modal"
import Image from "next/image"

export function Navigation() {
  const [isDepositOpen, setIsDepositOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b-2 border-primary/30 magical-glow">
        <div className="container mx-auto px-6 md:px-8 py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group flex-shrink min-w-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-11 md:h-11 shimmer flex-shrink-0">
                <Image
                  src="/sirens-fortune-logo.jpeg"
                  alt="Sirens Fortune Logo"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
              <span className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black colorful-text font-serif tracking-wide">
                Sirens Fortune
              </span>
            </Link>

            <Button
              onClick={() => setIsDepositOpen(true)}
              size="lg"
              className="magical-button animated-button-colors bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl px-4 md:px-6 py-2 text-base md:text-lg flex-shrink-0"
            >
              <span className="font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
                Deposit
              </span>
            </Button>
          </div>
        </div>
      </nav>

      <DepositModal open={isDepositOpen} onOpenChange={setIsDepositOpen} />
    </>
  )
}
