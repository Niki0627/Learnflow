import { api } from "@/src/core/api/client";
import type { ExamSyllabus, ExamQuestion, Strategy, MarkRow } from "./types";

export async function fetchSyllabi(): Promise<ExamSyllabus[]> {
  try {
    const data = await api.get<ExamSyllabus[]>("exam/syllabi/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function uploadSyllabus(file: File): Promise<ExamSyllabus> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("title", file.name.replace(/\.[^.]+$/, ""));
  return api.post<ExamSyllabus>("exam/syllabus/upload/", undefined, { formData: fd });
}

export async function fetchSyllabusQuestions(syllabusId: number): Promise<ExamQuestion[]> {
  const data = await api.get<ExamQuestion[]>(`exam/syllabus/${syllabusId}/questions/`);
  return Array.isArray(data) ? data : [];
}

export async function generateExamQuestions(
  syllabusId: number,
  markRows: MarkRow[],
  secureCentum: boolean,
  hasPreviousPapers: boolean,
): Promise<ExamQuestion[]> {
  await api.post(`exam/syllabus/${syllabusId}/generate/`, {
    mark_distribution: markRows,
    use_secure_centum: secureCentum,
    has_previous_papers: hasPreviousPapers,
  });
  const data = await api.get<ExamQuestion[]>(`exam/syllabus/${syllabusId}/questions/`);
  return Array.isArray(data) ? data : [];
}

export async function generateExamStrategy(syllabusId: number): Promise<Strategy> {
  return api.post<Strategy>(`exam/syllabus/${syllabusId}/strategy/`, {});
}

export async function uploadPreviousPaper(syllabusId: number, paper: File): Promise<void> {
  const fd = new FormData();
  fd.append("file", paper);
  await api.post(`exam/syllabus/${syllabusId}/papers/`, undefined, { formData: fd });
}

export async function deleteExamQuestion(questionId: number): Promise<void> {
  await api.delete(`exam/question/${questionId}/delete/`);
}
