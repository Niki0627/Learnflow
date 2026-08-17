export interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  explanation?: string | null;
  topic?: string | null;
  difficulty?: number;
  blooms_level?: string;
  is_high_yield?: boolean;
}

export interface QuizLecture {
  id: number;
  title: string;
  subject?: string;
}

export interface QuizResultData {
  score: number;
  total: number;
  noteId?: number;
  answers: AnswerRecord[];
  totalTimeTaken?: number;
}

export interface AnswerRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizSelection {
  lectureId: string;
  questionCount: string;
  difficulty: string;
}
