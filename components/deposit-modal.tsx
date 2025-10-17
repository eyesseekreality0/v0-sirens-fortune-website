"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DepositButton() {
  return (
    <Link href="/deposit" className="inline-block">
      <Button className="magical-button animated-button-colors bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl px-4 md:px-6 py-2 text-base md:text-lg flex-shrink-0">
        <span className="font-serif [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%),_-2px_-2px_4px_rgb(0_0_0_/_70%),_0_0_10px_rgb(0_0_0_/_50%)]">
          Deposit
        </span>
      </Button>
    </Link>
  )
}
