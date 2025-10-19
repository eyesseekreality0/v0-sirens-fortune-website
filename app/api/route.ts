import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    // Validation
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const secretKey = process.env.HELIO_API_KEY
    const publicKey = process.env.HELIO_PUBLIC_KEY

    // Validation
    if (!secretKey || !publicKey) {
      console.error("[Helio] Missing required env variables")
      return NextResponse.json(
        { error: "Helio configuration incomplete" },
        { status: 500 }
      )
    }

    // Your Helio wallet details
    const walletId = "68d51417b75b14c25b97d4c8"
    const solCurrencyId = "6340313846e4f91b8abc5195" // SOL currency ID

    // Convert SOL amount to base units (1 SOL = 1,000,000,000 base units - 9 decimals)
    const priceInBaseUnits = Math.round(Number(amount) * 1_000_000_000).toString()

    // Create charge via Helio API - PRODUCTION
    const res = await fetch(
      `https://api.hel.io/v1/charge/api-key?apiKey=${publicKey}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Sirens Fortune Deposit - ${amount} SOL`,
          price: priceInBaseUnits,
          pricingCurrency: solCurrencyId,
          template: "OTHER",
          features: {},
          recipients: [
            {
              walletId: walletId,
              currencyId: solCurrencyId,
            },
          ],
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error("[Helio] API error:", data)
      return NextResponse.json(
        { error: data.message || "Failed to create charge" },
        { status: res.status }
      )
    }

    // Return the charge page URL
    return NextResponse.json({
      chargeId: data.id,
      pageUrl: data.pageUrl,
    })
  } catch (err) {
    console.error("[Helio] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
