import { withAuth } from "@lib/api/auth";
import { ensureQuestionOwnership } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const PUT = withAuth<{ id: string }>(async ({ user, supabase }, request, { params }) => {
  const { id } = await params;
  await ensureQuestionOwnership(supabase, user.id, id);
  const body = await readJson(request);
   
  const { data, error } = await (supabase.from("questions") as any)
    .update({
      question_text: body.question_text,
      option_a: body.option_a,
      option_b: body.option_b,
      option_c: body.option_c,
      option_d: body.option_d,
      correct_option: body.correct_option,
      explanation: body.explanation,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;

  return Response.json({ question: data });
});
