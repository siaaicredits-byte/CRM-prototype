
import { getCurrentUser } from "@/lib/auth/authenticate";
import { getDatabaseLeads } from "@/lib/database-leads";
import { getDatabaseContacts } from "@/lib/database-contacts";
import { getDatabaseDeals } from "@/lib/database-deals";
import { getDatabaseTasks } from "@/lib/database-tasks";
import { db } from "@/src/prisma/db";
import type { DealStageId, Kpi } from "@/types/crm";

const dealStageIds: DealStageId[] = [
  "discovery",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];

const openStages: DealStageId[] = [
  "discovery",
  "qualified",
  "proposal",
  "negotiation",
];

export async function getDashboardData() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const [leads, contacts, deals, tasks, user] = await Promise.all([
    getDatabaseLeads(),
    getDatabaseContacts(),
    getDatabaseDeals(),
    getDatabaseTasks(),
    db.orm.public.User.where({ id: currentUser.id }).first(),
  ]);

  const pipelineSummary = Object.fromEntries(
    dealStageIds.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);

      return [
        stage,
        {
          count: stageDeals.length,
          value: stageDeals.reduce(
            (sum, deal) => sum + Number(deal.value),
            0
          ),
        },
      ];
    })
  ) as Record<DealStageId, { count: number; value: number }>;

  const activeDeals = deals.filter((deal) =>
    openStages.includes(deal.stage)
  );

  const pipelineValue = activeDeals.reduce(
    (sum, deal) => sum + Number(deal.value),
    0
  );

  const wonDeals = deals.filter((deal) => deal.stage === "won").length;

  const conversionRate =
    deals.length > 0
      ? (wonDeals / deals.length) * 100
      : 0;

  const kpis: Kpi[] = [
    {
      id: "leads",
      label: "Total Leads",
      value: String(leads.length),
      change: 0,
      hint: "Current records",
    },
    {
      id: "contacts",
      label: "Total Contacts",
      value: String(contacts.length),
      change: 0,
      hint: "Current records",
    },
    {
      id: "deals",
      label: "Active Deals",
      value: String(activeDeals.length),
      change: 0,
      hint: "Open pipeline",
    },
    {
      id: "pipeline",
      label: "Pipeline Value",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(pipelineValue),
      change: 0,
      hint: "Open deal value",
    },
    {
      id: "conversion",
      label: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      change: 0,
      hint: "Won deals / all deals",
    },
  ];

  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  const today = new Date().toISOString().slice(0, 10);

  const upcomingTasks = tasks
    .filter((task) => !task.done)
    .sort(
      (a, b) =>
        new Date(a.due).getTime() - new Date(b.due).getTime()
    );

  return {
    user: {
      name: user?.name || currentUser.name || "User",
    },
    today,
    kpis,
    leads: recentLeads,
    tasks: upcomingTasks,
    activeDeals,
    pipelineSummary,
    pipelineValue,
  };
}
