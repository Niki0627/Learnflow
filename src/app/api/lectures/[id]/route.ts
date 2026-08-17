import { withAuth, isNoRowsError } from "@lib/api/auth";
import { toLecture } from "@lib/api/learnflow";

export const runtime = "nodejs";

export const GET = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("lecture_notes")
    .select("*, questions(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (isNoRowsError(error)) {
      return Response.json({ error: "Lecture not found." }, { status: 404 });
    }
    throw error;
  }

   
  const anyData = data as any;
  return Response.json({ ...toLecture(anyData), questions: anyData.questions || [] });
});

export const DELETE = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;

  const { error, count } = await supabase
    .from("lecture_notes")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  if (count === 0) {
    return Response.json(
      { error: "Lecture not found or already deleted." },
      { status: 404 },
    );
  }

  return Response.json({ ok: true });
});
