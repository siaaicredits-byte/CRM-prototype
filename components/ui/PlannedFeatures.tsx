import type { LucideIcon } from "lucide-react";
import { CircleDashed } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface PlannedFeaturesProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  phase?: string;
}

/** Honest placeholder for sections whose functionality arrives in a later phase. */
export function PlannedFeatures({ icon: Icon, title, description, features, phase = "Phase 2" }: PlannedFeaturesProps) {
  return (
    <Card delay={1} className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-accent/30">
          <Icon className="size-7" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-line-strong">
              Planned · {phase}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
