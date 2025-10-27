"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Copy, Check, ExternalLink, Timer } from "lucide-react"
import QRCode from "qrcode.react"

interface LightningDepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LightningDepositModal({ open, onOpenChange }: LightningDepositModalProps) {
  const [usdAmount, setUsdAmount] = useState("")
  const [btcAmount, setBtcAmount] = useState("")
  const [lightningInvoice, setLightningInvoice] = useState("")
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)

  // ✅ Fetch live BTC/USD rate from Speed API
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        setLoadingPrice(true)
        const res = await fetch("/api/tryspeed/rates?from=BTC&to=USD")
        const data = await res.json()

        if (res.ok && typeof data.rate === "number") {
          setBtcPrice(data.rate)
        } else {
          console.warn("BTC price not found in response", data)
          setBtcPrice(50000)
        }
      } catch (err) {
        console.error("BTC price fetch error:", err)
        setBtcPrice(50000)
      } finally {
        setLoadingPrice(false)
      }
    }

    if (open) {
      fetchBtcPrice()
    }
  }, [open])

  // ✅ Reset modal state on close
  useEffect(() => {
    if (!open) {
      setUsdAmount("")
      setBtcAmount("")
      setLightningInvoice("")
      setInvoiceId(null)
      setExpiresAt(null)
      setError("")
      setShowQR(false)
      setCopied(false)
      setIsLoading(false)
    }
  }, [open])

  // ✅ Convert USD → BTC
  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usd = e.target.value
    setUsdAmount(usd)
    if (usd && btcPrice) {
      const btc = (parseFloat(usd) / btcPrice).toFixed(8)
      setBtcAmount(btc)
    } else {
      setBtcAmount("")
    }
    setShowQR(false)
    setLightningInvoice("")
    setInvoiceId(null)
    setExpiresAt(null)
  }

  // ✅ Generate Lightning invoice via Speed
  const handleGenerateQR = async () => {
    if (!usdAmount || Number(usdAmount) <= 0) {
      setError("Please enter a valid USD amount")
      return
    }
    if (!btcAmount) {
      setError("Could not convert USD to BTC")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/tryspeed/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: parseFloat(usdAmount),
          btcAmount: btcAmount ? Number(btcAmount) : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.invoice) {
        throw new Error(data.error || "Failed to generate Lightning invoice")
      }

      setLightningInvoice(data.invoice)
      setInvoiceId(data.invoiceId ?? null)
      if (typeof data.btcAmount === "number") {
        setBtcAmount(data.btcAmount.toFixed(8))
      } else if (typeof data.btcAmount === "string") {
        const parsed = Number(data.btcAmount)
        if (!Number.isNaN(parsed)) {
          setBtcAmount(parsed.toFixed(8))
        }
      }
      if (typeof data.expiresAt === "string") {
        setExpiresAt(data.expiresAt)
      }
      setShowQR(true)
    } catch (err) {
      console.error("Invoice creation error:", err)
      setError(err instanceof Error ? err.message : "Server error. Try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyInvoice = () => {
    if (lightningInvoice) {
      navigator.clipboard.writeText(lightningInvoice)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenInWallet = () => {
    if (lightningInvoice) {
      window.location.href = `lightning:${lightningInvoice}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg mx-auto p-6 bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Bitcoin Lightning Deposit</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold colorful-text font-serif">Bitcoin Lightning</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showQR ? (
            <>
              <p className="text-sm text-foreground/70">Enter the USD amount you want to deposit</p>

              {loadingPrice && (
                <p className="text-xs text-foreground/50 animate-pulse">Loading BTC price...</p>
              )}

              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={usdAmount}
                  onChange={handleUsdChange}
                  disabled={loadingPrice}
                  className="w-full p-4 rounded-xl border border-primary/40 text-lg font-semibold bg-card/70 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder={loadingPrice ? "Loading..." : "Enter USD amount"}
                />
                {btcPrice && !loadingPrice && (
                  <p className="text-xs text-foreground/50">
                    BTC Price: ${btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {btcAmount && (
                <div className="bg-card/50 border border-primary/20 rounded-xl p-3">
                  <p className="text-sm text-foreground/70">
                    <span className="font-semibold">${usdAmount} USD</span> ≈{" "}
                    <span className="font-semibold">{btcAmount} BTC</span>
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleGenerateQR}
                disabled={!usdAmount || isLoading || loadingPrice}
                className="w-full py-4 px-6 bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating Invoice..." : "Generate QR Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-foreground/70 text-center">
                  Scan with your Lightning wallet to pay {btcAmount} BTC (${usdAmount} USD)
                </p>
                <div className="bg-white p-4 rounded-xl shadow-glow animate-float-slow">
                  <QRCode value={lightningInvoice} size={256} level="H" includeMargin={true} />
                </div>
              </div>

              <div className="bg-card/60 border border-primary/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-foreground/60 uppercase tracking-wider">
                  <span>Lightning Invoice</span>
                  {invoiceId && <span className="font-semibold text-foreground/80">#{invoiceId}</span>}
                </div>
                {expiresAt && (
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Timer className="w-3 h-3" />
                    <span>Expires: {new Date(expiresAt).toLocaleString()}</span>
                  </div>
                )}
                <textarea
                  readOnly
                  onClick={handleCopyInvoice}
                  className="w-full h-32 text-xs text-foreground/80 break-all cursor-pointer hover:text-foreground transition-colors p-3 bg-card/70 rounded-xl border border-primary/20 focus:outline-none"
                  value={lightningInvoice}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleOpenInWallet}
                  className="w-full py-3 px-4 bg-gradient-to-br from-[var(--button-secondary-from)] via-[var(--button-secondary-via)] to-[var(--button-secondary-to)] hover:from-[var(--button-secondary-hover-from)] hover:via-[var(--button-secondary-hover-via)] hover:to-[var(--button-secondary-hover-to)] text-primary-foreground font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Wallet
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyInvoice}
                    className="flex-1 py-3 px-4 bg-gradient-to-br from-[var(--button-primary-from)] via-[var(--button-primary-via)] to-[var(--button-primary-to)] hover:from-[var(--button-primary-hover-from)] hover:via-[var(--button-primary-hover-via)] hover:to-[var(--button-primary-hover-to)] text-primary-foreground font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Invoice
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowQR(false)}
                    className="flex-1 py-3 px-4 bg-gradient-to-br from-accent/50 to-primary/50 hover:from-accent/70 hover:to-primary/70 text-primary-foreground font-bold rounded-xl transition-all transform hover:scale-105"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
