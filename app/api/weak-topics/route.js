import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../lib/api/supabase";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("note_id");

    let query = supabase
      .from("questions")
      .select("topic,attempt_count,correct_count,lecture_notes!inner(user_id,subject)")
      .eq("lecture_notes.user_id", user.id);
    if (noteId) query = query.eq("lecture_note_id", noteId);

    const { data, error } = await query;
    if (error) throw error;

    const grouped = new Map();
    for (const row of data || []) {
      const topic = row.topic || "General";
      const current = grouped.get(topic) || {
        topic,
        subject: row.lecture_notes?.subject || "General",
        attempts: 0,
        correct: 0,
      };
      current.attempts += Number(row.attempt_count || 0);
      current.correct += Number(row.correct_count || 0);
      grouped.set(topic, current);
    }

    const weak_topics = Array.from(grouped.values()).map((item) => ({
      ...item,
      score: item.attempts ? 1 - item.correct / item.attempts : 0.5,
    }));

    return Response.json({ weak_topics });
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json({ weak_topics: [] });
    }

    return apiError(error);
  }
}
