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

    if (!secretKey || !publicKey) {
      console.error("[Helio] Missing API keys")
      return NextResponse.json(
        { error: "Helio API keys not configured" },
        { status: 500 }
      )
    }

    // Create charge via Helio API
    const res = await fetch(`https://api.hel.io/v1/charge/api-key?apiKey=${publicKey}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
      }),
    })

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
