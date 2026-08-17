export interface Question {
  id: number;
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: string;
  explanation?: string;
  topic?: string;
  subject?: string;
  blooms_level?: string;
  is_high_yield?: boolean;
  difficulty?: number;
}

export interface GenerateLecture {
  id: number | string;
  title: string;
}

export interface EditForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
}
