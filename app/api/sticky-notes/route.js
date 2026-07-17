import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lecture_id");

    let query = supabase
      .from("sticky_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (lectureId) query = query.eq("lecture_note_id", lectureId);

    const { data, error } = await query;
    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await request.json();
    const { data, error } = await supabase
      .from("sticky_notes")
      .insert({
        user_id: user.id,
        lecture_note_id: body.lecture_note || body.lecture_note_id || null,
        title: body.title || "Class Note",
        content: body.content || "",
        color: body.color || "#FFF9C4",
        note_type: body.note_type || "lecture",
        is_pinned: Boolean(body.is_pinned),
        page_number: body.page_number || null,
        source_text: body.source_text || null,
      })
      .select("*")
      .single();
    if (error) throw error;

    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
