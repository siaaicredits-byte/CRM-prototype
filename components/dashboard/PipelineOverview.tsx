import { formatCurrency, formatNumber } from "@/lib/format";
import type { DealStage, DealStageId } from "@/types/crm";

interface PipelineOverviewProps {
  stages: DealStage[];
  summary: Record<DealStageId, { count: number; value: number }>;
}

/** Horizontal bars: deal value per pipeline stage. */
export function PipelineOverview({ stages, summary }: PipelineOverviewProps) {
const maxValue = Math.max(
  1,
  ...stages.map((stage) => summary[stage.id].value)
);
  const openStages = stages.filter((stage) => stage.id !== "won");
  const weighted = openStages.reduce(
    (sum, stage) => sum + summary[stage.id].value * stage.probability,
    0,
  );

  return (
    <div>
      <ul className="space-y-4">
        {stages.map((stage, index) => {
          const { count, value } = summary[stage.id];
          const percent = (value / maxValue) * 100;
          return (
            <li key={stage.id} className="group">
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                <span className="font-medium text-ink">
                  {stage.name}
                  <span className="ml-1.5 font-normal text-ink-faint">
                    {formatNumber(count)} {count === 1 ? "deal" : "deals"}
                  </span>
                </span>
                <span className="font-medium tabular-nums text-ink">{formatCurrency(value, { compact: true })}</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-surface-raised"
                title={`${stage.name}: ${formatCurrency(value)} across ${count} deals · ${Math.round(stage.probability * 100)}% win probability`}
              >
                <div
                  className="animate-grow-x h-full origin-left rounded-full bg-accent transition-[filter] group-hover:brightness-125"
                  style={{ width: `${percent}%`, animationDelay: `${150 + index * 80}ms` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <dt className="text-xs text-ink-muted">Open pipeline</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink">
            {formatCurrency(
              openStages.reduce((sum, stage) => sum + summary[stage.id].value, 0),
              { compact: true },
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Weighted forecast</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-ink">
            {formatCurrency(weighted, { compact: true })}
          </dd>
        </div>
      </dl>
    </div>
  );
}
