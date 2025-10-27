import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const speedApiKey = process.env.SPEED_API_KEY

    if (!speedApiKey) {
      console.error("[Lightning] Missing SPEED_API_KEY")
      return NextResponse.json(
        { error: "Lightning configuration incomplete" },
        { status: 500 }
      )
    }

    // Convert BTC to millisatoshis (msat)
    // 1 BTC = 100,000,000 satoshis = 100,000,000,000 millisatoshis
    const msats = Math.round(Number(amount) * 100_000_000_000)

    console.log(`[Lightning] Creating invoice for ${amount} BTC = ${msats} msats`)

    const apiUrl = "https://api.tryspeed.com/api/v0/invoices"

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats: msats,
        description: `Sirens Fortune Deposit - ${amount} BTC`,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("[Lightning] API error:", data)
      return NextResponse.json(
        { error: data.message || data.error || "Failed to create invoice" },
        { status: res.status }
      )
    }

    console.log(`[Lightning] Invoice created successfully`)

    return NextResponse.json({
      invoice: data.invoice || data.paymentRequest || data.pr,
      amount: amount,
      msats: msats,
      id: data.id,
    })
  } catch (err) {
    console.error("[Lightning] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
