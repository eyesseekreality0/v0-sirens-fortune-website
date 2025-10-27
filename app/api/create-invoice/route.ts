// app/api/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amountUsd, customer } = await req.json();

    const amount = Number(amountUsd);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const SPEED_API_KEY = process.env.SPEED_API_KEY; // e.g. sk_test_...
    if (!SPEED_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: SPEED_API_KEY missing" },
        { status: 500 }
      );
    }

    // HTTP Basic auth per TrySpeed docs: username = secret key, password = empty
    const authHeader =
      "Basic " + Buffer.from(`${SPEED_API_KEY}:`).toString("base64");

    // 1) Create a DRAFT invoice in USD with a custom line item
    const createRes = await fetch("https://api.tryspeed.com/invoices", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "USD",
        // optionally attach/inline a customer (either customer_id OR object)
        ...(customer?.id
          ? { customer_id: customer.id }
          : customer?.name || customer?.email
          ? { customer: { name: customer.name, email: customer.email } }
          : {}),
        invoice_line_items: [
          {
            type: "custom_line_item",
            name: "Deposit",
            unit_amount: amount, // TrySpeed expects a decimal number, not cents
            quantity: 1,
          },
        ],
      }),
    });

    const draft = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json(
        { error: draft?.message || draft?.error || "Create invoice failed" },
        { status: createRes.status }
      );
    }

    // 2) Finalize the invoice so it's payable and has a hosted URL
    const finalizeRes = await fetch(
      `https://api.tryspeed.com/invoices/${draft.id}/finalize`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    const finalized = await finalizeRes.json();
    if (!finalizeRes.ok) {
      return NextResponse.json(
        {
          error:
            finalized?.message || finalized?.error || "Finalize invoice failed",
        },
        { status: finalizeRes.status }
      );
    }

    // Return what the client needs
    return NextResponse.json({
      invoiceId: finalized.id,
      hostedUrl: finalized.hosted_invoice_url, // scan/open this to pay (Lightning on Speed's page)
      currency: finalized.currency,
      amount: finalized.invoice_amount,
      status: finalized.status,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
