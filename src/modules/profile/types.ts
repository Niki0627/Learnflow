export interface ProfilePreferences {
  adaptiveDifficulty: boolean;
  strictMode: boolean;
  studyReminders: boolean;
  achievementUnlocks: boolean;
  weeklyReport: boolean;
}

export interface ProfileForm {
  bio: string;
  school: string;
  grade: string;
  subjects: string[];
  preferences: ProfilePreferences;
}

export interface ProfileStats {
  total_quizzes: number;
  average_score: number;
  streak_days: number;
}

export interface ProfileResponse extends ProfileForm {
  total_quizzes?: number;
  average_score?: number;
  streak_days?: number;
}
