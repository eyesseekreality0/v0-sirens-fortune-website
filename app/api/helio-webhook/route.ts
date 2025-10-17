import { NextResponse } from "next/server"

// ✅ Replace this with your actual Helio Webhook Secret from the Helio Dashboard
const HELIO_WEBHOOK_SECRET = process.env.HELIO_WEBHOOK_SECRET || "your_helio_webhook_secret_here"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 🔒 Verify webhook signature
    const signature = req.headers.get("helio-signature")
    if (!signature || signature !== HELIO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const eventType = body.eventType
    const data = body.data

    // Only handle successful deposits
    if (eventType === "PAYMENT_SUCCESSFUL" && data) {
      const log = {
        id: data.id,
        payerEmail: data.customerEmail || "Unknown",
        amount: data.amount,
        currency: data.currency,
        method: data.paymentMethod || "unknown",
        time: new Date().toISOString(),
      }

      // 🗃️ Simple local logging for now
      console.log("💰 New Deposit Logged:", log)

      // (Optional) Save to database here (Supabase, Firebase, MongoDB, etc.)

      return NextResponse.json({
        status: "success",
        message: "Deposit recorded successfully",
        data: log,
      })
    }

    return NextResponse.json({
      status: "ignored",
      message: "Event type not handled",
    })
  } catch (err: any) {
    console.error("Helio webhook error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
