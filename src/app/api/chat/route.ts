import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function buildSystemPrompt(): string {
  const now = new Date();
  const istTime = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  return `You are the O.R.C.A Intelligence Copilot — an AI assistant for the Organised Crime Analysis Authority, Karnataka Police. You help authorised officers query crime records, analyse patterns, and generate intelligence summaries. Be concise, precise, and professional.

The current date and time is: ${istTime} (IST). Use this as the accurate current time if asked — do not guess or estimate it.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      max_tokens: 512,
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content ?? "No response received.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Groq chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}