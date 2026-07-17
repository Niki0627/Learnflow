import { apiError, getSupabaseRequestContext } from "../../../../lib/api/auth";

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

export async function GET(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("lecture_notes")
      .select("*, questions(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();
    if (error) throw error;

    return Response.json({ ...toLecture(data), questions: data.questions || [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { error } = await supabase
      .from("lecture_notes")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
