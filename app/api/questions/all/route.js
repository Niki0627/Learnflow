import { apiError, getSupabaseRequestContext, isSupabaseSchemaCacheError } from "../../../../lib/api/auth";
import { questionWithMeta } from "../../../../lib/api/learnflow";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("questions")
      .select("*, lecture_notes!inner(user_id, subject, title)")
      .eq("lecture_notes.user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return Response.json({ questions: (data || []).map(questionWithMeta) });
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json({ questions: [] });
    }

    return apiError(error);
  }
}
