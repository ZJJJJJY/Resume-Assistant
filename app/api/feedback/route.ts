import { NextResponse } from "next/server";
import type { ResultFeedback } from "@/lib/types";

export async function POST(request: Request) {
  const feedback = (await request.json()) as ResultFeedback;
  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ ok: true, mode: "local-only" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(`Feedback webhook failed with status ${response.status}`);
    }

    return NextResponse.json({ ok: true, mode: "webhook" });
  } catch (error) {
    console.error("Feedback webhook failed.", error);
    return NextResponse.json(
      { ok: false, message: "Feedback webhook unavailable." },
      { status: 502 },
    );
  }
}
