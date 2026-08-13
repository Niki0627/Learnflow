import { apiError, getRequestContext } from "@lib/api/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user, supabase } = await getRequestContext();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    return apiError(error);
  }
}
