import { generateAIContent } from "../ai/providers";

export function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseJsonArray(text, fallback = []) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    const match = String(text || "").match(/\[[\s\S]*\]/);
    if (!match) return fallback;
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
}

export function parseJsonObject(text, fallback = {}) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      const parsed = JSON.parse(match[0]);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
}

export function normalizeQuestion(question, lectureNoteId) {
  return {
    lecture_note_id: Number(lectureNoteId),
    topic: question.topic || "General",
    question_text: question.question_text || question.question || "",
    option_a: question.option_a || question.options?.A || "Option A",
    option_b: question.option_b || question.options?.B || "Option B",
    option_c: question.option_c || question.options?.C || "Option C",
    option_d: question.option_d || question.options?.D || "Option D",
    correct_option: String(question.correct_option || question.answer || "A").charAt(0).toUpperCase(),
    explanation: question.explanation || "",
    difficulty: Number(question.difficulty || 0.5),
    blooms_level: question.blooms_level || "understand",
    question_type: question.question_type || "mcq",
    is_high_yield: Boolean(question.is_high_yield),
    relevance_score: Number(question.relevance_score || 5),
  };
}

export async function getOwnedLecture(supabase, userId, lectureId) {
  const { data, error } = await supabase
    .from("lecture_notes")
    .select("*")
    .eq("id", lectureId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function generateQuestionsForLecture(lecture, count = 10) {
  const prompt = `Create ${count} high-quality multiple choice questions from these lecture notes.

Return ONLY valid JSON array. Each item must have:
question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, blooms_level, is_high_yield.

Lecture title: ${lecture.title}
Subject: ${lecture.subject || "General"}
Content:
${String(lecture.content || "").slice(0, 12000)}`;

  try {
    const result = await generateAIContent(prompt, { maxTokens: Math.min(6000, Math.max(1600, count * 350)) });
    const parsed = parseJsonArray(result.text);
    if (parsed.length) return parsed.slice(0, count);
  } catch {
    // Fall through to deterministic fallback.
  }

  const sentences = String(lecture.content || lecture.title || "General topic")
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  return Array.from({ length: count }, (_, index) => {
    const base = sentences[index % Math.max(sentences.length, 1)] || lecture.title;
    return {
      question_text: `Which statement best matches this concept: ${base.slice(0, 120)}?`,
      option_a: base.slice(0, 180) || "The main concept from the lecture",
      option_b: "An unrelated concept not supported by the notes",
      option_c: "A partially related but incomplete explanation",
      option_d: "A contradiction of the lecture content",
      correct_option: "A",
      explanation: "This option is directly grounded in the lecture note content.",
      topic: lecture.subject || "General",
      blooms_level: "understand",
      is_high_yield: index < 5,
    };
  });
}

export async function ensureQuestionOwnership(supabase, userId, questionId) {
  const { data, error } = await supabase
    .from("questions")
    .select("*, lecture_notes!inner(user_id, subject, title)")
    .eq("id", questionId)
    .eq("lecture_notes.user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export function questionWithMeta(row) {
  const lecture = row.lecture_notes || {};
  return {
    ...row,
    subject: lecture.subject || row.subject || "General",
    lecture_title: lecture.title || row.lecture_title,
  };
}
