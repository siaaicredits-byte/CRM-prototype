import type { LucideIcon } from "lucide-react";
import { Activity, CalendarClock, ChartLine, Gauge, ListFilter, PenLine } from "lucide-react";
import type { BadgeTone } from "@/components/ui/Badge";
import type { AgentId, AgentStatus } from "@/types/crm";

export const agentIcons: Record<AgentId, LucideIcon> = {
  "lead-organizer": ListFilter,
  "lead-scorer": Gauge,
  "follow-up-writer": PenLine,
  "deal-tracker": Activity,
  "meeting-assistant": CalendarClock,
  "sales-analyst": ChartLine,
};

export const agentStatusLabel: Record<AgentStatus, { label: string; tone: BadgeTone }> = {
  "not-configured": { label: "Not connected", tone: "neutral" },
  idle: { label: "Idle", tone: "accent" },
  running: { label: "Running", tone: "good" },
  error: { label: "Error", tone: "bad" },
};
