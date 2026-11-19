import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { LeadStatus } from "@/types/crm";

const statusTone: Record<LeadStatus, BadgeTone> = {
  New: "accent",
  Contacted: "neutral",
  Qualified: "good",
  Proposal: "warn",
  Lost: "bad",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}
