import React from "react";
import { AlertCircle } from "lucide-react";
import SurfaceCard from "./SurfaceCard";

interface ErrorStateProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  fallbackAction?: React.ReactNode;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again. If this continues, check your connection.",
  onRetry,
  retryLabel = "Retry",
  fallbackAction,
}: ErrorStateProps) {
  return (
    <SurfaceCard className="border-red-500/30 bg-red-500/5 p-6">
      <div className="flex items-center gap-3 mb-2 text-red-500">
        <AlertCircle size={22} />
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-4">{message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-xl bg-red-500 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-red-600 transition-colors"
          >
            {retryLabel}
          </button>
        )}
        {fallbackAction}
      </div>
    </SurfaceCard>
  );
}
