import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }, request) => {
  const { searchParams } = new URL(request.url);
  let query = supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const noteId = searchParams.get("note_id");
  if (noteId) query = query.eq("lecture_note_id", noteId);

  const { data, error } = await query;
  if (error) throw error;

  return Response.json(data || []);
});
