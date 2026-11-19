import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, DollarSign, Handshake, Percent, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Kpi } from "@/types/crm";

const kpiIcons: Record<string, LucideIcon> = {
  leads: UserPlus,
  contacts: Users,
  deals: Handshake,
  pipeline: DollarSign,
  conversion: Percent,
};

interface KpiCardProps {
  kpi: Kpi;
  index?: number;
  className?: string;
}

export function KpiCard({ kpi, index = 0, className }: KpiCardProps) {
  const Icon = kpiIcons[kpi.id] ?? DollarSign;
  const positive = kpi.change >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card
      delay={index}
      className={cn("group relative overflow-hidden p-4 transition-colors hover:border-line-strong sm:p-5", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-60"
      />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted">{kpi.label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/20">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="relative mt-3 text-[22px] font-semibold sm:text-[26px] leading-none tracking-tight text-ink tabular-nums">
        {kpi.value}
      </p>
      <div className="relative mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
            positive ? "bg-good/10 text-good" : "bg-bad/10 text-bad",
          )}
        >
          <TrendIcon className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{positive ? "Up" : "Down"}</span>
          {Math.abs(kpi.change).toFixed(1)}%
        </span>
        <span className="text-ink-faint">{kpi.hint}</span>
      </div>
    </Card>
  );
}
