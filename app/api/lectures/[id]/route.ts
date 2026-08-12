import { apiError, getRequestContext, isNoRowsError } from "@lib/api/auth";
import { toLecture } from "@lib/api/learnflow";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();
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
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();

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
  } catch (error) {
    return apiError(error);
  }
}
