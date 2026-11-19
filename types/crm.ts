// Domain types for the CRM. These mirror the planned Prisma models so the
// demo data can be swapped for database queries in a later phase.

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Lost";
export type LeadSource = "Website" | "Referral" | "LinkedIn" | "Event" | "Cold Outreach";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  /** Estimated deal value in USD. */
  value: number;
  owner: string;
  /** ISO date (YYYY-MM-DD). */
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  lastContacted: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  employees: number;
  location: string;
  openDeals: number;
  totalValue: number;
}

export type DealStageId = "discovery" | "qualified" | "proposal" | "negotiation" | "won";

export interface DealStage {
  id: DealStageId;
  name: string;
  /** Default win probability for the stage, 0–1. */
  probability: number;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  stage: DealStageId;
  value: number;
  owner: string;
  closeDate: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskType = "Call" | "Email" | "Meeting" | "Follow-up";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  priority: TaskPriority;
  /** ISO date-time (UTC). */
  due: string;
  relatedTo: string;
  done: boolean;
}

export interface MonthlyPerformance {
  /** Short month label, e.g. "Jun". */
  month: string;
  revenue: number;
  target: number;
  dealsWon: number;
}

export type AgentId =
  | "lead-organizer"
  | "lead-scorer"
  | "follow-up-writer"
  | "deal-tracker"
  | "meeting-assistant"
  | "sales-analyst";

/**
 * Agents are not connected yet. "not-configured" is the honest state for
 * Phase 1; the other states are used once the AI layer is implemented.
 */
export type AgentStatus = "not-configured" | "idle" | "running" | "error";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description: string;
  /** What will cause the agent to run once it is connected. */
  trigger: string;
  status: AgentStatus;
  lastRun: string | null;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  /** Change vs previous period, in percent. */
  change: number;
  hint: string;
}
