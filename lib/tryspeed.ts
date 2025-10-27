const SPEED_BASE_URL = "https://api.tryspeed.com/v1"

export function getSpeedBaseUrl() {
  return process.env.SPEED_BASE_URL || SPEED_BASE_URL
}

export function buildSpeedHeaders() {
  const secretKey = process.env.SPEED_SECRET_KEY || process.env.SPEED_API_KEY || ""
  const publishableKey = process.env.SPEED_PUBLISHABLE_KEY || process.env.SPEED_PUBLIC_KEY || ""
  const version = process.env.SPEED_API_VERSION || process.env.SPEED_VERSION

  if (!secretKey && !publishableKey) {
    return { headers: null, secretKey: "", publishableKey: "", version }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (secretKey) {
    headers.Authorization = `Bearer ${secretKey}`
  }

  if (publishableKey) {
    headers["x-api-key"] = publishableKey
  } else if (secretKey) {
    headers["x-api-key"] = secretKey
  }

  if (version) {
    headers["Speed-Version"] = version
  }

  return { headers, secretKey, publishableKey, version }
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
