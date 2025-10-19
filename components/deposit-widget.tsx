"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const PRESET_AMOUNTS = [5, 10, 15, 25, 50, 100]

interface DepositWidgetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositWidget({ open, onOpenChange }: DepositWidgetProps) {
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addAmount = (amount: number) => {
    setSelectedAmounts([...selectedAmounts, amount])
  }

  const removeAmount = (index: number) => {
    setSelectedAmounts(selectedAmounts.filter((_, i) => i !== index))
  }

  const totalAmount = selectedAmounts.reduce((sum, amount) => sum + amount, 0)

  const handleCheckout = async () => {
    if (totalAmount === 0) return

    setIsProcessing(true)
    try {
      // Call your Helio or payment endpoint here
      console.log('Processing deposit of $' + totalAmount)
      // Example: const response = await fetch('/api/create-helio-session', { method: 'POST', body: JSON.stringify({ amount: totalAmount }) })
      
      onOpenChange(false)
      setSelectedAmounts([])
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/90 backdrop-blur-md border border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold colorful-text font-serif">Choose Deposit Amount</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-muted-foreground">Select one or more amounts. You can choose the same amount multiple times.</p>

          {/* Preset Amounts Grid */}
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => addAmount(amount)}
                className="py-3 px-2 bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 border border-primary/30 hover:border-primary/60 rounded-lg font-semibold text-primary transition-all duration-200 transform hover:scale-105"
              >
                +${amount}
              </button>
            ))}
          </div>

          {/* Selected Amounts Display */}
          <div className="p-4 bg-card/60 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-semibold">Selected Amounts:</p>
              {selectedAmounts.length > 0 && (
                <button
                  onClick={() => setSelectedAmounts([])}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {selectedAmounts.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">No amounts selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedAmounts.map((amount, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-3 py-1"
                  >
                    <span className="font-semibold text-sm">${amount}</span>
                    <button
                      onClick={() => removeAmount(index)}
                      className="hover:text-accent transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Deposit Amount</p>
            <p className="text-4xl font-black colorful-text font-serif">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={totalAmount === 0 || isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-br from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
          >
            {isProcessing ? 'Processing...' : `Deposit $${totalAmount.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
