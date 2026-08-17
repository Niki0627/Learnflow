import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUBJECT_COLORS } from "@/src/theme";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatUsername(usernameOrEmail?: string | null): string {
  if (!usernameOrEmail) return "User";
  let name = usernameOrEmail.split("@")[0];
  name = name.replace(/[0-9]+$/, "");
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name || "User";
}

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

export default cn;
