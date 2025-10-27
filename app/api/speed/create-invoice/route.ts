import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amountUsd, userId } = await req.json()

    // Validate amount
    if (!amountUsd || Number(amountUsd) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const speedApiKey = process.env.SPEED_API_KEY
    if (!speedApiKey) {
      console.error("[Speed Invoice] Missing SPEED_API_KEY")
      return NextResponse.json(
        { error: "Server misconfiguration: SPEED_API_KEY missing" },
        { status: 500 }
      )
    }

    // Step 1: Get current BTC/USD rate from Speed API
    console.log(`[Speed Invoice] Fetching BTC price...`)
    
    const rateRes = await fetch("https://api.tryspeed.com/v1/rates?from=BTC&to=USD", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!rateRes.ok) {
      console.error("[Speed Invoice] Failed to fetch BTC rate")
      return NextResponse.json(
        { error: "Failed to fetch current BTC rate" },
        { status: 500 }
      )
    }

    const rateData = await rateRes.json()
    const btcPrice = rateData.rate || 50000 // Fallback price

    console.log(`[Speed Invoice] BTC price: $${btcPrice}`)

    // Step 2: Convert USD to BTC
    const btcAmount = Number(amountUsd) / btcPrice

    // Step 3: Convert BTC to millisatoshis (1 BTC = 100,000,000,000 msats)
    const msats = Math.round(btcAmount * 100_000_000_000)

    console.log(`[Speed Invoice] Creating invoice for $${amountUsd} = ${btcAmount} BTC = ${msats} msats`)

    // Step 4: Create invoice using Speed v1 API
    const invoiceRes = await fetch("https://api.tryspeed.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats,
        description: `Sirens Fortune Deposit - $${amountUsd} USD`,
        metadata: {
          userId: userId || "anonymous",
          amountUsd: amountUsd.toString(),
        },
      }),
    })

    const invoiceData = await invoiceRes.json()

    if (!invoiceRes.ok) {
      console.error("[Speed Invoice] API error:", invoiceData)
      return NextResponse.json(
        { error: invoiceData.message || invoiceData.error || "Failed to create invoice" },
        { status: invoiceRes.status }
      )
    }

    // Step 5: Extract payment request from response
    const paymentRequest =
      invoiceData.invoice ||
      invoiceData.paymentRequest ||
      invoiceData.payment_request ||
      invoiceData.pr ||
      null

    if (!paymentRequest) {
      console.error("[Speed Invoice] Missing payment request in response:", invoiceData)
      return NextResponse.json(
        { error: "No payment request returned from Speed API" },
        { status: 500 }
      )
    }

    console.log(`[Speed Invoice] Invoice created successfully`)

    return NextResponse.json({
      paymentRequest,
      amountUsd,
      btcAmount,
      msats,
      btcPrice,
      invoiceId: invoiceData.id,
    })
  } catch (err) {
    console.error("[Speed Invoice] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
