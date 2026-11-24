
import type { Metadata } from "next";
import { connection } from "next/server";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDatabaseAnalytics } from "@/lib/database-analytics";
import { formatCurrency, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics" };

const statusLabels = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Lost",
] as const;

const sourceLabels = [
  "Website",
  "Referral",
  "LinkedIn",
  "Event",
  "Cold Outreach",
] as const;

const stageLabels = [
  ["discovery", "Discovery"],
  ["qualified", "Qualified"],
  ["proposal", "Proposal"],
  ["negotiation", "Negotiation"],
  ["won", "Closed Won"],
] as const;

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-muted">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-xs text-ink-faint">{description}</p>
    </Card>
  );
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <Card>
      <CardHeader
        title={title}
        description="Based on your current CRM records"
      />
      <CardBody>
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="text-ink">{item.label}</span>
                <span className="font-medium tabular-nums text-ink-muted">
                  {formatNumber(item.count)}
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{
                    width: `${(item.count / max) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default async function AnalyticsPage() {
  await connection();

  const analytics = await getDatabaseAnalytics();

  const statusItems = statusLabels.map((label) => ({
    label,
    count: analytics.statusSummary[label] ?? 0,
  }));

  const sourceItems = sourceLabels.map((label) => ({
    label,
    count: analytics.sourceSummary[label] ?? 0,
  }));

  const stageItems = stageLabels.map(([key, label]) => ({
    label,
    count: analytics.stageSummary[key]?.count ?? 0,
    value: analytics.stageSummary[key]?.value ?? 0,
  }));

  // Total value across all deal stages, including Closed Won.
  const totalStageValue = stageItems.reduce(
    (sum, stage) => sum + stage.value,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Reports generated from your live CRM database."
      />

      {/* Main metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Leads"
          value={formatNumber(analytics.totalLeads)}
          description="Current lead records"
        />

        <MetricCard
          title="Total Deals"
          value={formatNumber(analytics.totalDeals)}
          description="All deal records"
        />

        <MetricCard
          title="Won Deals"
          value={formatNumber(analytics.wonDeals)}
          description="Successfully closed deals"
        />

        <MetricCard
          title="Deal Win Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          description="Won deals / all deals"
        />

        <MetricCard
          title="Open Pipeline"
          value={formatCurrency(analytics.totalPipelineValue)}
          description="Value excluding Closed Won"
        />
      </section>

      {/* Lead reports */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Breakdown
          title="Leads by status"
          items={statusItems}
        />

        <Breakdown
          title="Leads by source"
          items={sourceItems}
        />
      </div>

      {/* Deal pipeline */}
      <Card>
        <CardHeader
          title="Deals by pipeline stage"
          description="Deal count and value across all pipeline stages"
        />

        <CardBody>
          <div className="space-y-5">
            {stageItems.map((stage) => {
              const percentage =
                totalStageValue > 0
                  ? (stage.value / totalStageValue) * 100
                  : 0;

              return (
                <div key={stage.label}>
                  <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-ink">
                      {stage.label}
                      <span className="ml-2 text-ink-faint">
                        {formatNumber(stage.count)} deals
                      </span>
                    </span>

                    <span className="font-medium tabular-nums text-ink">
                      {formatCurrency(stage.value)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-ink-faint">
                    {percentage.toFixed(1)}% of total deal value
                  </p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
