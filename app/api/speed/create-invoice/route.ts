// app/api/speed/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

// Force Node runtime so env + TLS work predictably
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { amountUsd, userId } = await req.json();

    // Basic validation
    const usd = Number(amountUsd);
    if (!usd || usd <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const speedApiKey = process.env.SPEED_API_KEY;
    if (!speedApiKey) {
      console.error("[Speed] Missing SPEED_API_KEY");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 1) Get BTC/USD rate (SERVER-SIDE → not subject to CORS)
    // If your Speed account requires auth for rates, we send the bearer token.
    const rateRes = await fetch(
      "https://api.tryspeed.com/v1/rates?from=BTC&to=USD",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${speedApiKey}`, // harmless if not required
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!rateRes.ok) {
      const text = await rateRes.text();
      console.error("[Speed] Rate fetch failed:", text);
      return NextResponse.json({ error: "Failed to fetch BTC rate" }, { status: 502 });
    }

    const rateData = await rateRes.json();
    // Adjust if your response shape differs (e.g., { rate: 68000 })
    const btcPrice = Number(rateData?.rate);
    if (!btcPrice) {
      return NextResponse.json({ error: "BTC rate missing in response" }, { status: 502 });
    }

    // 2) Convert USD → BTC → msats
    const btcAmount = usd / btcPrice;
    const msats = Math.round(btcAmount * 100_000_000_000); // 1 BTC = 100B msats

    // 3) Create invoice via Speed (SERVER-SIDE)
    const invoiceRes = await fetch("https://api.tryspeed.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats,
        description: `Sirens Fortune Deposit - $${usd} USD`,
        metadata: { userId: userId || "anonymous", amountUsd: String(usd) },
      }),
    });

    const invoiceData = await invoiceRes.json();

    if (!invoiceRes.ok) {
      console.error("[Speed] Invoice creation error:", invoiceData);
      return NextResponse.json(
        { error: invoiceData?.message || invoiceData?.error || "Failed to create invoice" },
        { status: invoiceRes.status }
      );
    }

    const paymentRequest =
      invoiceData.invoice ||
      invoiceData.paymentRequest ||
      invoiceData.payment_request ||
      invoiceData.pr;

    if (!paymentRequest) {
      console.error("[Speed] Missing payment request in response:", invoiceData);
      return NextResponse.json({ error: "No payment request returned" }, { status: 502 });
    }

    return NextResponse.json({
      paymentRequest,
      amountUsd: usd,
      btcAmount,
      msats,
      btcPrice,
      invoiceId: invoiceData.id,
    });
  } catch (err) {
    console.error("[Speed] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
