"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (open) {
      setIsLoaded(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[80vh] bg-card border-primary/30 overflow-hidden p-0">
        <DialogHeader className="p-4">
          <DialogTitle className="text-2xl font-bold colorful-text font-serif text-center">
            Deposit Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-full">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
              <div className="text-foreground font-serif">Loading deposit widget...</div>
            </div>
          )}

          <iframe
            src="https://sirenspay.vercel.app/api/deposit.js"
            className="w-full h-full border-0"
            onLoad={() => setIsLoaded(true)}
            allow="clipboard-read; clipboard-write; accelerometer; autoplay; camera; payment; usb"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
