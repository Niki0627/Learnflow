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

export interface WeakTopicExplanation {
  explanation?: string;
  key_concepts?: string[];
  common_mistakes?: string[];
  error?: string;
  canRetry?: boolean;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
