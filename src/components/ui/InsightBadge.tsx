import React from "react";
import { cn } from "@/src/lib/utils";

interface InsightBadgeProps {
  label: string;
  tone?: "primary" | "success" | "warning" | "error" | "info";
  className?: string;
}

const toneMap: Record<string, string> = {
  primary: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
  info: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

export default function InsightBadge({ label, tone = "primary", className }: InsightBadgeProps) {
  const toneClass = toneMap[tone] || toneMap.primary;
  return (
    <span className={cn("inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-extrabold shadow-sm", toneClass, className)}>
      {label}
    </span>
  );
}
