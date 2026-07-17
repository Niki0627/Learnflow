import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";

export const runtime = "nodejs";

function toLecture(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    file: row.file_path,
    content: row.content,
    created_at: row.created_at,
    study_notes: row.study_notes,
    formulas: row.formulas || [],
    key_points: row.key_points || [],
  };
}

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("lecture_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return Response.json((data || []).map(toLecture));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await request.json();

    const { data, error } = await supabase
      .from("lecture_notes")
      .insert({
        user_id: user.id,
        title: body.title || "Untitled Lecture",
        subject: body.subject || null,
        content: body.content || "",
        study_notes: body.study_notes || null,
        formulas: body.formulas || [],
        key_points: body.key_points || [],
      })
      .select("*")
      .single();
    if (error) throw error;

    return Response.json(toLecture(data), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
