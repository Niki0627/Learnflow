"use client";

export const captureSelectedText = (): string => {
  const selected = window.getSelection();
  if (!selected) return "";
  return selected.toString().trim();
};

export default function PDFTextSelector() {
  return null;
}
