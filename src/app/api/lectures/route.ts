import { withAuth } from "@lib/api/auth";
import { readJson } from "@lib/api/errors";
import { toLecture } from "@lib/api/learnflow";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }) => {
  const { data, error } = await supabase
    .from("lecture_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return Response.json((data || []).map(toLecture));
});

export const POST = withAuth(async ({ user, supabase }, request) => {
  const body = await readJson(request);

  const payload = {
    user_id: user.id,
    title: body.title || "Untitled Lecture",
    subject: body.subject || null,
    content: body.content || "",
    study_notes: body.study_notes || null,
    formulas: body.formulas || [],
    key_points: body.key_points || [],
  };

   
  const { data, error } = await (supabase
    .from("lecture_notes") as any)
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;

   
  return Response.json(toLecture(data as any), { status: 201 });
});
