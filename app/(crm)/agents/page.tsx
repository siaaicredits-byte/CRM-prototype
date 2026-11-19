import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { agentIcons } from "@/components/agents/agent-meta";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { agents } from "@/lib/demo-data";

export const metadata: Metadata = { title: "AI Agents" };

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Agents"
        description="Six specialised agents that will organise, score, write, track, prepare and analyse."
      />

      <div className="animate-fade-up rounded-2xl border border-accent/25 bg-accent-soft p-4 text-sm text-ink">
        <p>
          <span className="font-medium">Not connected yet.</span>{" "}
          <span className="text-ink-muted">
            The agents are defined here, but none run in this phase. They are connected to the AI provider and
            database in a later phase. Until then, nothing on this page produces AI output.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => {
          const Icon = agentIcons[agent.id];
          return (
            <Card key={agent.id} delay={index + 1} className="flex flex-col p-5 transition-colors hover:border-line-strong">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/25">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <AgentStatusBadge status={agent.status} />
              </div>
              <h2 className="mt-4 font-semibold text-ink">{agent.name}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-muted">{agent.description}</p>
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
                <div className="flex items-start gap-2">
                  <dt className="flex items-center gap-1.5 text-ink-faint">
                    <Zap className="size-3.5" aria-hidden="true" />
                    Trigger
                  </dt>
                  <dd className="text-ink">{agent.trigger}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="text-ink-faint">Last run</dt>
                  <dd className="text-ink">{agent.lastRun ?? "Never"}</dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
