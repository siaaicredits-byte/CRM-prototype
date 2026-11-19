// Synthetic demo data for Phase 1. No database is connected yet; every page
// reads from here. Replace these exports with Prisma queries in Phase 2.

import type {
  AgentDefinition,
  Company,
  Contact,
  Deal,
  DealStage,
  DealStageId,
  Kpi,
  Lead,
  MonthlyPerformance,
  Task,
} from "@/types/crm";

/** Fixed "today" for the demo so renders are deterministic. */
export const DEMO_TODAY = "2026-11-17";

export const DEMO_USER = {
  name: "Alex Morgan",
  role: "Sales Manager",
  email: "alex.morgan@example.com",
};

export const dealStages: DealStage[] = [
  { id: "discovery", name: "Discovery", probability: 0.1 },
  { id: "qualified", name: "Qualified", probability: 0.25 },
  { id: "proposal", name: "Proposal", probability: 0.5 },
  { id: "negotiation", name: "Negotiation", probability: 0.75 },
  { id: "won", name: "Closed Won", probability: 1 },
];

/** Aggregate pipeline (all deals, not only the sample list below). */
export const pipelineSummary: Record<DealStageId, { count: number; value: number }> = {
  discovery: { count: 42, value: 1_260_000 },
  qualified: { count: 31, value: 1_085_000 },
  proposal: { count: 18, value: 864_000 },
  negotiation: { count: 11, value: 627_000 },
  won: { count: 24, value: 1_152_000 },
};

export const salesPerformance: MonthlyPerformance[] = [
  { month: "Dec", revenue: 182_000, target: 200_000, dealsWon: 14 },
  { month: "Jan", revenue: 164_000, target: 200_000, dealsWon: 12 },
  { month: "Feb", revenue: 198_000, target: 210_000, dealsWon: 15 },
  { month: "Mar", revenue: 231_000, target: 215_000, dealsWon: 18 },
  { month: "Apr", revenue: 219_000, target: 220_000, dealsWon: 16 },
  { month: "May", revenue: 247_000, target: 225_000, dealsWon: 19 },
  { month: "Jun", revenue: 262_000, target: 235_000, dealsWon: 20 },
  { month: "Jul", revenue: 238_000, target: 240_000, dealsWon: 17 },
  { month: "Aug", revenue: 274_000, target: 250_000, dealsWon: 21 },
  { month: "Sep", revenue: 301_000, target: 260_000, dealsWon: 23 },
  { month: "Oct", revenue: 289_000, target: 270_000, dealsWon: 22 },
  { month: "Nov", revenue: 318_000, target: 280_000, dealsWon: 24 },
];

const openStages: DealStageId[] = ["discovery", "qualified", "proposal", "negotiation"];

export const pipelineValue = openStages.reduce((sum, id) => sum + pipelineSummary[id].value, 0);
export const activeDeals = openStages.reduce((sum, id) => sum + pipelineSummary[id].count, 0);

export const kpis: Kpi[] = [
  { id: "leads", label: "Total Leads", value: "1,284", change: 12.4, hint: "vs last month" },
  { id: "contacts", label: "Total Contacts", value: "3,947", change: 6.8, hint: "vs last month" },
  { id: "deals", label: "Active Deals", value: String(activeDeals), change: 4.1, hint: "vs last month" },
  {
    id: "pipeline",
    label: "Pipeline Value",
    value: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(pipelineValue),
    change: 9.3,
    hint: "vs last month",
  },
  { id: "conversion", label: "Conversion Rate", value: "18.6%", change: -1.2, hint: "lead → won" },
];

