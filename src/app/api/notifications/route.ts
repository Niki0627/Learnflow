import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return Response.json(data || []);
});
