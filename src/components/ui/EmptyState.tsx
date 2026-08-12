import React from "react";
import { Sparkles } from "lucide-react";
import SurfaceCard from "./SurfaceCard";

interface EmptyStateProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "Start by creating your first item.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <SurfaceCard className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
        {icon || <Sparkles size={32} />}
      </div>
      <h3 className="text-xl font-black text-foreground mb-1">{title}</h3>
      <p className="text-sm font-medium text-muted-foreground max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </SurfaceCard>
  );
}
