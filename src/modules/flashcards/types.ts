export interface Flashcard {
  id?: number;
  front: string;
  back: string;
  note_id?: number;
}

export interface FlashcardLecture {
  id: number | string;
  title: string;
}
