import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const POST = withAuth(async ({ user, supabase }) => {
   
  const { error } = await (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("user_id", user.id);
  if (error) throw error;

  return Response.json({ ok: true });
});
