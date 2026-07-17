import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";
import { generateAIContent } from "../../../lib/ai/providers";
import { getOwnedLecture, parseJsonObject } from "../../../lib/api/learnflow";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await request.json();
    const lecture = await getOwnedLecture(supabase, user.id, body.note_id);
    const prompt = `Create a practical study plan for this lecture. Return ONLY JSON object with:
title, overview, days (array of {day,title,tasks}), milestones, focus_topics.
Lecture: ${lecture.title}
Preferences: ${JSON.stringify(body)}
Content:
${String(lecture.content || "").slice(0, 10000)}`;

    let plan = null;
    try {
      const result = await generateAIContent(prompt, { maxTokens: 3000 });
      plan = parseJsonObject(result.text);
    } catch {
      plan = null;
    }

    if (!plan || !plan.days) {
      plan = {
        title: `Study plan for ${lecture.title}`,
        overview: "Review the notes, practice recall, then test yourself with questions.",
        days: [
          { day: 1, title: "Understand", tasks: ["Read the lecture notes", "List key concepts"] },
          { day: 2, title: "Practice", tasks: ["Generate questions", "Attempt a quiz"] },
          { day: 3, title: "Review", tasks: ["Revise weak areas", "Create flashcards"] },
        ],
        milestones: ["Complete first quiz", "Review weak topics", "Score above 80%"],
        focus_topics: [lecture.subject || "General"],
      };
    }

    return Response.json(plan);
  } catch (error) {
    return apiError(error);
  }
}
