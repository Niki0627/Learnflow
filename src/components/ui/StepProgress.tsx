import React from "react";
import { cn } from "@/src/lib/utils";

interface StepProgressProps {
  step?: number;
  total?: number;
  label?: string;
  className?: string;
}

export default function StepProgress({ step = 1, total = 4, label = "Progress", className }: StepProgressProps) {
  const percent = Math.max(0, Math.min(100, (step / total) * 100));

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary font-black">Step {step} of {total}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
