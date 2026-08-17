export interface ExamSyllabus {
  id: number;
  title: string;
}

export interface ExamQuestion {
  id: number;
  question_text: string;
  answer: string;
  marks: number;
  topic?: string;
  priority: number;
  is_from_pattern?: boolean;
}

export interface Strategy {
  overview?: string;
  focus_areas?: string[];
  time_allocation?: string;
  tips?: string[];
  raw?: string;
}

export interface MarkRow {
  marks: number;
  count: number;
}
