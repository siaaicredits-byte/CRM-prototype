import { agentIcons } from "@/components/agents/agent-meta";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import type { AgentDefinition } from "@/types/crm";

interface AgentStatusPanelProps {
  agents: AgentDefinition[];
}

/** Compact status grid for the six AI agents. Agents are not connected in Phase 1. */
export function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
  const connected = agents.filter((agent) => agent.status !== "not-configured").length;

  return (
    <div>
      <p className="mb-4 text-xs text-ink-muted">
        <span className="font-medium text-ink tabular-nums">
          {connected} of {agents.length}
        </span>{" "}
        agents connected. The AI layer is set up in a later phase.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agentIcons[agent.id];
          return (
            <li
              key={agent.id}
              className="flex gap-3 rounded-xl border border-line bg-navy-900/50 p-3.5 transition-colors hover:border-line-strong"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/20">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <p className="text-sm font-medium text-ink">{agent.name}</p>
                  <AgentStatusBadge status={agent.status} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  Last run: {agent.lastRun ?? "never"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
