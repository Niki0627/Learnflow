import React from "react";
import { cn } from "@/src/lib/utils";

interface ActionBarProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export default function ActionBar({ children, sticky = false, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 flex-wrap",
        sticky && "sticky bottom-4 z-10 rounded-2xl border bg-card/90 p-3 shadow-lg backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}
