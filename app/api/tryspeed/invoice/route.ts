import { NextRequest, NextResponse } from "next/server"

const SPEED_BASE_URL = "https://api.tryspeed.com/v1"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const amountUsd = typeof body.amountUsd === "number" ? body.amountUsd : Number(body.amountUsd)
    const customerReference = typeof body.customerReference === "string" ? body.customerReference : undefined

    if (!amountUsd || Number.isNaN(amountUsd) || amountUsd <= 0) {
      return NextResponse.json(
        { error: "A valid USD amount is required." },
        { status: 400 },
      )
    }

    const apiKey = process.env.SPEED_API_KEY
    if (!apiKey) {
      console.error("[TrySpeed] Missing SPEED_API_KEY environment variable")
      return NextResponse.json(
        { error: "Server misconfiguration. Try again later." },
        { status: 500 },
      )
    }

    // Fetch the latest BTC/USD rate from TrySpeed so we can convert USD to millisatoshis.
    const rateResponse = await fetch(
      `${SPEED_BASE_URL}/rates?from=BTC&to=USD`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    )

    if (!rateResponse.ok) {
      const error = await safeJson(rateResponse)
      console.error("[TrySpeed] Failed to fetch BTC/USD rate", error)
      return NextResponse.json(
        { error: "Unable to fetch current BTC rate." },
        { status: 502 },
      )
    }

    const rateData = await rateResponse.json()
    const rawRate =
      typeof rateData.rate === "number"
        ? rateData.rate
        : typeof rateData.rate === "string"
          ? Number(rateData.rate)
          : typeof rateData?.data?.rate === "number"
            ? rateData.data.rate
            : typeof rateData?.data?.rate === "string"
              ? Number(rateData.data.rate)
              : undefined

    const btcPerUsd = rawRate && Number.isFinite(rawRate) ? 1 / rawRate : undefined

    if (!btcPerUsd) {
      console.error("[TrySpeed] Unexpected rate payload", rateData)
      return NextResponse.json(
        { error: "Unexpected response from rate service." },
        { status: 502 },
      )
    }

    const btcAmount = amountUsd * btcPerUsd
    const msats = Math.round(btcAmount * 100_000_000_000)

    if (!Number.isFinite(msats) || msats <= 0) {
      console.error("[TrySpeed] Calculated millisatoshi amount is invalid", { amountUsd, btcAmount, msats })
      return NextResponse.json(
        { error: "Unable to calculate invoice amount." },
        { status: 500 },
      )
    }

    const invoiceResponse = await fetch(`${SPEED_BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amountMsats: msats,
        description: `Sirens Fortune deposit (${amountUsd.toFixed(2)} USD)`,
        metadata: {
          usdAmount: amountUsd,
          customerReference,
          source: "sirens-fortune-web",
        },
      }),
    })

    const invoicePayload = await safeJson(invoiceResponse)

    if (!invoiceResponse.ok) {
      console.error("[TrySpeed] Invoice creation failed", invoicePayload)
      return NextResponse.json(
        { error: invoicePayload?.message || invoicePayload?.error || "Failed to create Lightning invoice." },
        { status: invoiceResponse.status },
      )
    }

    const paymentRequest =
      invoicePayload?.paymentRequest ||
      invoicePayload?.invoice ||
      invoicePayload?.lightningInvoice ||
      invoicePayload?.encodedPaymentRequest ||
      invoicePayload?.data?.paymentRequest

    if (typeof paymentRequest !== "string" || paymentRequest.length === 0) {
      console.error("[TrySpeed] Invoice response did not include a payment request", invoicePayload)
      return NextResponse.json(
        { error: "Invoice created but no payment request was returned." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      invoice: paymentRequest,
      invoiceId: invoicePayload?.id ?? invoicePayload?.invoiceId ?? null,
      msats,
      btcAmount,
      amountUsd,
      expiresAt: invoicePayload?.expiresAt ?? invoicePayload?.expiry ?? null,
    })
  } catch (error) {
    console.error("[TrySpeed] Unexpected server error", error)
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 })
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch (error) {
    console.warn("[TrySpeed] Failed to parse JSON response", error)
    return null
  }
}
