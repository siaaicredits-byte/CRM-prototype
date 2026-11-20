
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";
import type { Task, TaskPriority, TaskType } from "@/types/crm";

const validTypes: TaskType[] = [
  "Call",
  "Email",
  "Meeting",
  "Follow-up",
];

const validPriorities: TaskPriority[] = [
  "High",
  "Medium",
  "Low",
];

export async function getDatabaseTasks(): Promise<Task[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const records = await db.orm.public.Task
    .where({ userId: currentUser.id })
    .all();

  return records
    .map((record) => ({
      id: String(record.id),
      title: record.title,
      type: validTypes.includes(record.type as TaskType)
        ? (record.type as TaskType)
        : "Follow-up",
      priority: validPriorities.includes(record.priority as TaskPriority)
        ? (record.priority as TaskPriority)
        : "Medium",
      due: record.due.toISOString(),
      relatedTo: "—",
      done: record.done,
    }))
    .sort(
      (a, b) =>
        new Date(a.due).getTime() - new Date(b.due).getTime()
    );
}
