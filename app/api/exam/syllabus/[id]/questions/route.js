import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../../../../lib/api/supabase";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("exam_questions")
      .select("*, exam_syllabi!inner(user_id)")
      .eq("exam_syllabi.user_id", user.id)
      .eq("exam_syllabus_id", id)
      .order("priority", { ascending: true });
    if (error) throw error;
    return Response.json({ questions: data || [] });
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json({ questions: [] });
    }

    return apiError(error);
  }
}
