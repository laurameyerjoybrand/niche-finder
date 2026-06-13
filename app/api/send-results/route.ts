// app/api/send-results/route.ts
//
// Receives the Niche Finder submission from the page, attaches the shared
// secret, and forwards it to the n8n webhook. The browser never calls n8n
// directly, so there's no CORS problem and the secret stays server-side.
//
// Vercel environment variables required (Production + Preview):
//   RESULTS_WEBHOOK_URL  = the n8n production webhook URL
//   APP_SHARED_SECRET    = the long random string the n8n Validate node checks

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, result, answers } = body ?? {};

    if (!name || !email || !result) {
      return NextResponse.json(
        { error: "Missing name, email, or result." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.RESULTS_WEBHOOK_URL;
    const secret = process.env.APP_SHARED_SECRET;
    if (!webhookUrl || !secret) {
      return NextResponse.json({ error: "Server not configured." }, { status: 500 });
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        timestamp: new Date().toISOString(),
        name,
        email,
        nicheStatement: result.nicheStatement ?? "",
        idealClient: result.idealClient ?? "",
        conversationStarter: result.conversationStarter ?? "",
        answers: Array.isArray(answers) ? answers : [],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not send your results. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
