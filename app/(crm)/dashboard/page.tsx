
import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AgentStatusPanel } from "@/components/dashboard/AgentStatusPanel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDashboardData } from "@/lib/database-dashboard";
import { agents, dealStages } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/authenticate";
import { getMasterAdminDashboardData } from "@/lib/database-master-admin-dashboard";
import { MasterAdminDashboard } from "@/components/dashboard/MasterAdminDashboard";

export const metadata: Metadata = { title: "Dashboard" };
export const instant = false;

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

export default async function DashboardPage() {
  await connection();

  const currentUser = await getCurrentUser();

  if (currentUser?.role === "MASTER_ADMIN") {
    const masterDashboard = await getMasterAdminDashboardData();

    if (!masterDashboard) {
      return null;
    }

    return <MasterAdminDashboard dashboard={masterDashboard} />;
  }

  const dashboard = await getDashboardData();

  if (!dashboard) {
    return null;
  }

  const openPipelineValue = dashboard.pipelineValue;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${dashboard.user.name.split(" ")[0]}`}
        description={`Here's how your pipeline looks today, ${formatDate(dashboard.today)}. Showing your live CRM data.`}
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5"
      >
        {dashboard.kpis.map((kpi, index) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            index={index}
            className={
              index === dashboard.kpis.length - 1 &&
              dashboard.kpis.length % 2 === 1
                ? "col-span-2 xl:col-span-1"
                : undefined
            }
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card delay={5} className="xl:col-span-2">
          <CardHeader
            title="Sales pipeline"
            description="Deal value by stage"
            action={
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums text-ink">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                    maximumFractionDigits: 2,
                  }).format(openPipelineValue)}
                </p>
                <p className="text-xs text-ink-muted">Open pipeline value</p>
              </div>
            }
          />
          <CardBody>
            <PipelineOverview
              stages={dealStages}
              summary={dashboard.pipelineSummary}
            />
          </CardBody>
        </Card>

        <Card delay={6} className="overflow-hidden">
          <CardHeader
            title="Upcoming tasks"
            description={`${dashboard.tasks.length} open tasks`}
            action={<ViewAllLink href="/calendar" label="Calendar" />}
          />
          <div className="pt-2">
            <UpcomingTasks
              tasks={dashboard.tasks}
              today={dashboard.today}
            />
          </div>
        </Card>
      </div>

      <Card delay={7} className="overflow-hidden">
        <CardHeader
          title="Recent leads"
          description="Your newest leads"
          action={<ViewAllLink href="/leads" label="View all" />}
        />
        <div className="pt-3">
          <RecentLeadsTable leads={dashboard.leads} />
        </div>
      </Card>

      <Card delay={8}>
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
