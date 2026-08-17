import { withAuth, isNoRowsError } from "@lib/api/auth";
import { notFound, readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const PUT = withAuth<{ id: string }>(async ({ user, supabase }, request, { params }) => {
  const { id } = await params;
  const body = await readJson(request);
   
  const { data, error } = await (supabase
    .from("sticky_notes") as any)
    .update({
      title: body.title,
      content: body.content,
      color: body.color,
      note_type: body.note_type,
      is_pinned: body.is_pinned,
      page_number: body.page_number,
      source_text: body.source_text,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) {
    if (isNoRowsError(error)) throw notFound("Sticky note not found.");
    throw error;
  }

  return Response.json(data);
});

export const DELETE = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;
  const read = await supabase
    .from("sticky_notes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (read.error) {
    if (isNoRowsError(read.error)) throw notFound("Sticky note not found.");
    throw read.error;
  }

  const { error } = await supabase
    .from("sticky_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;

  return Response.json({ ok: true });
});
