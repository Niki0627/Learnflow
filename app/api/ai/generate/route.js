import { NextResponse } from "next/server";
import { generateAIContent } from "../../../../lib/ai/providers";
import { readJson } from "../../../../lib/api/errors";
import { getSupabaseRequestContext, apiError } from "../../../../lib/api/auth";
import { checkRateLimit } from "../../../../lib/api/ratelimit";

export const runtime = "nodejs";

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
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // Do not allow client to override provider order maliciously, just rely on defaults or safe list if needed
    // Assuming providerOrder is safe to pass if authenticated, or we can omit it if it's purely for proxy abuse.
    // For now we allow it but it's protected by Auth.
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
    console.error("[ai/generate] Error:", error);
    // Use apiError to return a generic error or specific auth error
    return apiError(error);
  }
}
