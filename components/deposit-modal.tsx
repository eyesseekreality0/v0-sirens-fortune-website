"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDeposit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Open your deposit.js route in a new tab
    window.open("https://sirenspay.vercel.app/api/deposit.js", "_blank")

    // Auto-close modal after 1.5 seconds
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-primary/30 text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold colorful-text font-serif">
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-6 py-8">
          {isLoading ? (
            <div className="text-foreground font-serif text-lg animate-pulse">
              Opening deposit page...
            </div>
          ) : (
            <>
              <p className="text-foreground font-serif text-lg">
                Click below to open the deposit page.
              </p>
              <Button
                onClick={handleDeposit}
                className="font-serif text-lg px-6 py-3 rounded-2xl"
              >
                Open Deposit Page
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
