export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ProfileRow {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  school: string | null;
  grade: string | null;
  subjects: Json;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

export interface LectureNoteRow {
  id: number;
  user_id: string | null;
  title: string;
  subject: string | null;
  file_path: string | null;
  content: string;
  study_notes: string | null;
  formulas: Json;
  key_points: Json;
  created_at: string;
}

export interface QuestionRow {
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
}

export interface FlashcardRow {
  id: number;
  user_id: string;
  lecture_note_id: number | null;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  created_at: string;
}

export interface StickyNoteRow {
  id: number;
  user_id: string;
  lecture_note_id: number | null;
  title: string;
  content: string;
  color: string;
  note_type: string;
  is_pinned: boolean;
  page_number: number | null;
  source_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: number;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface QuizAttemptRow {
  id: number;
  user_id: string;
  lecture_note_id: number;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface ExamSyllabusRow {
  id: number;
  user_id: string;
  title: string;
  content: string;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreviousQuestionPaperRow {
  id: number;
  exam_syllabus_id: number;
  file_path: string;
  content: string;
  uploaded_at: string;
}

export interface ExamQuestionRow {
  id: number;
  exam_syllabus_id: number;
  question_text: string;
  answer: string;
  marks: number;
  priority: number;
  topic: string;
  is_from_pattern: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiResponseCacheRow {
  id: number;
  lecture_note_id: number | null;
  exam_syllabus_id: number | null;
  action_type: string;
  response_data: Json;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> };
      lecture_notes: { Row: LectureNoteRow; Insert: Partial<LectureNoteRow>; Update: Partial<LectureNoteRow> };
      questions: { Row: QuestionRow; Insert: Partial<QuestionRow>; Update: Partial<QuestionRow> };
      flashcards: { Row: FlashcardRow; Insert: Partial<FlashcardRow>; Update: Partial<FlashcardRow> };
      sticky_notes: { Row: StickyNoteRow; Insert: Partial<StickyNoteRow>; Update: Partial<StickyNoteRow> };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow> };
      quiz_attempts: { Row: QuizAttemptRow; Insert: Partial<QuizAttemptRow>; Update: Partial<QuizAttemptRow> };
      exam_syllabi: { Row: ExamSyllabusRow; Insert: Partial<ExamSyllabusRow>; Update: Partial<ExamSyllabusRow> };
      previous_question_papers: { Row: PreviousQuestionPaperRow; Insert: Partial<PreviousQuestionPaperRow>; Update: Partial<PreviousQuestionPaperRow> };
      exam_questions: { Row: ExamQuestionRow; Insert: Partial<ExamQuestionRow>; Update: Partial<ExamQuestionRow> };
      ai_response_cache: { Row: AiResponseCacheRow; Insert: Partial<AiResponseCacheRow>; Update: Partial<AiResponseCacheRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SupabaseDatabase = Database;
