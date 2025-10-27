import { NextRequest, NextResponse } from "next/server"

import { buildSpeedHeaders, getSpeedBaseUrl, parseSpeedRate } from "@/lib/tryspeed"

export async function GET(req: NextRequest) {
  const { headers } = buildSpeedHeaders()

  if (!headers) {
    console.error("[TrySpeed] Missing Speed credentials. Set SPEED_API_KEY.")
    return NextResponse.json(
      { error: "Server misconfiguration. Try again later." },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(req.url)
  const from = (searchParams.get("from") || "BTC").toUpperCase()
  const to = (searchParams.get("to") || "USD").toUpperCase()

  try {
    const rate = await fetchRate(headers, from, to)

    if (rate === undefined) {
      return NextResponse.json(
        { error: "Unable to fetch rate." },
        { status: 502 },
      )
    }

    return NextResponse.json({ rate, from, to })
  } catch (error) {
    console.error("[TrySpeed] Unexpected rate error", error)
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

async function fetchRate(headers: HeadersInit, from: string, to: string) {
  const baseUrl = getSpeedBaseUrl()
  const endpoints = [
    `${baseUrl}/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    `${baseUrl}/rates/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    `${baseUrl}/exchange-rates?fromCurrency=${encodeURIComponent(from)}&toCurrency=${encodeURIComponent(to)}`,
    `${baseUrl}/exchange-rates/latest?fromCurrency=${encodeURIComponent(from)}&toCurrency=${encodeURIComponent(to)}`,
    `${baseUrl}/exchange-rates/spot?fromCurrency=${encodeURIComponent(from)}&toCurrency=${encodeURIComponent(to)}`,
    `${baseUrl}/prices?base=${encodeURIComponent(from)}&quote=${encodeURIComponent(to)}`,
  ]

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })
      const payload = await safeJson(response)

      if (!response.ok) {
        console.warn("[TrySpeed] Rate endpoint returned non-OK status", { url, status: response.status, payload })
        continue
      }

      const rate = parseSpeedRate(payload)
      if (rate !== undefined) {
        return rate
      }

      console.warn("[TrySpeed] Rate endpoint returned unexpected payload", { url, payload })
    } catch (error) {
      console.warn("[TrySpeed] Rate endpoint failed", { url, error })
    }
  }

  return undefined
}
