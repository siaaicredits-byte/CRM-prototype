
import { agentIcons } from "@/components/agents/agent-meta";
import type { AgentDefinition } from "@/types/crm";

interface AgentStatusPanelProps {
  agents: AgentDefinition[];
}

/** Dashboard status grid for the six implemented CRM agents. */
export function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
  return (
    <div>
      <p className="mb-4 text-xs text-ink-muted">
        <span className="font-medium text-ink tabular-nums">
          {agents.length} of {agents.length} agents
        </span>{" "}
        available. Currently powered by rule-based logic and templates.
        Claude API integration is not configured yet.
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
                  <p className="text-sm font-medium text-ink">
                    {agent.name}
                  </p>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    Available
                  </span>
                </div>

                <p className="mt-1 text-xs text-ink-faint">
                  Rule-based / template-based
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
