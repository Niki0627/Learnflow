import { apiError, getRequestContext } from "@lib/api/auth";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getRequestContext();
    const { error } = await (supabase
      .from("notifications") as any)
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
