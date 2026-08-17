import { api } from "@lib/api-client";
import type { Flashcard, FlashcardLecture } from "./types";

export async function fetchLectures(): Promise<FlashcardLecture[]> {
  try {
    const data = await api.get<FlashcardLecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function generateFlashcards(noteId: string, count = 15): Promise<void> {
  await api.post("flashcards/generate/", { note_id: noteId, count });
}

export async function fetchFlashcards(noteId: string): Promise<Flashcard[]> {
  const data = await api.get<Flashcard[]>(`flashcards/?note_id=${noteId}`);
  return data ?? [];
}

export async function reviewFlashcard(cardId: number, rating: string): Promise<void> {
  await api.post(`flashcards/${cardId}/review/`, { rating });
}
