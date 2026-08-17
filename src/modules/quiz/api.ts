import { api } from "@lib/api-client";
import type { QuizQuestion, QuizLecture } from "./types";

export interface FetchQuestionsParams {
  noteId?: string;
  count?: number;
  difficulty?: string;
}

export async function fetchQuizQuestions(params: FetchQuestionsParams): Promise<QuizQuestion[]> {
  const parts: string[] = [];
  if (params.noteId) parts.push(`note_id=${params.noteId}`);
  if (params.count) parts.push(`n=${params.count}`);
  if (params.difficulty && params.difficulty !== "all") parts.push(`difficulty=${params.difficulty}`);
  const query = parts.length > 0 ? `?${parts.join("&")}` : "";
  const data = await api.get<QuizQuestion[]>(`mcqs/${query}`);
  return data ?? [];
}

export async function fetchQuizLectures(): Promise<QuizLecture[]> {
  try {
    const data = await api.get<QuizLecture[] | { results: QuizLecture[] }>("lectures/");
    return Array.isArray(data) ? data : (data as { results: QuizLecture[] }).results ?? [];
  } catch {
    return [];
  }
}

export async function fetchQuestionsForQuiz(lectureId: number | string, count: number): Promise<QuizQuestion[]> {
  const res = await api.get<{ questions: QuizQuestion[] }>(`quiz/${lectureId}/?n=${count}`);
  return res.questions ?? [];
}

export async function generateMCQsForQuiz(lectureId: number | string, count: number): Promise<void> {
  await api.post("generate-mcqs/", { note_id: lectureId, count });
}

export async function submitMCQAnswer(
  questionId: number,
  selectedOption: string,
  timeTaken: number,
): Promise<{ correct: boolean; correct_option: string }> {
  return api.post<{ correct: boolean; correct_option: string }>("submit-mcq/", {
    question_id: questionId,
    selected_option: selectedOption,
    time_taken: timeTaken,
  });
}

export async function completeQuizApi(
  score: number,
  total: number,
  answers: Array<{ question_id: number; is_correct: boolean; selected_option: string; time_taken: number }>,
): Promise<void> {
  await api.post("quiz-completed/", { score, total, answers });
}

export async function fetchDashboardStats() {
  return api.get<{ streak: number }>("dashboard/stats/");
}
