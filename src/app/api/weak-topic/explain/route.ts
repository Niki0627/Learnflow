import { NextResponse } from "next/server";
import { withAuth } from "@lib/api/auth";
import { checkRateLimit } from "@lib/api/ratelimit";
import { generateAIContent } from "@lib/ai/providers";
import { parseJsonObject } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

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
  const prompt = `Explain this weak topic for a student. Return ONLY JSON object with summary, why_it_matters, steps, practice_tip.
Topic: ${body.topic}
Subject: ${body.subject || "General"}`;
   
  let data: Record<string, any> | null = null;
  try {
    const result = await generateAIContent(prompt, { maxTokens: 1400 });
    data = parseJsonObject(result.text);
  } catch {
    data = null;
  }
  return Response.json({
    data: data || {
      summary: `${body.topic} is worth reviewing carefully.`,
      why_it_matters: "It appears in your practice history or selected study flow.",
      steps: ["Review the definition", "Work through one example", "Attempt related MCQs"],
      practice_tip: "Explain the idea aloud before checking notes.",
    },
  });
});
