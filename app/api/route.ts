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
    const walletId = process.env.HELIO_WALLET_ID
    const currencyId = process.env.HELIO_CURRENCY_ID
    const environment = process.env.HELIO_ENV || "production"

    // Validation
    if (!secretKey || !publicKey || !walletId || !currencyId) {
      console.error("[Helio] Missing required env variables")
      return NextResponse.json(
        { error: "Helio configuration incomplete" },
        { status: 500 }
      )
    }

    // Determine API endpoint based on environment
    const baseUrl = environment === "testnet" ? "https://api.dev.hel.io" : "https://api.hel.io"

    // Convert USD amount to USDC base units (1 USDC = 1,000,000 base units)
    const priceInBaseUnits = Math.round(Number(amount) * 1_000_000).toString()

    // Create charge via Helio API
    const res = await fetch(
      `${baseUrl}/v1/charge/api-key?apiKey=${publicKey}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Sirens Fortune Deposit - $${amount}`,
          price: priceInBaseUnits,
          pricingCurrency: currencyId,
          template: "OTHER",
          features: {},
          recipients: [
            {
              walletId: walletId,
              currencyId: currencyId,
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
