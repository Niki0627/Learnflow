import { apiError, getSupabaseRequestContext } from "../../../../lib/api/auth";
import { notFound, readJson } from "../../../../lib/api/errors";
import { isNoRowsError } from "../../../../lib/api/supabase";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await readJson(request);
    const { data, error } = await supabase
      .from("sticky_notes")
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
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
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
  } catch (error) {
    return apiError(error);
  }
}
