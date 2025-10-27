import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { amountUsd, userId } = await req.json();

    if (!amountUsd || Number(amountUsd) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const speedApiKey = process.env.SPEED_API_KEY;
    if (!speedApiKey) {
      console.error("[Speed] Missing SPEED_API_KEY");
      return NextResponse.json({ error: "Missing SPEED_API_KEY" }, { status: 500 });
    }

    // --- Get BTC/USD rate server-side ---
    const rateRes = await fetch("https://api.tryspeed.com/v1/rates?from=BTC&to=USD", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!rateRes.ok) {
      const text = await rateRes.text();
      console.error("[Speed] Rate fetch failed:", text);
      return NextResponse.json({ error: "Failed to fetch BTC rate" }, { status: 502 });
    }

    const rateData = await rateRes.json();
    const btcPrice = Number(rateData?.rate);
    if (!btcPrice || isNaN(btcPrice)) {
      return NextResponse.json({ error: "Invalid BTC rate data" }, { status: 502 });
    }

    const btcAmount = Number(amountUsd) / btcPrice;
    const msats = Math.round(btcAmount * 100_000_000_000);

    // --- Create Lightning invoice ---
    const invoiceRes = await fetch("https://api.tryspeed.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats,
        description: `Sirens Fortune Deposit - $${amountUsd} USD`,
        metadata: {
          userId: userId || "anonymous",
          amountUsd: amountUsd.toString(),
        },
      }),
    });

    const invoiceData = await invoiceRes.json();
    if (!invoiceRes.ok) {
      console.error("[Speed] Invoice error:", invoiceData);
      return NextResponse.json(
        { error: invoiceData.message || invoiceData.error || "Failed to create invoice" },
        { status: invoiceRes.status }
      );
    }

    const paymentRequest =
      invoiceData.invoice ||
      invoiceData.paymentRequest ||
      invoiceData.payment_request ||
      invoiceData.pr;

    if (!paymentRequest) {
      console.error("[Speed] Missing paymentRequest:", invoiceData);
      return NextResponse.json({ error: "No payment request returned" }, { status: 502 });
    }

    return NextResponse.json({
      paymentRequest,
      amountUsd,
      btcAmount,
      btcPrice,
      msats,
      invoiceId: invoiceData.id,
    });
  } catch (err) {
    console.error("[Speed] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
