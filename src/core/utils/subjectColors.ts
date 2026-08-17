import { SUBJECT_COLORS } from "../../theme";

export function subjectToColor(subject?: string | null): string {
  if (!subject) return SUBJECT_COLORS[0];
  const s = String(subject).trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[idx];
}

export default subjectToColor;
