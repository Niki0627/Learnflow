import { apiError, getRequestContext } from "@lib/api/auth";
import {
  generateQuestionsForLecture,
  getOwnedLecture,
  normalizeQuestion,
} from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRequestContext();
    const body = await readJson(request);
    const count = Math.max(1, Math.min(50, Number(body.count || 10)));
    const lecture = await getOwnedLecture(supabase, user.id, body.note_id);
    const generated = await generateQuestionsForLecture(lecture, count);
    const rows = generated.map((question) => normalizeQuestion(question, lecture.id));

    const { data, error } = await (supabase.from("questions") as any).insert(rows).select("*");
    if (error) throw error;

    return Response.json({ questions: data || [], mcqs: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
