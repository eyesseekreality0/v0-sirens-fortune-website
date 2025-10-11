"use server"

export async function createCryptoOnrampSession() {
  try {
    const response = await fetch("https://api.stripe.com/v1/crypto/onramp_sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "transaction_details[destination_currency]": "usdc",
        "transaction_details[destination_network]": "ethereum",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Stripe API error:", error)
      throw new Error("Failed to create onramp session")
    }

    const session = await response.json()
    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("[v0] Error creating crypto onramp session:", error)
    throw error
  }
}
