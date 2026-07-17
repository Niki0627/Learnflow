import { apiError, getSupabaseRequestContext } from "../../../../lib/api/auth";
import { notFound } from "../../../../lib/api/errors";
import { isNoRowsError, isSupabaseSchemaCacheError } from "../../../../lib/api/supabase";

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
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("lecture_notes")
      .select("*, questions(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error) {
      if (isNoRowsError(error)) throw notFound("Lecture not found.");
      throw error;
    }

    return Response.json({ ...toLecture(data), questions: data.questions || [] });
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json({ error: "Lecture data is not available yet." }, { status: 503 });
    }

    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const read = await supabase
      .from("lecture_notes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (read.error) {
      if (isNoRowsError(read.error)) throw notFound("Lecture not found.");
      throw read.error;
    }

    const { error } = await supabase
      .from("lecture_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
