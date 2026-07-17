import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";
import { generateAIContent } from "../../../../../lib/ai/providers";
import { getOwnedLecture, parseJsonObject } from "../../../../../lib/api/learnflow";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const lecture = await getOwnedLecture(supabase, user.id, id);
    const prompt = `Summarize this lecture for a student. Return ONLY a JSON object exactly matching this schema:
{
  "tldr": "A 1-2 sentence extremely brief summary",
  "overview": "A detailed paragraph explaining the main topic.",
  "key_concepts": [{"name": "Concept Name", "description": "Explanation", "importance": "high|medium|low"}],
  "definitions": [{"term": "Term", "definition": "Meaning"}],
  "relationships": "A paragraph explaining how the main concepts connect to each other.",
  "exam_bullets": ["Short, punchy bullet points of highly testable facts", "Keep them under 15 words"],
  "memory_anchors": ["Mnemonics, analogies, or vivid examples to help remember hard concepts"],
  "flowchart": "mermaid graph TD syntax to visually show connections. ONLY output the raw flowchart text, no markdown code block backticks."
}

Lecture: ${lecture.title}
${String(lecture.content || "").slice(0, 12000)}`;
    let summary = null;
    try {
      const result = await generateAIContent(prompt, { maxTokens: 4000 });
      summary = parseJsonObject(result.text);
    } catch {
      summary = null;
    }
    if (!summary || !summary.overview) {
      summary = {
        tldr: "Could not generate full summary.",
        overview: String(lecture.content || lecture.title).slice(0, 900),
        key_concepts: [{ name: lecture.title, description: "Core topic from the lecture.", importance: "high" }],
        definitions: [],
        relationships: "The core concept forms the foundation for understanding this lecture.",
        exam_bullets: ["Review the main lecture content."],
        memory_anchors: [],
        flowchart: `graph TD\nA["${lecture.title.replace(/"/g, "'")}"] --> B["Review notes"]\nB --> C["Practice questions"]`,
      };
    }

    await supabase
      .from("lecture_notes")
      .update({ study_notes: summary.overview })
      .eq("id", lecture.id)
      .eq("user_id", user.id);

    return Response.json({ summary });
  } catch (error) {
    return apiError(error);
  }
}
