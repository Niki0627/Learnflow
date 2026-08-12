import { apiError, getRequestContext } from "@lib/api/auth";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();
    const { data, error } = await supabase
      .from("exam_questions")
      .select("*, exam_syllabi!inner(user_id)")
      .eq("exam_syllabi.user_id", user.id)
      .eq("exam_syllabus_id", id)
      .order("priority", { ascending: true });
    if (error) throw error;
    return Response.json({ questions: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
