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
