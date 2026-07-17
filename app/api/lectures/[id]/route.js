import { apiError, getSupabaseRequestContext } from "../../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../../lib/api/supabase";
import { query } from "../../../../lib/db/postgres";

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
      if (isSupabaseSchemaCacheError(error)) {
        return Response.json({ error: "Lecture data is not available yet." }, { status: 503 });
      }
      if (error.code === "PGRST116") {
        return Response.json({ error: "Lecture not found." }, { status: 404 });
      }
      throw error;
    }

    return Response.json({ ...toLecture(data), questions: data.questions || [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);

    // Single-step delete — RLS ensures user can only delete their own rows
    const { error, count } = await supabase
      .from("lecture_notes")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (isSupabaseSchemaCacheError(error)) {
        // Fallback to raw postgres
        await query(
          "delete from public.lecture_notes where id = $1 and user_id = $2",
          [id, user.id]
        );
        return Response.json({ ok: true });
      }
      throw error;
    }

    if (count === 0) {
      return Response.json({ error: "Lecture not found or already deleted." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
