import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../lib/api/supabase";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { searchParams } = new URL(request.url);
    let query = supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const noteId = searchParams.get("note_id");
    if (noteId) query = query.eq("lecture_note_id", noteId);
    const { data, error } = await query;
    if (error) throw error;
    return Response.json(data || []);
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json([]);
    }

    return apiError(error);
  }
}
