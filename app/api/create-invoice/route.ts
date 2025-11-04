// app/api/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amountUsd } = await req.json();

    const amount = Number(amountUsd);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const SPEED_API_KEY = process.env.SPEED_API_KEY;
    if (!SPEED_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: SPEED_API_KEY missing" },
        { status: 500 }
      );
    }

    // Convert USD to sats (approximate - you may want to fetch real-time rate)
    // For now using a simple conversion: $1 = ~1500 sats (adjust based on current BTC price)
    const btcPrice = 100000; // Assume $100k per BTC
    const amountInSats = Math.round((amount / btcPrice) * 100000000);

    // Create a PayRequest using TrySpeed API
    // This generates an LNURL that can be used as a QR code
    const createRes = await fetch("https://api.tryspeed.com/payrequests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEED_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "lnurl", // Lightning URL
        min_amount: amountInSats,
        max_amount: amountInSats,
        expected_currency: "USD",
        statement_descriptor: `Deposit $${amount}`,
      }),
    });

    const payrequest = await createRes.json();
    
    if (!createRes.ok) {
      console.error("TrySpeed PayRequest error:", payrequest);
      return NextResponse.json(
        { error: payrequest?.message || payrequest?.error || "Failed to create payment request" },
        { status: createRes.status }
      );
    }

    // Return the LNURL encoded string for QR code
    return NextResponse.json({
      invoiceId: payrequest.id,
      lightningInvoice: payrequest.encoded, // This is the LNURL for QR code
      hostedUrl: payrequest.url, // Fallback URL
      amount: amount,
      amountSats: amountInSats,
      status: payrequest.status,
    });
  } catch (err) {
    console.error("Invoice creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
