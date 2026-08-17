import { withAuth } from "@lib/api/auth";
import { questionWithMeta } from "@lib/api/learnflow";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*, lecture_notes!inner(user_id, subject, title)")
    .eq("lecture_notes.user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return Response.json({ questions: (data || []).map(questionWithMeta) });
});
