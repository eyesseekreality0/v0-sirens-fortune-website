import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const HELIO_WEBHOOK_SECRET = process.env.HELIO_WEBHOOK_SECRET || ""

// POST /api/helio-webhook
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Log the incoming webhook for debugging
    console.log("📥 Helio Webhook received:", JSON.stringify(body, null, 2))
    
    // Verify webhook signature
    const signature = req.headers.get("helio-signature")
    
    if (HELIO_WEBHOOK_SECRET && signature !== HELIO_WEBHOOK_SECRET) {
      console.error("❌ Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Handle different Helio event types
    const eventType = body.event || body.eventType
    const data = body.data || body
    
    console.log("🔔 Event Type:", eventType)

    // Handle successful payment events
    if (
      eventType === "PAYMENT_SUCCESS" || 
      eventType === "PAYMENT_SUCCESSFUL" || 
      eventType === "success" ||
      data.status === "COMPLETED"
    ) {
      // Extract payment details
      const log = {
        payer_email: data.customerEmail || data.customer?.email || data.email || "Unknown",
        amount: parseFloat(data.amount || data.totalAmount || "0"),
        currency: data.currency || "USD",
        method: data.paymentMethod || data.method || "helio",
        tx_id: data.id || data.transactionId || data.paymentId || `helio_${Date.now()}`,
        metadata: {
          event_type: eventType,
          paylink_id: data.paylinkId,
          transaction_signature: data.transactionSignature,
          blockchain: data.blockchain,
          raw_data: data
        }
      }

      console.log("💰 Processing deposit:", log)

      // Insert into Supabase
      const { data: insertedData, error } = await supabase
        .from("deposits")
        .insert(log)
        .select()

      if (error) {
        console.error("❌ Supabase error:", error)
        throw error
      }

      console.log("✅ Deposit logged successfully:", insertedData)

      return NextResponse.json({
        status: "success",
        message: "Deposit saved to Supabase",
        data: log,
      })
    }

    // Handle pending/processing events
    if (
      eventType === "PAYMENT_PENDING" || 
      eventType === "PAYMENT_PROCESSING" ||
      data.status === "PENDING"
    ) {
      console.log("⏳ Payment pending/processing")
      return NextResponse.json({
        status: "acknowledged",
        message: "Payment pending",
      })
    }

    // Handle failed payments
    if (
      eventType === "PAYMENT_FAILED" || 
      data.status === "FAILED"
    ) {
      console.log("❌ Payment failed")
      return NextResponse.json({
        status: "acknowledged",
        message: "Payment failed",
      })
    }

    // Log unhandled event types
    console.log("ℹ️ Unhandled event type:", eventType)
    return NextResponse.json({
      status: "ignored",
      message: "Event not handled",
      event_type: eventType,
    })

  } catch (err: any) {
    console.error("💥 Helio webhook error:", err)
    return NextResponse.json(
      { 
        error: "Server error",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
      }, 
      { status: 500 }
    )
  }
}

// Optional: Handle GET requests for webhook verification
export async function GET(req: Request) {
  return NextResponse.json({
    status: "ok",
    message: "Helio webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
