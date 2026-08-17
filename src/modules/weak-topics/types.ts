export interface WeakTopicLecture {
  id: number | string;
  title: string;
}

export interface WeakTopicItem {
  topic: string;
  subject: string;
  accuracy?: number;
  score?: number;
  attempts?: number;
  correct?: number;
  note_id?: number;
}
