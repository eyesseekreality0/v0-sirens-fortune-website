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
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group">
              <div className="relative w-12 h-12 md:w-16 md:h-16 shimmer">
                <Image
                  src="/sirens-fortune-logo.jpeg"
                  alt="Sirens Fortune Logo"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
              <span className="text-2xl md:text-4xl font-black colorful-text font-serif tracking-wide">
                Sirens Fortune
              </span>
            </Link>

            <Button
              onClick={() => setIsDepositOpen(true)}
              size="lg"
              className="magical-button animated-button-colors bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl px-4 md:px-6 py-2 md:py-3 text-sm md:text-lg"
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
