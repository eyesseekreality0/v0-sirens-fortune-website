import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const res = await fetch("https://api.hel.io/v1/paylinks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HELIO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Deposit $${amount}`,
        amount: amount.toString(),
        currency: "usd", // or "sol" / "usdc"
        metadata: { purpose: "user deposit" },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Helio API error:", data)
      return NextResponse.json({ error: data.message || "Failed to create paylink" }, { status: res.status })
    }

    return NextResponse.json({ checkoutUrl: data.checkoutUrl })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
