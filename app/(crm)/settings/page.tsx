
import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlannedFeatures } from "@/components/ui/PlannedFeatures";
import { getCurrentUser } from "@/lib/auth/authenticate";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Your profile, team and workspace configuration."
      />

      <Card delay={1}>
        <CardHeader
          title="Profile"
          description="Your account information"
        />
        <CardBody>
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar name={user.name || user.email} size="md" />
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {user.name || "User"}
                </p>
                <p className="truncate text-sm text-ink-muted">
                  {user.role} · {user.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Unable to load profile information.
            </p>
          )}
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
