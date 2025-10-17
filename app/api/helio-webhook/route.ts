import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const HELIO_WEBHOOK_SECRET = process.env.HELIO_WEBHOOK_SECRET || ""

// ✅ POST /api/helio-webhook
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get("helio-signature")

    if (!signature || signature !== HELIO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const eventType = body.eventType
    const data = body.data

    if (eventType === "PAYMENT_SUCCESSFUL" && data) {
      const log = {
        payer_email: data.customerEmail || "Unknown",
        amount: data.amount,
        currency: data.currency,
        method: data.paymentMethod || "unknown",
        tx_id: data.id,
      }

      const { error } = await supabase.from("deposits").insert(log)

      if (error) throw error

      console.log("💰 Deposit logged:", log)

      return NextResponse.json({
        status: "success",
        message: "Deposit saved to Supabase",
        data: log,
      })
    }

    return NextResponse.json({
      status: "ignored",
      message: "Event not handled",
    })
  } catch (err: any) {
    console.error("Helio webhook error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
