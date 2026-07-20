import { NextResponse } from "next/server";
import { generateAIContent } from "../../../../lib/ai/providers";
import { readJson } from "../../../../lib/api/errors";
import { getSupabaseRequestContext } from "../../../../lib/api/auth";
import { checkRateLimit } from "../../../../lib/api/ratelimit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Concept Coach AI, an expert personal tutor.
- Do not give the full answer immediately unless the learner has clearly earned it.
- Guide with targeted questions, hints, partial steps, and warm corrections.
- Use markdown for formulas, lists, and key terms.
- End with a guiding question that keeps the learner thinking.`;

export async function POST(request) {
  try {
    // Authenticate the request
    await getSupabaseRequestContext(request);

    // Apply Rate Limiting
    const rateLimit = await checkRateLimit(request, 10, 60000); // 10 requests per minute
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await readJson(request);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const chatHistory = Array.isArray(body.chat_history) ? body.chat_history.slice(-4) : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const context = chatHistory
      .map((msg) => `${msg.role === "assistant" ? "Concept Coach" : "Student"}: ${msg.content || ""}`)
      .join("\n\n");

    const result = await generateAIContent(`${SYSTEM_PROMPT}

CONVERSATION SO FAR:
${context || "(This is the start of the conversation)"}

Student: ${message}

Concept Coach AI:`, { maxTokens: 1000 });

    return NextResponse.json({
      response: result.text,
      hints: [],
      suggestions: [],
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("[ai-tutor/chat] Error:", error);
    
    // Instead of raw error details, send generic message
    return NextResponse.json({
      response: "Concept Coach is currently unavailable. Please try again later.",
      hints: [],
      suggestions: [],
      is_error: true,
    }, { status: error.status && error.status !== 200 ? error.status : 500 });
  }
}
