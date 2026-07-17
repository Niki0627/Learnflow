import { apiError, getSupabaseRequestContext, isSupabaseSchemaCacheError } from "../../../../lib/api/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("exam_syllabi")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ syllabi: data || [] });
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json({ syllabi: [] });
    }

    return apiError(error);
  }
}
