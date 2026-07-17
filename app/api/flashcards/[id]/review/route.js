import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";

export const runtime = "nodejs";

const ratingScore = { again: 1, hard: 2, good: 3, easy: 4 };

export async function POST(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await request.json();
    const rating = ratingScore[body.rating] || Number(body.rating || 3);
    const { data: card, error: readError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();
    if (readError) throw readError;

    const repetitions = rating >= 3 ? Number(card.repetitions || 0) + 1 : 0;
    const interval = rating >= 3 ? Math.max(1, Number(card.interval || 0) * rating || 1) : 0;
    const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

    const { data, error } = await supabase
      .from("flashcards")
      .update({
        repetitions,
        interval,
        ease_factor: Math.max(1.3, Number(card.ease_factor || 2.5) + (rating - 3) * 0.15),
        next_review_date: nextReview,
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) throw error;
    return Response.json({ card: data });
  } catch (error) {
    return apiError(error);
  }
}
