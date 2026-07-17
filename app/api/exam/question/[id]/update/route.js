import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";
import { readJson } from "../../../../../../lib/api/errors";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await readJson(request);
    const { data, error } = await supabase
      .from("exam_questions")
      .update({
        question_text: body.question_text,
        answer: body.answer,
        marks: body.marks,
        priority: body.priority,
        topic: body.topic,
        is_from_pattern: body.is_from_pattern,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, exam_syllabi!inner(user_id)")
      .eq("exam_syllabi.user_id", user.id)
      .single();
    if (error) throw error;
    return Response.json({ question: data });
  } catch (error) {
    return apiError(error);
  }
}
