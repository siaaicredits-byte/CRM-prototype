import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Stagger index for the entrance animation. */
  delay?: number;
}

export function Card({ children, className, delay = 0 }: CardProps) {
  return (
    <section
      className={cn(
        "animate-fade-up min-w-0 rounded-2xl border border-line bg-surface/80 shadow-[0_1px_0_0_rgb(255_255_255/0.03)_inset,0_12px_32px_-16px_rgb(0_0_0/0.6)] backdrop-blur-sm",
        className,
      )}
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
