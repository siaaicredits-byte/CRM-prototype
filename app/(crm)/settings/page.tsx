import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlannedFeatures } from "@/components/ui/PlannedFeatures";
import { DEMO_USER } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your profile, team and workspace configuration." />
      <Card delay={1}>
        <CardHeader title="Profile" description="Demo account" />
        <CardBody>
          <div className="flex items-center gap-4">
            <Avatar name={DEMO_USER.name} size="md" />
            <div className="min-w-0">
              <p className="font-medium text-ink">{DEMO_USER.name}</p>
              <p className="truncate text-sm text-ink-muted">
                {DEMO_USER.role} · {DEMO_USER.email}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      <PlannedFeatures
        icon={Settings}
        title="Workspace settings"
        description="Configuration arrives together with authentication and the database."
        features={[
          "Team members, roles and permissions",
          "Pipeline stages and win probabilities",
          "AI provider key and per-agent settings",
          "Email and calendar integrations",
          "Notification preferences",
          "Data import and export",
        ]}
      />
    </div>
  );
}
