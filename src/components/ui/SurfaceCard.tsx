import React from "react";
import { cn } from "@/src/lib/utils";

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function SurfaceCard({ children, className, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
