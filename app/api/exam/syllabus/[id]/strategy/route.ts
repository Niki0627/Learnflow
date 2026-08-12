import { apiError, getRequestContext } from "@lib/api/auth";
import { generateAIContent } from "@lib/ai/providers";
import { parseJsonObject } from "@lib/api/learnflow";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();
    const { data: syllabusRow, error } = await supabase
      .from("exam_syllabi")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error) throw error;
    const syllabus: any = syllabusRow;

    const prompt = `Create an exam strategy. Return ONLY JSON object with overview, high_priority_topics, time_plan, scoring_tips.
Syllabus:
${String(syllabus.content || "").slice(0, 12000)}`;
    let strategy: Record<string, any> | null = null;
    try {
      const result = await generateAIContent(prompt, { maxTokens: 2500 });
      strategy = parseJsonObject(result.text);
    } catch {
      strategy = null;
    }
    return Response.json({
      strategy: strategy || {
        overview:
          "Prioritize high-mark topics, practice previous patterns, and revise weak areas daily.",
        high_priority_topics: [syllabus.title],
        time_plan: ["First pass: concepts", "Second pass: questions", "Final pass: revision"],
        scoring_tips: [
          "Show steps clearly",
          "Use diagrams where helpful",
          "Attempt known questions first",
        ],
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
