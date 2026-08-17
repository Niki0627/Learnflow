import { withAuth } from "@lib/api/auth";
import { ensureQuestionOwnership } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const POST = withAuth(async ({ user, supabase }, request) => {
  const body = await readJson(request);
  const question = await ensureQuestionOwnership(supabase, user.id, body.question_id);
  const selected = String(body.selected_option || body.user_answer || "").toUpperCase();
  const correctOption = String(question.correct_option || "A").toUpperCase();
  const correct = selected === correctOption;

   
  await (supabase
    .from("questions") as any)
    .update({
      attempt_count: Number(question.attempt_count || 0) + 1,
      correct_count: Number(question.correct_count || 0) + (correct ? 1 : 0),
    })
    .eq("id", question.id);

  return Response.json({
    correct,
    correct_option: correctOption,
    explanation: question.explanation || "",
  });
});
