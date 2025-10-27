const SPEED_BASE_URL = "https://api.tryspeed.com/v1"
const DEFAULT_FALLBACK_BTC_USD_RATE = 50_000

const FALLBACK_RATE_ENV_KEYS = [
  "SPEED_FALLBACK_BTC_USD",
  "SPEED_FALLBACK_RATE",
  "FALLBACK_BTC_USD_RATE",
  "FALLBACK_BTC_RATE",
  "NEXT_PUBLIC_FALLBACK_BTC_RATE",
]

export function getSpeedBaseUrl() {
  return process.env.SPEED_BASE_URL || SPEED_BASE_URL
}

export function buildSpeedHeaders() {
  const apiKey = process.env.SPEED_API_KEY || ""

  if (!apiKey) {
    return { headers: null, secretKey: "", publishableKey: "", version: undefined }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "x-api-key": apiKey,
  }

  return { headers, secretKey: apiKey, publishableKey: "", version: undefined }
}

export function getSpeedFallbackBtcUsdRate() {
  const env = process.env as Record<string, string | undefined>

  for (const key of FALLBACK_RATE_ENV_KEYS) {
    const raw = env[key]
    if (!raw) continue

    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return DEFAULT_FALLBACK_BTC_USD_RATE
}

export function parseSpeedRate(payload: unknown): number | undefined {
  const tryParse = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string") {
      const parsed = Number(value)
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed
      }
    }
    return undefined
  }

  const queue: unknown[] = []
  if (payload && typeof payload === "object") {
    queue.push((payload as any).rate)
    queue.push((payload as any).price)
    queue.push((payload as any).amount)
    queue.push((payload as any).value)

    const data = (payload as any).data
    if (Array.isArray(data)) {
      for (const item of data) {
        queue.push(parseSpeedRate(item))
      }
    } else if (data && typeof data === "object") {
      queue.push(parseSpeedRate(data))
    }

    const rates = (payload as any).rates
    if (Array.isArray(rates)) {
      for (const item of rates) {
        queue.push(parseSpeedRate(item))
      }
    } else if (rates && typeof rates === "object") {
      queue.push(parseSpeedRate(rates))
    }

    const quote = (payload as any).quote
    if (quote && typeof quote === "object") {
      queue.push(parseSpeedRate(quote))
    }

    const spot = (payload as any).spot
    if (spot && typeof spot === "object") {
      queue.push(parseSpeedRate(spot))
    }
  }

  queue.push(payload)

  for (const candidate of queue) {
    const parsed = tryParse(candidate)
    if (parsed !== undefined) {
      return parsed
    }
  }

  return undefined
}
