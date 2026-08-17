import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }, request) => {
  const { searchParams } = new URL(request.url);
  const topics = String(searchParams.get("topics") || "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("questions")
    .select("lecture_note_id,topic,lecture_notes!inner(user_id)")
    .eq("lecture_notes.user_id", user.id)
    .in("topic", topics.length ? topics : ["__none__"]);
  if (error) throw error;

  return Response.json({
     
    note_ids: Array.from(new Set(((data || []) as any[]).map((row) => row.lecture_note_id))),
  });
});
