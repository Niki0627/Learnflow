import { apiError, getRequestContext } from "@lib/api/auth";
import { generateAIContent } from "@lib/ai/providers";
import { parseJsonObject } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await getRequestContext();
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
  } catch (error) {
    return apiError(error);
  }
}
