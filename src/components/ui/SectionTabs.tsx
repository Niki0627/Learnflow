import React from "react";
import { cn } from "@/src/lib/utils";

interface TabItem {
  value: string;
  label: React.ReactNode;
}

interface SectionTabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: TabItem[];
  className?: string;
}

export default function SectionTabs({ value, onChange, tabs, className }: SectionTabsProps) {
  return (
    <div className={cn("flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 custom-scrollbar mb-4", className)}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-black transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
