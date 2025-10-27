// app/api/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// tiny helper: safe JSON fetch with no caching
async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  try { return { ok: res.ok, data: text ? JSON.parse(text) : null, status: res.status, raw: text }; }
  catch { return { ok: res.ok, data: null, status: res.status, raw: text }; }
}

export async function POST(req: NextRequest) {
  try {
    const { amountUsd, userId } = await req.json();
    const usd = Number(amountUsd);
    if (!usd || usd <= 0) {
      return NextResponse.json({ error: "Invalid USD amount" }, { status: 400 });
    }

    const speedApiKey = process.env.SPEED_API_KEY;
    if (!speedApiKey) {
      return NextResponse.json({ error: "Missing SPEED_API_KEY" }, { status: 500 });
    }

    // ---- Server-side USD -> BTC conversion (no browser calls) ----
    // Use public fallback first to avoid any CORS/rate errors leaking to client.
    // 1) CoinGecko
    let btcPrice = 0;
    {
      const r = await getJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      if (r.ok) btcPrice = Number(r.data?.bitcoin?.usd) || 0;
    }
    // 2) Coinbase fallback
    if (!btcPrice) {
      const r = await getJson("https://api.coinbase.com/v2/prices/BTC-USD/spot");
      if (r.ok) btcPrice = Number(r.data?.data?.amount) || 0;
    }
    // 3) Last resort static so invoices still get created
    if (!btcPrice) btcPrice = 50000;

    const btcAmount = usd / btcPrice;
    const msats = Math.round(btcAmount * 100_000_000_000); // 1 BTC = 100B msats
    if (!msats || msats <= 0) {
      return NextResponse.json({ error: "Failed to compute BTC amount" }, { status: 502 });
    }

    // ---- Create invoice at TrySpeed (server-to-server) ----
    const invRes = await fetch("https://api.tryspeed.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${speedApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msats,
        description: `Deposit - $${usd} USD`,
        metadata: { userId: userId || "anonymous", amountUsd: String(usd) },
      }),
    });

    const invText = await invRes.text();
    let invJson: any = null;
    try { invJson = invText ? JSON.parse(invText) : null; } catch {}

    if (!invRes.ok) {
      const msg = invJson?.message || invJson?.error || invText || "Failed to create invoice";
      return NextResponse.json({ error: msg }, { status: invRes.status || 502 });
    }

    const paymentRequest =
      invJson?.invoice ||
      invJson?.paymentRequest ||
      invJson?.payment_request ||
      invJson?.pr;

    if (!paymentRequest) {
      return NextResponse.json({ error: "No payment request returned" }, { status: 502 });
    }

    return NextResponse.json({
      paymentRequest,
      amountUsd: usd,
      btcAmount,
      btcPrice,
      msats,
      invoiceId: invJson?.id,
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// JSON 405s for other verbs (prevents HTML error pages breaking your client .json())
export async function GET() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return GET(); }
export async function PATCH() { return GET(); }
export async function DELETE() { return GET(); }
export async function OPTIONS() { return NextResponse.json({ ok: true }); }
