import React from "react";

interface LoadingSkeletonPackProps {
  rows?: number;
  cardHeight?: number;
}

export default function LoadingSkeletonPack({ rows = 3, cardHeight = 120 }: LoadingSkeletonPackProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-3xl bg-muted/60"
          style={{ height: cardHeight }}
        />
      ))}
    </div>
  );
}
