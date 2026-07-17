import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", params.id)
      .eq("user_id", user.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
