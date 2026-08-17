import { api } from "@lib/api-client";
import type { StudyPlanResult, GenerateParams, StudyPlanLecture } from "./types";

export async function fetchStudyPlanLectures(): Promise<StudyPlanLecture[]> {
  try {
    const data = await api.get<StudyPlanLecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateStudyPlan(
  noteId: string,
  params: GenerateParams,
): Promise<StudyPlanResult> {
  return api.post<StudyPlanResult>("study-plan/", { note_id: noteId, ...params });
}
