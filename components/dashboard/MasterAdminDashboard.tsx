
import Link from "next/link";
import {
  Users,
  FolderKanban,
  UserPlus,
  Contact,
  Handshake,
  DollarSign,
  CheckCircle2,
  Clock3,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { getMasterAdminDashboardData } from "@/lib/database-master-admin-dashboard";

type DashboardData = NonNullable<
  Awaited<ReturnType<typeof getMasterAdminDashboardData>>
>;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export function MasterAdminDashboard({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const { stats, roleCounts } = dashboard;

  const metrics = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      hint: `${stats.activeUsers} active accounts`,
      icon: Users,
    },
    {
      label: "Total Projects",
      value: stats.totalProjects,
      hint: `${stats.activeProjects} active projects`,
      icon: FolderKanban,
    },
    {
      label: "Total Leads",
      value: stats.totalLeads,
      hint: "Organisation-wide",
      icon: UserPlus,
    },
    {
      label: "Total Contacts",
      value: stats.totalContacts,
      hint: "Organisation-wide",
      icon: Contact,
    },
    {
      label: "Total Deals",
      value: stats.totalDeals,
      hint: `${stats.activeDeals} open deals`,
      icon: Handshake,
    },
    {
      label: "Pipeline Value",
      value: currency.format(stats.pipelineValue),
      hint: "Open deal value",
      icon: DollarSign,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      hint: `${stats.totalTasks} total tasks`,
      icon: CheckCircle2,
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      hint: "Tasks not completed",
      icon: Clock3,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${dashboard.user.name.split(" ")[0]}`}
        description="Organisation-wide overview of your PulseCRM workspace."
      />

      <section
        aria-label="Organisation metrics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="relative overflow-hidden p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-ink-muted">
                  {metric.label}
                </p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">
                {metric.value}
              </p>
              <p className="mt-2 text-xs text-ink-faint">
                {metric.hint}
              </p>
            </Card>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Project performance"
            description="Projects, assigned members and lead counts"
            action={
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-ink"
              >
                Manage
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody>
            {dashboard.projects.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No projects have been created yet.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard.projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs text-ink-muted">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <span
                        className={
                          project.isActive
                            ? "rounded-full bg-good/10 px-2.5 py-1 text-xs text-good"
                            : "rounded-full bg-surface-raised px-2.5 py-1 text-xs text-ink-muted"
                        }
                      >
                        {project.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-lg font-semibold text-ink tabular-nums">
                          {project.leadCount}
                        </p>
                        <p className="text-xs text-ink-muted">Leads</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-ink tabular-nums">
                          {project.memberCount}
                        </p>
                        <p className="text-xs text-ink-muted">Members</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-ink tabular-nums">
                          {project.salesExecutiveCount}
                        </p>
                        <p className="text-xs text-ink-muted">Executives</p>
                      </div>
                    </div>

                    {project.members.length > 0 && (
                      <div className="mt-4 border-t border-line pt-3">
                        <p className="mb-2 text-xs font-medium text-ink-muted">
                          Assigned team
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.members.map((member) => (
                            <span
                              key={member.id}
                              className="rounded-lg bg-surface-raised px-2.5 py-1.5 text-xs text-ink-muted"
                            >
                              {member.name} · {member.role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Team overview"
            description="Users grouped by role"
          />
          <CardBody>
            <div className="space-y-5">
              {[
                ["Master Admin", roleCounts.MASTER_ADMIN],
                ["Managers", roleCounts.MANAGER],
                ["Sales Executives", roleCounts.SALES_REP],
              ].map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-ink-muted">{label}</span>
                  <span className="text-lg font-semibold text-ink tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
              <div className="border-t border-line pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Active accounts</span>
                  <span className="font-semibold text-good">
                    {stats.activeUsers}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-ink-muted">Inactive accounts</span>
                  <span className="font-semibold text-ink">
                    {stats.inactiveUsers}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recently registered users"
          description="Latest five accounts in your organisation"
        />
        <CardBody>
          {dashboard.recentUsers.length === 0 ? (
            <p className="text-sm text-ink-muted">No users found.</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {user.name}
                    </p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-surface-raised px-2 py-1 text-xs text-ink-muted">
                      {user.role}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
