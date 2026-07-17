import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";
import { generateAIContent } from "../../../../../lib/ai/providers";
import { getOwnedLecture, parseJsonObject } from "../../../../../lib/api/learnflow";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const lecture = await getOwnedLecture(supabase, user.id, params.id);
    const prompt = `Summarize this lecture for a student. Return ONLY JSON object:
{
  "overview": "...",
  "key_concepts": [{"title":"...", "explanation":"...", "importance":"high|medium|low"}],
  "definitions": [{"term":"...", "definition":"..."}],
  "flowchart": "mermaid graph TD syntax"
}

Lecture: ${lecture.title}
${String(lecture.content || "").slice(0, 12000)}`;
    let summary = null;
    try {
      const result = await generateAIContent(prompt, { maxTokens: 3000 });
      summary = parseJsonObject(result.text);
    } catch {
      summary = null;
    }
    if (!summary || !summary.overview) {
      summary = {
        overview: String(lecture.content || lecture.title).slice(0, 900),
        key_concepts: [{ title: lecture.title, explanation: "Core topic from the lecture.", importance: "high" }],
        definitions: [],
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
