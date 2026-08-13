import { apiError, getRequestContext } from "@lib/api/auth";
import { readJson, requireNumericId } from "@lib/api/errors";
import { getOwnedLecture } from "@lib/api/learnflow";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRequestContext();
    const body = await readJson(request);
    const firstNoteId = String(body.note_id || "").split(",")[0];
    const lectureId = requireNumericId(firstNoteId, "lecture id");
    await getOwnedLecture(supabase, user.id, lectureId);

    const { data, error } = await (supabase
      .from("quiz_attempts") as any)
      .insert({
        user_id: user.id,
        lecture_note_id: lectureId,
        score: Number(body.score || 0),
        total_questions: Number(body.total || body.total_questions || 0),
      })
      .select("*")
      .single();
    if (error) throw error;

    return Response.json({ ok: true, attempt: data });
  } catch (error) {
    return apiError(error);
  }
}