export const leads: Lead[] = [
  { id: "L-1048", name: "Priya Raman", company: "Nimbus Logistics", email: "priya@nimbuslogistics.example", source: "Website", status: "New", value: 42_000, owner: "Alex Morgan", createdAt: "2026-11-17" },
  { id: "L-1047", name: "Daniel Okafor", company: "Brightpath Health", email: "d.okafor@brightpath.example", source: "Referral", status: "Qualified", value: 86_000, owner: "Sam Lee", createdAt: "2026-11-16" },
  { id: "L-1046", name: "Mei Tanaka", company: "Kitsune Studios", email: "mei@kitsune.example", source: "LinkedIn", status: "Contacted", value: 18_500, owner: "Jordan Diaz", createdAt: "2026-11-16" },
  { id: "L-1045", name: "Lucas Ferreira", company: "Atlas Fintech", email: "lucas.f@atlasfin.example", source: "Event", status: "Proposal", value: 124_000, owner: "Alex Morgan", createdAt: "2026-11-15" },
  { id: "L-1044", name: "Hannah Becker", company: "Greenline Energy", email: "h.becker@greenline.example", source: "Cold Outreach", status: "Contacted", value: 57_000, owner: "Sam Lee", createdAt: "2026-11-14" },
  { id: "L-1043", name: "Omar Haddad", company: "Cedar Retail Group", email: "omar@cedarretail.example", source: "Website", status: "Lost", value: 23_000, owner: "Jordan Diaz", createdAt: "2026-11-13" },
  { id: "L-1042", name: "Sofia Rossi", company: "Vela Robotics", email: "sofia.rossi@vela.example", source: "Referral", status: "Qualified", value: 98_000, owner: "Alex Morgan", createdAt: "2026-11-12" },
  { id: "L-1041", name: "Ethan Clarke", company: "Northwind Media", email: "ethan@northwind.example", source: "LinkedIn", status: "New", value: 31_000, owner: "Sam Lee", createdAt: "2026-11-12" },
];

export const contacts: Contact[] = [
  { id: "C-501", name: "Daniel Okafor", title: "VP Operations", company: "Brightpath Health", email: "d.okafor@brightpath.example", phone: "+1 415 555 0142", lastContacted: "2026-11-16" },
  { id: "C-502", name: "Sofia Rossi", title: "CTO", company: "Vela Robotics", email: "sofia.rossi@vela.example", phone: "+39 02 5550 1180", lastContacted: "2026-11-14" },
  { id: "C-503", name: "Lucas Ferreira", title: "Head of Product", company: "Atlas Fintech", email: "lucas.f@atlasfin.example", phone: "+55 11 5550 3321", lastContacted: "2026-11-15" },
  { id: "C-504", name: "Grace Kim", title: "Procurement Lead", company: "Summit Foods", email: "grace.kim@summitfoods.example", phone: "+1 212 555 0198", lastContacted: "2026-11-10" },
  { id: "C-505", name: "Ahmed Siddiqui", title: "CEO", company: "Orbital Analytics", email: "ahmed@orbital.example", phone: "+44 20 5550 7781", lastContacted: "2026-11-08" },
  { id: "C-506", name: "Hannah Becker", title: "Director of IT", company: "Greenline Energy", email: "h.becker@greenline.example", phone: "+49 30 5550 4410", lastContacted: "2026-11-14" },
];

export const companies: Company[] = [
  { id: "CO-21", name: "Atlas Fintech", industry: "Financial Services", employees: 420, location: "São Paulo, BR", openDeals: 3, totalValue: 284_000 },
  { id: "CO-22", name: "Brightpath Health", industry: "Healthcare", employees: 1_200, location: "San Francisco, US", openDeals: 2, totalValue: 172_000 },
  { id: "CO-23", name: "Vela Robotics", industry: "Manufacturing", employees: 310, location: "Milan, IT", openDeals: 2, totalValue: 196_000 },
  { id: "CO-24", name: "Greenline Energy", industry: "Energy", employees: 860, location: "Berlin, DE", openDeals: 1, totalValue: 57_000 },
  { id: "CO-25", name: "Orbital Analytics", industry: "Software", employees: 95, location: "London, UK", openDeals: 1, totalValue: 64_000 },
  { id: "CO-26", name: "Summit Foods", industry: "Consumer Goods", employees: 2_400, location: "New York, US", openDeals: 2, totalValue: 141_000 },
];

