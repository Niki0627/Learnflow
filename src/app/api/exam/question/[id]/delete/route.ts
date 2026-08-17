import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const DELETE = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;
  const { data: row, error: readError } = await supabase
    .from("exam_questions")
    .select("id, exam_syllabi!inner(user_id)")
    .eq("id", id)
    .eq("exam_syllabi.user_id", user.id)
    .single();
  if (readError) throw readError;
   
  const { error } = await (supabase.from("exam_questions") as any).delete().eq("id", (row as any).id);
  if (error) throw error;
  return Response.json({ ok: true });
});
