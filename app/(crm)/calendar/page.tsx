
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarMonth } from "@/components/calendar/CalendarMonth";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDatabaseTasks } from "@/lib/database-tasks";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  await connection();

  const tasks = await getDatabaseTasks();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Your meetings, calls and follow-ups in one place."
      />

      <Card className="p-5">
        <CalendarMonth tasks={tasks} />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Your task agenda"
          description="Tasks scheduled by you."
        />
        <div className="pt-2">
          <UpcomingTasks tasks={tasks} today={today} />
        </div>
      </Card>
    </div>
  );
}
