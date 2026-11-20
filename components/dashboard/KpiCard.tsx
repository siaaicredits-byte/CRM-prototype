
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  DollarSign,
  Handshake,
  Percent,
  UserPlus,
  Users,
} from "lucide-react";
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

export function KpiCard({
  kpi,
  index = 0,
  className,
}: KpiCardProps) {
  const Icon = kpiIcons[kpi.id] ?? DollarSign;

  const hasComparison =
    kpi.hint !== "Current records" &&
    kpi.hint !== "Open pipeline" &&
    kpi.hint !== "Open deal value" &&
    kpi.hint !== "Won deals / all deals";

  const positive = kpi.change > 0;
  const negative = kpi.change < 0;

  const TrendIcon = positive
    ? ArrowUpRight
    : negative
      ? ArrowDownRight
      : Minus;

  return (
    <Card
      delay={index}
      className={cn(
        "group relative overflow-hidden p-4 transition-colors hover:border-line-strong sm:p-5",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-60"
      />

      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted">
          {kpi.label}
        </p>

        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/20">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>

      <p className="relative mt-3 text-[22px] font-semibold leading-none tracking-tight text-ink tabular-nums sm:text-[26px]">
        {kpi.value}
      </p>

      <div className="relative mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {hasComparison ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
              positive
                ? "bg-good/10 text-good"
                : negative
                  ? "bg-bad/10 text-bad"
                  : "bg-surface-raised text-ink-muted"
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {Math.abs(kpi.change).toFixed(1)}%
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-raised px-1.5 py-0.5 text-ink-muted">
            <Minus className="size-3.5" aria-hidden="true" />
            Live
          </span>
        )}

        <span className="text-ink-faint">{kpi.hint}</span>
      </div>
    </Card>
  );
}
