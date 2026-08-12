import React from "react";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-6", className)}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h1>
          {badge && (
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-black text-primary">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-base font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}
