import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("exam_questions")
      .select("*, exam_syllabi!inner(user_id)")
      .eq("exam_syllabi.user_id", user.id)
      .eq("exam_syllabus_id", params.id)
      .order("priority", { ascending: true });
    if (error) throw error;
    return Response.json({ questions: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
