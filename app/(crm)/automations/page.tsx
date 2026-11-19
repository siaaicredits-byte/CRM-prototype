import type { Metadata } from "next";
import { Workflow } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlannedFeatures } from "@/components/ui/PlannedFeatures";

export const metadata: Metadata = { title: "Automations" };

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Automations" description="Rules that run actions and agents when something happens in your CRM." />
      <PlannedFeatures
        icon={Workflow}
        title="Workflow automations"
        description="Build trigger → condition → action rules without code. Automations will also decide when each AI agent runs."
        features={[
          "Triggers: new lead, stage change, no reply in N days",
          "Conditions on lead score, deal value or owner",
          "Actions: assign owner, create task, run an agent",
          "Run history with success and failure logs",
          "Enable, pause or duplicate any automation",
          "Ready-made templates for common sales plays",
        ]}
      />
    </div>
  );
}
