import { api } from "@/src/core/api/client";
import type { Lecture, LectureDetails } from "./types";

export async function fetchLectures(): Promise<Lecture[]> {
  try {
    const data = await api.get<Lecture[]>("lectures/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchLectureDetails(id: number): Promise<LectureDetails & Lecture> {
  return api.get<LectureDetails & Lecture>(`lectures/${id}/`);
}

export async function deleteLecture(id: number): Promise<void> {
  await api.delete(`lectures/${id}/`);
}

export async function uploadTextNote(title: string, content: string): Promise<void> {
  await api.post("upload-note/", { title, content });
}

export async function uploadPDF(title: string, file: File): Promise<void> {
  const fd = new FormData();
  fd.append("title", title);
  fd.append("file", file);
  await api.post("upload-pdf/", undefined, { formData: fd });
}

export async function reuploadPDF(lectureId: number, file: File): Promise<{ file_path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return api.post<{ file_path: string }>(`lectures/${lectureId}/reupload/`, undefined, { formData: fd });
}

export async function generateQuestions(noteId: number, count = 10): Promise<void> {
  await api.post("generate-mcqs/", { note_id: noteId, count });
}
