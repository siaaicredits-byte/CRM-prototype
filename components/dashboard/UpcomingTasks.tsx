import type { LucideIcon } from "lucide-react";
import { CalendarClock, Mail, Phone, Repeat } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/format";
import type { Task, TaskPriority, TaskType } from "@/types/crm";

const typeIcon: Record<TaskType, LucideIcon> = {
  Call: Phone,
  Email: Mail,
  Meeting: CalendarClock,
  "Follow-up": Repeat,
};

const priorityTone: Record<TaskPriority, BadgeTone> = {
  High: "bad",
  Medium: "warn",
  Low: "neutral",
};

interface UpcomingTasksProps {
  tasks: Task[];
  /** ISO date used to label tasks as "Today". */
  today: string;
}

export function UpcomingTasks({ tasks, today }: UpcomingTasksProps) {
  if (tasks.length === 0) {
    return <p className="px-5 pb-5 text-sm text-ink-muted">No upcoming tasks.</p>;
  }

  return (
    <ul className="divide-y divide-line/70">
      {tasks.map((task) => {
        const Icon = typeIcon[task.type];
        const isToday = task.due.startsWith(today);
        return (
          <li key={task.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-raised/50">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-ink-muted ring-1 ring-line">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{task.title}</p>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {task.relatedTo} · <span className={isToday ? "text-accent-hover" : undefined}>{isToday ? "Today" : formatDate(task.due)}</span>{" "}
                {formatTime(task.due)} UTC
              </p>
            </div>
            <Badge tone={priorityTone[task.priority]} className="mt-0.5">
              {task.priority}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
