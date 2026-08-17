import { NextResponse } from "next/server";
import { withAuth } from "@lib/api/auth";
import { checkRateLimit } from "@lib/api/ratelimit";
import { generateAIContent } from "@lib/ai/providers";
import { parseJsonArray } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const POST = withAuth<{ id: string }>(async ({ user, supabase }, request, { params }) => {
  const rateLimit = await checkRateLimit(request, user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { id } = await params;
  const body = await readJson(request);
  const { data: syllabusRow, error: syllabusError } = await supabase
    .from("exam_syllabi")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (syllabusError) throw syllabusError;
   
  const syllabus: any = syllabusRow;

  const count = Math.max(1, Math.min(50, Number(body.num_questions || body.count || 10)));
  const prompt = `Generate ${count} likely exam questions. Return ONLY JSON array with question_text, answer, marks, priority, topic, is_from_pattern.
Syllabus:
${String(syllabus.content || "").slice(0, 12000)}`;
   
  let generated: Record<string, any>[] = [];
  try {
    const result = await generateAIContent(prompt, {
      maxTokens: Math.min(6000, count * 300),
    });
    generated = parseJsonArray(result.text);
  } catch {
    generated = [];
  }
  if (!generated.length) {
    generated = Array.from({ length: count }, (_, i) => ({
      question_text: `Explain an important concept from ${syllabus.title} (${i + 1}).`,
      answer:
        "Review the syllabus content and provide a structured answer with examples.",
      marks: 5,
      priority: i + 1,
      topic: syllabus.title,
      is_from_pattern: false,
    }));
  }

  const rows = generated.slice(0, count).map((q, i) => ({
    exam_syllabus_id: syllabus.id,
    question_text: q.question_text || q.question || "",
    answer: q.answer || "",
    marks: Number(q.marks || 5),
    priority: Number(q.priority || i + 1),
    topic: q.topic || syllabus.title,
    is_from_pattern: Boolean(q.is_from_pattern),
  }));
   
  const { data, error } = await (supabase.from("exam_questions") as any).insert(rows).select("*");
  if (error) throw error;
  return Response.json({ questions: data || [], questions_generated: data?.length || 0 });
});
