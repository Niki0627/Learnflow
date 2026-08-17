import { NextResponse } from "next/server";
import { withAuth } from "@lib/api/auth";
import { checkRateLimit } from "@lib/api/ratelimit";
import { readJson } from "@lib/api/errors";
import { generateAIContent } from "@lib/ai/providers";

export const runtime = "nodejs";

export const POST = withAuth(async ({ user }, request) => {
  const rateLimit = await checkRateLimit(request, user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await readJson(request);
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
});
