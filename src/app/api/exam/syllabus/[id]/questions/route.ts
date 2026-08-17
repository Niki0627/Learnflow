import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const GET = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("exam_questions")
    .select("*, exam_syllabi!inner(user_id)")
    .eq("exam_syllabi.user_id", user.id)
    .eq("exam_syllabus_id", id)
    .order("priority", { ascending: true });
  if (error) throw error;
  return Response.json({ questions: data || [] });
});
