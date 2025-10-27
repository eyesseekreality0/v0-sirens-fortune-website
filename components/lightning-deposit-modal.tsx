// app/components/lightning-deposit-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import QRCode from "qrcode.react";

interface LightningDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LightningDepositModal({ open, onOpenChange }: LightningDepositModalProps) {
  const [usdAmount, setUsdAmount] = useState("");
  const [btcAmount, setBtcAmount] = useState("");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [lightningInvoice, setLightningInvoice] = useState("");
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset modal on close
  useEffect(() => {
    if (!open) {
      setUsdAmount("");
      setBtcAmount("");
      setLightningInvoice("");
      setError("");
      setShowQR(false);
      setCopied(false);
      setIsLoading(false);
      setBtcPrice(null);
    }
  }, [open]);

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsdAmount(e.target.value);
    setBtcAmount("");
    setBtcPrice(null);
  };

  // ---- ONLY /api/create-invoice here ----
  const handleGenerateQR = async () => {
    const usd = Number(usdAmount);
    if (!usd || usd <= 0) {
      setError("Please enter a valid USD amount");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: usd,
          userId: "anonymous-user",
        }),
      });

      // Prevent "Unexpected end of JSON" if server returns HTML or empty
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : { error: await res.text() };

      if (!res.ok || !data?.paymentRequest) {
        throw new Error(data?.error || "Failed to generate Lightning invoice");
      }

      setLightningInvoice(String(data.paymentRequest));
      setBtcAmount(String(data.btcAmount ?? ""));
      setBtcPrice(typeof data.btcPrice === "number" ? data.btcPrice : null);
      setShowQR(true);
    } catch (err) {
      console.error("Invoice creation error:", err);
      setError(err instanceof Error ? err.message : "Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInvoice = () => {
    if (lightningInvoice) {
      navigator.clipboard.writeText(lightningInvoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInWallet = () => {
    if (lightningInvoice) {
      window.location.href = `lightning:${lightningInvoice}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Add aria-describedby target to silence Radix warning */}
      <DialogContent
        className="w-full max-w-lg mx-auto p-6 bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl overflow-y-auto max-h-[90vh]"
        aria-describedby="deposit-desc"
      >
        <DialogTitle className="sr-only">Bitcoin Lightning Deposit</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold colorful-text font-serif">Bitcoin Lightning</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-card rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showQR ? (
            <>
              <p id="deposit-desc" className="text-sm text-foreground/70">
                Enter the USD amount you want to deposit
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={usdAmount}
                  onChange={handleUsdChange}
                  className="w-full p-4 rounded-xl border border-primary/40 text-lg font-semibold bg-card/70 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter USD amount"
                />
              </div>

              {btcAmount && (
                <div className="bg-card/50 border border-primary/20 rounded-xl p-3">
                  <p className="text-sm text-foreground/70">
                    <span className="font-semibold">${usdAmount} USD</span> ≈{" "}
                    <span className="font-semibold">{btcAmount} BTC</span>
                    {btcPrice ? (
                      <span className="text-foreground/50">
                        {" "}
                        (@ ${btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}/BTC)
                      </span>
                    ) : null}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleGenerateQR}
                disabled={!usdAmount || isLoading}
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
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCode value={lightningInvoice} size={256} level="H" includeMargin />
                </div>
              </div>

              <div className="bg-card/50 border border-primary/20 rounded-xl p-4">
                <p className="text-xs text-foreground/50 mb-2">Lightning Invoice:</p>
                <div
                  onClick={handleCopyInvoice}
                  className="text-xs text-foreground/70 break-all cursor-pointer hover:text-foreground transition-colors p-2 bg-card/70 rounded border border-primary/20"
                  title="Click to copy"
                >
                  {lightningInvoice.substring(0, 72)}...
                </div>
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
  );
}
