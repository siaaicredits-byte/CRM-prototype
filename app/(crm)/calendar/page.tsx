
import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarMonth } from "@/components/calendar/CalendarMonth";
import { CalendarEventManager } from "@/components/calendar/CalendarEventManager";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDatabaseTasks } from "@/lib/database-tasks";
import { getDatabaseCalendarEvents } from "@/lib/database-calendar-events";

export const metadata: Metadata = { title: "Calendar" };

function getTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export default async function CalendarPage() {
  await connection();

  const [tasks, events] = await Promise.all([
    getDatabaseTasks(),
    getDatabaseCalendarEvents(),
  ]);

  const today = getTodayDateKey();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Your meetings, calls and follow-ups in one place."
      />

      <Card className="p-5">
        <CalendarMonth tasks={tasks} events={events} />
      </Card>

      <Card className="p-5">
        <CalendarEventManager events={events} />
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
