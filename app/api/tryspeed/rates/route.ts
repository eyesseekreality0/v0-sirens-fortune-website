import { NextRequest, NextResponse } from "next/server"

const SPEED_BASE_URL = "https://api.tryspeed.com/v1"

export async function GET(req: NextRequest) {
  const apiKey = process.env.SPEED_API_KEY
  if (!apiKey) {
    console.error("[TrySpeed] Missing SPEED_API_KEY environment variable")
    return NextResponse.json(
      { error: "Server misconfiguration. Try again later." },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(req.url)
  const from = (searchParams.get("from") || "BTC").toUpperCase()
  const to = (searchParams.get("to") || "USD").toUpperCase()

  try {
    const response = await fetch(
      `${SPEED_BASE_URL}/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    )

    const payload = await safeJson(response)

    if (!response.ok) {
      console.error("[TrySpeed] Rate request failed", payload)
      return NextResponse.json(
        { error: payload?.message || payload?.error || "Unable to fetch rate." },
        { status: response.status },
      )
    }

    const rawRate =
      typeof payload?.rate === "number"
        ? payload.rate
        : typeof payload?.rate === "string"
          ? Number(payload.rate)
          : typeof payload?.data?.rate === "number"
            ? payload.data.rate
            : typeof payload?.data?.rate === "string"
              ? Number(payload.data.rate)
              : undefined

    if (!rawRate || !Number.isFinite(rawRate)) {
      console.error("[TrySpeed] Unexpected rate payload", payload)
      return NextResponse.json(
        { error: "Unexpected response from rate service." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      rate: rawRate,
      from,
      to,
    })
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
