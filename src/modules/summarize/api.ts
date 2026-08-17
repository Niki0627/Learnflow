import { api } from "@/src/core/api/client";
import type { SummarizeLecture, SummarizeResponse } from "./types";

export async function fetchSummarizeLectures(): Promise<SummarizeLecture[]> {
  try {
    const data = await api.get<SummarizeLecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchLectureSummary(noteId: string): Promise<SummarizeResponse> {
  return api.post<SummarizeResponse>("lectures/summarize/", { note_id: noteId });
}
