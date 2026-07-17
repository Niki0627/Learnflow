import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data: row, error: readError } = await supabase
      .from("exam_questions")
      .select("id, exam_syllabi!inner(user_id)")
      .eq("id", id)
      .eq("exam_syllabi.user_id", user.id)
      .single();
    if (readError) throw readError;
    const { error } = await supabase.from("exam_questions").delete().eq("id", row.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
