// FILE 1: app/api/lightning/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const speedApiKey = process.env.SPEED_API_KEY
    const lightningAddress = process.env.LIGHTNING_ADDRESS
    const environment = process.env.SPEED_ENV || "testnet"

    if (!speedApiKey || !lightningAddress) {
      console.error("[Lightning] Missing required env variables")
      return NextResponse.json(
        { error: "Lightning configuration incomplete" },
        { status: 500 }
      )
    }

    const apiUrl = environment === "testnet" 
      ? "https://testnet.tryspeed.com/api/v0/invoices" 
      : "https://app.tryspeed.com/api/v0/invoices"

    const satoshis = Math.round(Number(amount) * 100_000_000)
    const msats = satoshis * 1000

    console.log(`[Lightning] Creating invoice for ${amount} BTC = ${satoshis} sats = ${msats} msats`)

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats: msats,
        description: `Sirens Fortune Deposit - ${amount} BTC`,
        recipientAddress: lightningAddress,
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

    console.log(`[Lightning] Invoice created: ${data.invoice?.substring(0, 50)}...`)

    return NextResponse.json({
      invoice: data.invoice || data.paymentRequest || data.pr,
      amount: amount,
      satoshis: satoshis,
      msats: msats,
      id: data.id,
    })
  } catch (err) {
    console.error("[Lightning] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
