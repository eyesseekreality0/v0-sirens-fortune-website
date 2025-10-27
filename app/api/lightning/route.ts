import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    // 🧩 Validate amount
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const speedApiKey = process.env.SPEED_API_KEY
    if (!speedApiKey) {
      console.error("[Lightning] Missing SPEED_API_KEY")
      return NextResponse.json(
        { error: "Server misconfiguration: SPEED_API_KEY missing" },
        { status: 500 }
      )
    }

    // ⚡ Convert BTC → millisatoshis (1 BTC = 100,000,000,000 msats)
    const msats = Math.round(Number(amount) * 100_000_000_000)

    console.log(`[Lightning] Creating invoice for ${amount} BTC = ${msats} msats`)

    // ✅ Use Speed v1 API instead of deprecated v0
    const apiUrl = "https://api.tryspeed.com/v1/invoices"

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats,
        description: `Sirens Fortune Deposit - ${amount} BTC`,
        // optional: metadata, expiry, or callback URL can go here
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

    // ✅ Extract invoice string from Speed response
    const invoice =
      data.invoice ||
      data.paymentRequest ||
      data.payment_request ||
      data.pr ||
      null

    if (!invoice) {
      console.error("[Lightning] Missing invoice field in API response:", data)
      return NextResponse.json(
        { error: "No invoice returned from Speed API" },
        { status: 500 }
      )
    }

    console.log(`[Lightning] Invoice created successfully`)

    return NextResponse.json({
      invoice,
      amount,
      msats,
      id: data.id,
    })
  } catch (err) {
    console.error("[Lightning] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
