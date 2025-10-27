import { NextRequest, NextResponse } from "next/server"

import {
  buildSpeedHeaders,
  getSpeedBaseUrl,
  getSpeedFallbackBtcUsdRate,
  parseSpeedRate,
} from "@/lib/tryspeed"

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

    const { headers } = buildSpeedHeaders()
    if (!headers) {
      console.error("[TrySpeed] Missing Speed credentials. Set SPEED_API_KEY.")
      return NextResponse.json(
        { error: "Server misconfiguration. Try again later." },
        { status: 500 },
      )
    }

    const liveRate = await fetchBtcUsdRate(headers)
    let rateUsed =
      liveRate !== undefined && Number.isFinite(liveRate) && liveRate > 0 ? liveRate : undefined
    let rateSource: "live" | "fallback" | "client" | undefined = rateUsed ? "live" : undefined

    if (!rateUsed) {
      const fallbackRate = getSpeedFallbackBtcUsdRate()
      if (Number.isFinite(fallbackRate) && fallbackRate > 0) {
        rateUsed = fallbackRate
        rateSource = "fallback"
        console.warn("[TrySpeed] Falling back to static BTC/USD rate for invoice", {
          fallbackRate,
        })
      }
    }

    const btcAmountFromClient =
      typeof body.btcAmount === "number"
        ? body.btcAmount
        : typeof body.btcAmount === "string"
          ? Number(body.btcAmount)
          : undefined

    let btcAmount =
      rateUsed !== undefined ? amountUsd / rateUsed : undefined

    if (
      (btcAmount === undefined || !Number.isFinite(btcAmount)) &&
      btcAmountFromClient !== undefined &&
      Number.isFinite(btcAmountFromClient)
    ) {
      btcAmount = btcAmountFromClient
      if (!rateSource) {
        rateSource = "client"
      }
      rateUsed = rateSource === "client" ? undefined : rateUsed
    }

    const msats =
      btcAmount !== undefined && Number.isFinite(btcAmount)
        ? Math.round(btcAmount * 100_000_000_000)
        : undefined

    const payload: Record<string, unknown> = {
      description: `Sirens Fortune deposit (${amountUsd.toFixed(2)} USD)`,
      metadata: {
        usdAmount: amountUsd,
        customerReference,
        source: "sirens-fortune-web",
      },
    }

    if (msats && msats > 0) {
      payload.amountMsats = msats
    } else {
      payload.amountUsd = amountUsd
    }

    const baseUrl = getSpeedBaseUrl()

    const invoiceResponse = await fetch(`${baseUrl}/invoices`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
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

    const responseBody: Record<string, unknown> = {
      invoice: paymentRequest,
      invoiceId: invoicePayload?.id ?? invoicePayload?.invoiceId ?? null,
      amountUsd,
      expiresAt: invoicePayload?.expiresAt ?? invoicePayload?.expiry ?? null,
    }

    if (msats && msats > 0) {
      responseBody.msats = msats
      if (btcAmount !== undefined && Number.isFinite(btcAmount)) {
        responseBody.btcAmount = btcAmount
      }
    } else if (invoicePayload?.amountMsats) {
      const parsedMsats = Number(invoicePayload.amountMsats)
      if (Number.isFinite(parsedMsats)) {
        responseBody.msats = parsedMsats
        responseBody.btcAmount = parsedMsats / 100_000_000_000
      }
    }

    if (rateUsed !== undefined) {
      responseBody.rate = rateUsed
    }

    if (rateSource) {
      responseBody.rateSource = rateSource
      if (rateSource === "fallback") {
        responseBody.rateStale = true
      }
    }

    return NextResponse.json(responseBody)
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

async function fetchBtcUsdRate(headers: HeadersInit) {
  const baseUrl = getSpeedBaseUrl()
  const endpoints = [
    `${baseUrl}/rates?from=BTC&to=USD`,
    `${baseUrl}/rates/latest?from=BTC&to=USD`,
    `${baseUrl}/exchange-rates?fromCurrency=BTC&toCurrency=USD`,
    `${baseUrl}/exchange-rates/latest?fromCurrency=BTC&toCurrency=USD`,
    `${baseUrl}/exchange-rates/spot?fromCurrency=BTC&toCurrency=USD`,
    `${baseUrl}/prices?base=BTC&quote=USD`,
  ]

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })
      const payload = await safeJson(response)

      if (!response.ok) {
        console.warn("[TrySpeed] Rate fetch attempt failed", { url, status: response.status, payload })
        continue
      }

      const rate = parseSpeedRate(payload)
      if (rate !== undefined) {
        return rate
      }

      console.warn("[TrySpeed] Rate fetch returned unexpected payload", { url, payload })
    } catch (error) {
      console.warn("[TrySpeed] Rate fetch threw", { url, error })
    }
  }

  return undefined
}
