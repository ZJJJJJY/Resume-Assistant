import { NextResponse } from "next/server";
import type { TrialEvent } from "@/lib/types";

export async function POST(request: Request) {
  const event = (await request.json()) as TrialEvent;
  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ ok: true, mode: "local-only" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "trial_event", event }),
    });

    if (!response.ok) {
      throw new Error(`Trial event webhook failed with status ${response.status}`);
    }

    return NextResponse.json({ ok: true, mode: "webhook" });
  } catch (error) {
    console.error("Trial event webhook failed.", error);
    return NextResponse.json(
      { ok: false, message: "Trial event webhook unavailable." },
      { status: 502 },
    );
  }
}
