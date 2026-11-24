
import type { Metadata } from "next";
import { connection } from "next/server";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDatabaseTasks } from "@/lib/database-tasks";

export const metadata: Metadata = {
  title: "Tasks",
};

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

export default async function TasksPage() {
  await connection();

  const tasks = await getDatabaseTasks();
  const today = getTodayDateKey();

  const completedTasks = tasks.filter((task) => task.done).length;
  const pendingTasks = tasks.length - completedTasks;
  const overdueTasks = tasks.filter(
    (task) => !task.done && task.due.slice(0, 10) < today
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        description="Manage your calls, meetings, emails and follow-ups."
        actions={
          <Badge tone="accent">Live database</Badge>
        }
      />

      {/* Task statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-ink-muted">Total tasks</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {tasks.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            All your assigned tasks
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-muted">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {pendingTasks}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Tasks waiting for completion
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-muted">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-500">
            {completedTasks}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Successfully completed tasks
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-muted">Overdue</p>
          <p className="mt-2 text-3xl font-semibold text-red-400">
            {overdueTasks}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Pending tasks past their due date
          </p>
        </Card>
      </div>

      {/* Tasks list and management */}
      <Card className="overflow-hidden">
        <CardHeader
          title="All tasks"
          description={`${tasks.length} tasks loaded from your database`}
        />

        <UpcomingTasks tasks={tasks} today={today} />
      </Card>
    </div>
  );
}
