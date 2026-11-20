import type { Metadata } from "next";
import { AgentWorkspace } from "@/components/agents/AgentWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";
import { MeetingAssistantPanel } from "@/components/agents/MeetingAssistantPanel";
import { SalesAnalystPanel } from "@/components/agents/SalesAnalystPanel";

export const metadata: Metadata = {
  title: "AI Agents",
};

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Agents"
        description="Run CRM agents to score leads and prepare sales actions."
      />

      <div className="rounded-2xl border border-accent/25 bg-accent-soft p-4 text-sm text-ink">
  <span className="font-medium">Six CRM agents are available.</span>{" "}
  <span className="text-ink-muted">
    Agents currently use rule-based logic and templates to organise leads,
    calculate scores, prepare follow-ups, track deals, prepare meetings,
    and analyse sales. Claude-powered functionality requires API configuration.
  </span>
</div>

      <AgentWorkspace />

      <SalesAnalystPanel />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Meeting Assistant
          </h2>
          <p className="text-sm text-ink-muted">
            Prepare meeting agendas and organise follow-up actions.
          </p>
        </div>

        <MeetingAssistantPanel />
      </section>
    </div>
  );
}
