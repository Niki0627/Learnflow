export interface Lecture {
  id: number;
  title: string;
  subject: string | null;
  file: string | null;
  content: string;
  created_at: string;
  study_notes: string | null;
  formulas: unknown[];
  key_points: unknown[];
  questions?: LectureQuestion[];
}

export interface LectureQuestion {
  id: number;
  lecture_note_id: number;
  topic: string | null;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_option: string | null;
  explanation: string | null;
  difficulty: number;
  blooms_level: string;
  question_type: string;
  is_high_yield: boolean;
  relevance_score: number;
  is_starred: boolean;
  attempt_count: number;
  correct_count: number;
  created_at: string;
  subject?: string;
  lecture_title?: string;
}

export interface LectureDetails {
  questions?: LectureQuestion[];
  summary?: string;
  study_notes?: string;
  formulas?: unknown[];
  key_points?: unknown[];
}
