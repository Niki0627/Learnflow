import { NextResponse } from "next/server";
import { generateAIContent } from "../../../../lib/ai/providers";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const result = await generateAIContent(prompt, {
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      providerOrder: body.providerOrder,
    });

    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
