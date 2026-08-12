import React from "react";
import { cn } from "@/src/lib/utils";
import SurfaceCard from "./SurfaceCard";

interface MetricCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "primary" | "emerald" | "amber" | "rose" | "indigo";
  className?: string;
}

export default function MetricCard({
  label,
  value,
  hint,
  icon,
  className,
}: MetricCardProps) {
  return (
    <SurfaceCard className={cn("flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-3xl font-black text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs font-extrabold text-primary">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
