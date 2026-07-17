import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";
import { ensureQuestionOwnership } from "../../../../../lib/api/learnflow";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    await ensureQuestionOwnership(supabase, user.id, params.id);
    const body = await request.json();
    const { data, error } = await supabase
      .from("questions")
      .update({
        question_text: body.question_text,
        option_a: body.option_a,
        option_b: body.option_b,
        option_c: body.option_c,
        option_d: body.option_d,
        correct_option: body.correct_option,
        explanation: body.explanation,
      })
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;

    return Response.json({ question: data });
  } catch (error) {
    return apiError(error);
  }
}
