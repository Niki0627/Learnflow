import { apiError, getSupabaseRequestContext } from "../../../../lib/api/auth";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);

    const [
      lectures,
      flashcards,
      quizAttempts,
      notifications,
    ] = await Promise.all([
      supabase.from("lecture_notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("quiz_attempts").select("score,total_questions,completed_at").eq("user_id", user.id),
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    ]);

    for (const result of [lectures, flashcards, quizAttempts, notifications]) {
      if (result.error) throw result.error;
    }

    const attempts = quizAttempts.data || [];
    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const totalQuestions = attempts.reduce((sum, attempt) => sum + (attempt.total_questions || 0), 0);

    return Response.json({
      total_lectures: lectures.count || 0,
      total_flashcards: flashcards.count || 0,
      quiz_attempts: attempts.length,
      unread_notifications: notifications.count || 0,
      average_score: totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0,
      recent_activity: attempts.slice(-5).reverse(),
    });
  } catch (error) {
    return apiError(error);
  }
}
