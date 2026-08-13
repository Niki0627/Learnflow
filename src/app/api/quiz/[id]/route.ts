import { apiError, getRequestContext } from "@lib/api/auth";
import { getOwnedLecture } from "@lib/api/learnflow";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();
    await getOwnedLecture(supabase, user.id, id);
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("n") || 10)));

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("lecture_note_id", id)
      .limit(limit);
    if (error) throw error;

    return Response.json({ questions: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
