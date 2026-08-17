import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const POST = withAuth<{ id: string }>(async ({ user, supabase }, _request, { params }) => {
  const { id } = await params;
   
  const { error } = await (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;

  return Response.json({ ok: true });
});
