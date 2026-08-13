import type { SupabaseClient } from "@supabase/supabase-js";
import { generateAIContent } from "../ai/providers";
import { notFound, requireNumericId } from "./errors";
import { isNoRowsError } from "./auth";
import type { Database, LectureNoteRow } from "../types/database";

export function cleanJsonText(text: string): string {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseJsonArray(text: string, fallback: any[] = []): any[] {
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

export function parseJsonObject(
  text: string,
  fallback: Record<string, any> = {},
): Record<string, any> {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : fallback;
  } catch {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      const parsed = JSON.parse(match[0]);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  }
}

export interface LectureDTO {
  id: number;
  title: string;
  subject: string | null;
  file: string | null;
  content: string;
  created_at: string;
  study_notes: string | null;
  formulas: unknown[];
  key_points: unknown[];
}

export function toLecture(row: LectureNoteRow): LectureDTO {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    file: row.file_path,
    content: row.content,
    created_at: row.created_at,
    study_notes: row.study_notes,
    formulas: Array.isArray(row.formulas) ? row.formulas : [],
    key_points: Array.isArray(row.key_points) ? row.key_points : [],
  };
}

export interface NormalizedQuestion {
  lecture_note_id: number;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  difficulty: number;
  blooms_level: string;
  question_type: string;
  is_high_yield: boolean;
  relevance_score: number;
}

export function normalizeQuestion(
  question: Record<string, any>,
  lectureNoteId: number,
): NormalizedQuestion {
  return {
    lecture_note_id: Number(lectureNoteId),
    topic: question.topic || "General",
    question_text: question.question_text || question.question || "",
    option_a: question.option_a || question.options?.A || "Option A",
    option_b: question.option_b || question.options?.B || "Option B",
    option_c: question.option_c || question.options?.C || "Option C",
    option_d: question.option_d || question.options?.D || "Option D",
    correct_option: String(
      question.correct_option || question.answer || "A",
    )
      .charAt(0)
      .toUpperCase(),
    explanation: question.explanation || "",
    difficulty: Number(question.difficulty || 0.5),
    blooms_level: question.blooms_level || "understand",
    question_type: question.question_type || "mcq",
    is_high_yield: Boolean(question.is_high_yield),
    relevance_score: Number(question.relevance_score || 5),
  };
}

export async function getOwnedLecture(
  supabase: SupabaseClient<Database>,
  userId: string,
  lectureId: unknown,
): Promise<LectureNoteRow> {
  const id = requireNumericId(lectureId, "lecture id");
  const { data, error } = await supabase
    .from("lecture_notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (isNoRowsError(error)) throw notFound("Lecture not found.");
    throw error;
  }
  return data;
}

export async function generateQuestionsForLecture(
  lecture: LectureNoteRow,
  count = 10,
): Promise<Record<string, any>[]> {
  const prompt = `Create ${count} high-quality multiple choice questions from these lecture notes.

Return ONLY valid JSON array. Each item must have:
question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, blooms_level, is_high_yield.

Lecture title: ${lecture.title}
Subject: ${lecture.subject || "General"}
Content:
${String(lecture.content || "").slice(0, 12000)}`;

  try {
    const result = await generateAIContent(prompt, {
      maxTokens: Math.min(6000, Math.max(1600, count * 350)),
    });
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
    const base =
      sentences[index % Math.max(sentences.length, 1)] || lecture.title;
    return {
      question_text: `Which statement best matches this concept: ${base.slice(0, 120)}?`,
      option_a: base.slice(0, 180) || "The main concept from the lecture",
      option_b: "An unrelated concept not supported by the notes",
      option_c: "A partially related but incomplete explanation",
      option_d: "A contradiction of the lecture content",
      correct_option: "A",
      explanation:
        "This option is directly grounded in the lecture note content.",
      topic: lecture.subject || "General",
      blooms_level: "understand",
      is_high_yield: index < 5,
    };
  });
}

export async function ensureQuestionOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  questionId: unknown,
): Promise<Record<string, any>> {
  const id = requireNumericId(questionId, "question id");
  const { data, error } = await supabase
    .from("questions")
    .select("*, lecture_notes!inner(user_id, subject, title)")
    .eq("id", id)
    .eq("lecture_notes.user_id", userId)
    .single();
  if (error) {
    if (isNoRowsError(error)) throw notFound("Question not found.");
    throw error;
  }
  return data;
}

export function questionWithMeta(row: Record<string, any>): Record<string, any> {
  const lecture = row.lecture_notes || {};
  return {
    ...row,
    subject: lecture.subject || row.subject || "General",
    lecture_title: lecture.title || row.lecture_title,
  };
}
