import { apiError, getRequestContext } from "@lib/api/auth";
import { generateAIContent } from "@lib/ai/providers";
import { getOwnedLecture, parseJsonArray } from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRequestContext();
    const body = await readJson(request);
    const count = Math.max(1, Math.min(40, Number(body.count || 15)));
    const lecture = await getOwnedLecture(supabase, user.id, body.note_id);

    const prompt = `Create ${count} flashcards from this lecture. Return ONLY JSON array with front and back.
Title: ${lecture.title}
Content:
${String(lecture.content || "").slice(0, 10000)}`;
    let cards: Record<string, any>[] = [];
    try {
      const result = await generateAIContent(prompt, {
        maxTokens: Math.min(5000, count * 220),
      });
      cards = parseJsonArray(result.text);
    } catch {
      cards = [];
    }
    if (!cards.length) {
      cards = Array.from({ length: count }, (_, i) => ({
        front: `Key idea ${i + 1} from ${lecture.title}`,
        back:
          String(lecture.content || lecture.title).slice(i * 120, i * 120 + 240) ||
          lecture.title,
      }));
    }

    const rows = cards.slice(0, count).map((card) => ({
      user_id: user.id,
      lecture_note_id: lecture.id,
      front: card.front || card.question || "Flashcard",
      back: card.back || card.answer || "",
    }));
    const { data, error } = await (supabase.from("flashcards") as any).insert(rows).select("*");
    if (error) throw error;
    return Response.json({ flashcards: data || [] });
  } catch (error) {
    return apiError(error);
  }
}
