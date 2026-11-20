
import { getDatabaseLeads } from "@/lib/database-leads";
import { getDatabaseDeals } from "@/lib/database-deals";

export async function getDatabaseAnalytics() {
  const [leads, deals] = await Promise.all([
    getDatabaseLeads(),
    getDatabaseDeals(),
  ]);

  const leadStatuses = [
    "New",
    "Contacted",
    "Qualified",
    "Proposal",
    "Lost",
  ] as const;

  const leadSources = [
    "Website",
    "Referral",
    "LinkedIn",
    "Event",
    "Cold Outreach",
  ] as const;

  const dealStages = [
    "discovery",
    "qualified",
    "proposal",
    "negotiation",
    "won",
  ] as const;

  const statusSummary = Object.fromEntries(
    leadStatuses.map((status) => [
      status,
      leads.filter((lead) => lead.status === status).length,
    ])
  );

  const sourceSummary = Object.fromEntries(
    leadSources.map((source) => [
      source,
      leads.filter((lead) => lead.source === source).length,
    ])
  );

  const stageSummary = Object.fromEntries(
    dealStages.map((stage) => {
      const stageDeals = deals.filter(
        (deal) => deal.stage === stage
      );

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
  );

  const wonDeals = deals.filter(
    (deal) => deal.stage === "won"
  ).length;

  const conversionRate =
    deals.length > 0
      ? (wonDeals / deals.length) * 100
      : 0;

  const totalPipelineValue = deals
    .filter((deal) => deal.stage !== "won")
    .reduce((sum, deal) => sum + Number(deal.value), 0);

  return {
    totalLeads: leads.length,
    totalDeals: deals.length,
    wonDeals,
    conversionRate,
    totalPipelineValue,
    statusSummary,
    sourceSummary,
    stageSummary,
  };
}
