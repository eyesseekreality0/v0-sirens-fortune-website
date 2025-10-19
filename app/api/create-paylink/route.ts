import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount } = body

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const response = await fetch("https://api.hel.io/v1/paylinks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HELIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: "USD",
        metadata: { note: "Website deposit" },
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/deposit/success`,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to create paylink")

    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
