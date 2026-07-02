import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY environment variable is not configured on the server." }, { status: 500 });
    }

    const systemPrompt = `You are O.C.R.A AI Core, an advanced AI intelligence assistant for the Karnataka State Police and Internal Security Division (ISD).
You assist investigating officers with criminal intelligence analysis, FIR forensic breakdowns, syndicate tracking, ANPR vehicle telemetry, and legal directives.
When the user greets you or speaks casually (e.g. "hi", "hello", "say hi", "yo"), respond warmly, naturally, and concisely.
CRITICAL: Never ask for security clearance levels (such as ISD-1 to ISD-5) or act like a robotic gatekeeper. Be helpful, direct, and conversational at all times.`;

    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-6).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: prompt }
    ];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messagesPayload,
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json();
      throw new Error(errData.error?.message || "Groq API call failed.");
    }

    const groqData = await groqRes.json();
    const replyText = groqData.choices[0]?.message?.content || "ORCA AI Core processed your query.";

    return NextResponse.json({ success: true, text: replyText });
  } catch (error: any) {
    console.error("[Groq Chat API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response." }, { status: 500 });
  }
}
