export interface StudyPlanSection {
  title: string;
  content: string;
  type?: string;
}

export interface StudyPlanResult {
  overview?: string;
  daily_schedule?: StudyPlanSection[];
  topics?: { topic: string; priority: string; hours: number }[];
  tips?: string[];
  raw?: string;
}

export interface GenerateParams {
  exam_date: string;
  hours_per_day: number;
  priority_subjects: string[];
  focus_weak_areas: boolean;
}

export interface StudyPlanLecture {
  id: number | string;
  title: string;
}
