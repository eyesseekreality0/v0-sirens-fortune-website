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
    const paylinkId = process.env.HELIO_PAYLINK_ID

    // Validation
    if (!secretKey || !publicKey || !paylinkId) {
      console.error("[Helio] Missing required env variables")
      return NextResponse.json(
        { error: "Helio configuration incomplete" },
        { status: 500 }
      )
    }

    // Create charge from existing paylink via Helio API - PRODUCTION
    // Using the correct endpoint and format from official docs
    const res = await fetch(
      `https://api.hel.io/v1/charge/api-key?apiKey=${publicKey}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentRequestId: paylinkId,
          requestAmount: amount.toString(),
          prepareRequestBody: {
            customerDetails: {
              additionalJSON: "{}",
            },
          },
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error("[Helio] API error:", data)
      return NextResponse.json(
        { error: data.message || data.error || "Failed to create charge" },
        { status: res.status }
      )
    }

    // Return the charge page URL
    return NextResponse.json({
      chargeId: data.id,
      pageUrl: data.pageUrl || data.url,
    })
  } catch (err) {
    console.error("[Helio] Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
