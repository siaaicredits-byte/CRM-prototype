import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AgentStatusPanel } from "@/components/dashboard/AgentStatusPanel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  DEMO_TODAY,
  DEMO_USER,
  agents,
  dealStages,
  kpis,
  leads,
  pipelineSummary,
  salesPerformance,
  tasks,
} from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 rounded-md text-xs font-medium text-accent-hover transition-colors hover:text-ink"
    >
      {label}
      <ChevronRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

export default function DashboardPage() {
  const ytdRevenue = salesPerformance.reduce((sum, month) => sum + month.revenue, 0);
  const ytdTarget = salesPerformance.reduce((sum, month) => sum + month.target, 0);
  const vsTarget = ((ytdRevenue - ytdTarget) / ytdTarget) * 100;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${DEMO_USER.name.split(" ")[0]}`}
        description={`Here's how your pipeline looks today, ${formatDate(DEMO_TODAY)}. Showing demo data.`}
      />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            index={index}
            // With an odd count, let the last card span the row on 2-column layouts.
            className={index === kpis.length - 1 && kpis.length % 2 === 1 ? "col-span-2 xl:col-span-1" : undefined}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card delay={5} className="xl:col-span-2">
          <CardHeader
            title="Sales performance"
            description="Monthly revenue vs target, last 12 months"
            action={
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums text-ink">{formatCurrency(ytdRevenue, { compact: true })}</p>
                <p className={vsTarget >= 0 ? "text-xs text-good" : "text-xs text-bad"}>
                  {vsTarget >= 0 ? "+" : ""}
                  {vsTarget.toFixed(1)}% vs target
                </p>
              </div>
            }
          />
          <CardBody className="pt-3">
            <SalesPerformanceChart data={salesPerformance} />
          </CardBody>
        </Card>

        <Card delay={6}>
          <CardHeader
            title="Sales pipeline"
            description="Deal value by stage"
            action={<ViewAllLink href="/deals" label="Deals" />}
          />
          <CardBody>
            <PipelineOverview stages={dealStages} summary={pipelineSummary} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card delay={7} className="overflow-hidden xl:col-span-2">
          <CardHeader
            title="Recent leads"
            description="Newest leads across all sources"
            action={<ViewAllLink href="/leads" label="View all" />}
          />
          <div className="pt-3">
            <RecentLeadsTable leads={leads.slice(0, 6)} />
          </div>
        </Card>

        <Card delay={8} className="overflow-hidden">
          <CardHeader
            title="Upcoming tasks"
            description={`${tasks.length} open tasks`}
            action={<ViewAllLink href="/calendar" label="Calendar" />}
          />
          <div className="pt-2">
            <UpcomingTasks tasks={tasks} today={DEMO_TODAY} />
          </div>
        </Card>
      </div>

      <Card delay={9}>
        <CardHeader
          title="AI agents"
          description="Status of the six sales agents"
          action={<ViewAllLink href="/agents" label="Manage" />}
        />
        <CardBody>
          <AgentStatusPanel agents={agents} />
        </CardBody>
      </Card>
    </div>
  );
}
