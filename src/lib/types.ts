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
  questions?: Question[];
}

export interface Question {
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

export interface Flashcard {
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

export interface StickyNote {
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

export interface AppNotification {
  id: number;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface QuizAttempt {
  id: number;
  user_id: string;
  lecture_note_id: number;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface ExamSyllabus {
  id: number;
  user_id: string;
  title: string;
  content: string;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
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

export interface PreviousPaper {
  id: number;
  exam_syllabus_id: number;
  file_path: string;
  content: string;
  uploaded_at: string;
}

export interface WeakTopic {
  topic: string;
  subject: string;
  score: number;
  attempts?: number;
  correct?: number;
  accuracy?: number;
  note_id?: number;
}

export interface DashboardStats {
  total_lectures: number;
  total_flashcards: number;
  quiz_attempts: number;
  unread_notifications: number;
  average_score: number;
  avg_score: number;
  study_time: string;
  questions_answered: number;
  topics_mastered: number;
  streak: number;
  mastery_data: { subject: string; percentage: number }[];
  weak_topics: WeakTopic[];
  recent_activity: { type: string; title: string; description: string; date: string }[];
  weekly_activity: { day: string; questions: number }[];
  quiz_scores: { name: string; score: number }[];
  score_distribution: { name: string; value: number }[];
  skill_radar: { skill: string; score: number }[];
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  school: string;
  grade: string;
  subjects: string[];
  preferences: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  total_quizzes: number;
  average_score: number;
  streak_days: number;
}
