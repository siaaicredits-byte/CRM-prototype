
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import AutomationWorkspace from "@/components/automations/AutomationWorkspace";

export const metadata: Metadata = {
  title: "Automations",
};

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automations"
        description="Create workflows that automatically perform actions when CRM events occur."
      />
      <AutomationWorkspace />
    </div>
  );
}
