import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { AgentStatus } from "@/types/crm";
import { agentStatusLabel } from "./agent-meta";

const dotClass: Record<AgentStatus, string> = {
  "not-configured": "bg-ink-faint",
  idle: "bg-accent",
  running: "bg-good animate-pulse-dot",
  error: "bg-bad",
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const { label, tone } = agentStatusLabel[status];
  return (
    <Badge tone={tone}>
      <span className={cn("size-1.5 rounded-full", dotClass[status])} aria-hidden="true" />
      {label}
    </Badge>
  );
}
