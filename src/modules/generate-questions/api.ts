import { api } from "@lib/api-client";
import type { Question, GenerateLecture } from "./types";

export async function fetchGenerateLectures(): Promise<GenerateLecture[]> {
  try {
    const data = await api.get<GenerateLecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateMCQs(
  noteId: string,
  count: number,
): Promise<Question[]> {
  const res = await api.post<{ questions?: Question[]; mcqs?: Question[] }>(
    "generate-mcqs/",
    { note_id: noteId, count },
  );
  return res.questions ?? res.mcqs ?? [];
}

export async function updateQuestion(
  questionId: number,
  form: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation: string;
  },
): Promise<Question> {
  const res = await api.put<{ question: Question }>(`questions/${questionId}/update/`, form);
  return res.question;
}
