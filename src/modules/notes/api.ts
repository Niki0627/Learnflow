import { api } from "@lib/api-client";
import type { StickyNote } from "./types";

export async function fetchNotes(lectureId: number | string): Promise<StickyNote[]> {
  try {
    const data = await api.get<StickyNote[]>(`sticky-notes/?lecture_id=${lectureId}`);
    return data || [];
  } catch {
    return [];
  }
}

export async function createNote(payload: {
  title: string;
  content: string;
  color: string;
  note_type: string;
  lecture_note_id: number | string;
}): Promise<StickyNote> {
  return api.post<StickyNote>("sticky-notes/", payload);
}

export async function updateNote(
  noteId: number,
  payload: { title: string; content: string; color: string; note_type: string },
): Promise<StickyNote> {
  return api.put<StickyNote>(`sticky-notes/${noteId}/`, payload);
}

export async function deleteNote(noteId: number): Promise<void> {
  await api.delete(`sticky-notes/${noteId}/`);
}
