import { api } from "@/src/core/api/client";
import type { WeakTopicLecture, WeakTopicItem } from "./types";

export async function fetchWeakTopicLectures(): Promise<WeakTopicLecture[]> {
  try {
    const data = await api.get<WeakTopicLecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchWeakTopics(noteId: string): Promise<WeakTopicItem[]> {
  const res = await api.get<{ weak_topics?: WeakTopicItem[] }>(`weak-topics/?note_id=${noteId}`);
  return res.weak_topics ?? [];
}
