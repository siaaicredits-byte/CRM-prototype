import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlannedFeatures } from "@/components/ui/PlannedFeatures";
import { DEMO_TODAY, tasks } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Meetings, calls and follow-ups in one place."
        actions={<Badge tone="accent">Demo data</Badge>}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card delay={1} className="overflow-hidden xl:col-span-2">
          <CardHeader title="Agenda" description="Next three days" />
          <div className="pt-2">
            <UpcomingTasks tasks={tasks} today={DEMO_TODAY} />
          </div>
        </Card>
        <div className="xl:col-span-3">
          <PlannedFeatures
            icon={CalendarDays}
            title="Full calendar"
            description="A month, week and day view of everything on your schedule, synced with your work calendar."
            features={[
              "Month, week and day views",
              "Google and Outlook calendar sync",
              "Create meetings linked to deals",
              "Pre-meeting briefs from the Meeting Assistant",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