export const deals: Deal[] = [
  { id: "D-301", title: "Fleet tracking rollout", company: "Nimbus Logistics", stage: "discovery", value: 42_000, owner: "Alex Morgan", closeDate: "2027-01-30" },
  { id: "D-302", title: "Analytics platform", company: "Orbital Analytics", stage: "discovery", value: 64_000, owner: "Sam Lee", closeDate: "2027-02-14" },
  { id: "D-303", title: "Patient portal licences", company: "Brightpath Health", stage: "qualified", value: 86_000, owner: "Sam Lee", closeDate: "2026-12-20" },
  { id: "D-304", title: "Robotics fleet support", company: "Vela Robotics", stage: "qualified", value: 98_000, owner: "Alex Morgan", closeDate: "2027-01-10" },
  { id: "D-305", title: "Payments integration", company: "Atlas Fintech", stage: "proposal", value: 124_000, owner: "Alex Morgan", closeDate: "2026-12-12" },
  { id: "D-306", title: "Supplier portal", company: "Summit Foods", stage: "proposal", value: 71_000, owner: "Jordan Diaz", closeDate: "2026-12-18" },
  { id: "D-307", title: "Grid monitoring pilot", company: "Greenline Energy", stage: "negotiation", value: 57_000, owner: "Sam Lee", closeDate: "2026-11-28" },
  { id: "D-308", title: "Enterprise renewal", company: "Atlas Fintech", stage: "won", value: 160_000, owner: "Alex Morgan", closeDate: "2026-11-05" },
];

export const tasks: Task[] = [
  { id: "T-01", title: "Discovery call with Priya Raman", type: "Call", priority: "High", due: "2026-11-17T15:00:00Z", relatedTo: "Nimbus Logistics", done: false },
  { id: "T-02", title: "Send revised proposal", type: "Email", priority: "High", due: "2026-11-17T17:30:00Z", relatedTo: "Atlas Fintech", done: false },
  { id: "T-03", title: "Pricing review meeting", type: "Meeting", priority: "Medium", due: "2026-11-18T10:00:00Z", relatedTo: "Greenline Energy", done: false },
  { id: "T-04", title: "Follow up on security questionnaire", type: "Follow-up", priority: "Medium", due: "2026-11-18T14:00:00Z", relatedTo: "Brightpath Health", done: false },
  { id: "T-05", title: "Intro email to CTO", type: "Email", priority: "Low", due: "2026-11-19T09:30:00Z", relatedTo: "Vela Robotics", done: false },
];

export const agents: AgentDefinition[] = [
  {
    id: "lead-organizer",
    name: "Lead Organizer",
    description: "Cleans new leads, removes duplicates, tags industry and links each lead to a company.",
    trigger: "New lead or bulk import",
    status: "not-configured",
    lastRun: null,
  },
  {
    id: "lead-scorer",
    name: "Lead Scorer",
    description: "Scores each lead from 0–100 with the reasons and a suggested next step.",
    trigger: "After organizing, plus a nightly rescore",
    status: "not-configured",
    lastRun: null,
  },
  {
    id: "follow-up-writer",
    name: "Follow-Up Writer",
    description: "Drafts follow-up emails for your review. Drafts are never sent automatically.",
    trigger: "On request, or no reply after N days",
    status: "not-configured",
    lastRun: null,
  },
  {
    id: "deal-tracker",
    name: "Deal Tracker",
    description: "Flags stalled or at-risk deals and suggests actions to move them forward.",
    trigger: "Stage change, plus a daily check",
    status: "not-configured",
    lastRun: null,
  },
  {
    id: "meeting-assistant",
    name: "Meeting Assistant",
    description: "Prepares pre-meeting briefs and turns meeting notes into summaries and tasks.",
    trigger: "Before and after each meeting",
    status: "not-configured",
    lastRun: null,
  },
  {
    id: "sales-analyst",
    name: "Sales Analyst",
    description: "Answers questions about your pipeline and produces weekly performance reports.",
    trigger: "On demand, plus a weekly report",
    status: "not-configured",
    lastRun: null,
  },
];
