
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Mail,
  Phone,
  Repeat,
  Plus,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
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
  today: string;
}

export function UpcomingTasks({
  tasks: initialTasks,
  today,
}: UpcomingTasksProps) {
 const router = useRouter();
const [tasks, setTasks] = useState(initialTasks);

useEffect(() => {
  setTasks(initialTasks);
}, [initialTasks]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("Follow-up");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState("10:00");

  function resetForm() {
    setTitle("");
    setType("Follow-up");
    setPriority("Medium");
    setDueDate(today);
    setDueTime("10:00");
    setEditingTaskId(null);
    setError("");
    setShowForm(false);
  }

  async function handleSaveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setLoading(true);

    try {
      const due = new Date(`${dueDate}T${dueTime}:00`);

      const response = await fetch(
        editingTaskId ? `/api/tasks/${editingTaskId}` : "/api/tasks",
        {
          method: editingTaskId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            type,
            priority,
            due: due.toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save task.");
      }

      if (editingTaskId) {
        setTasks((current) =>
          current
            .map((task) =>
              task.id === editingTaskId
                ? {
                    ...task,
                    title: title.trim(),
                    type,
                    priority,
                    due: due.toISOString(),
                  }
                : task
            )
            .sort(
              (a, b) =>
                new Date(a.due).getTime() - new Date(b.due).getTime()
            )
        );
      } else {
        const newTask: Task = {
          id: String(data.task.id),
          title: data.task.title,
          type: data.task.type as TaskType,
          priority: data.task.priority as TaskPriority,
          due: data.task.due,
          relatedTo: "—",
          done: data.task.done,
        };

        setTasks((current) =>
          [...current, newTask].sort(
            (a, b) =>
              new Date(a.due).getTime() - new Date(b.due).getTime()
          )
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEditTask(task: Task) {
    const date = new Date(task.due);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString();

    setEditingTaskId(task.id);
    setTitle(task.title);
    setType(task.type);
    setPriority(task.priority);
    setDueDate(localDate.slice(0, 10));
    setDueTime(localDate.slice(11, 16));
    setError("");
    setShowForm(true);
  }

  async function handleToggleTask(task: Task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, done: !task.done }
            : item
        )
      );
    } catch (err) {
      console.error("Task completion error:", err);
      alert("Could not update task. Please try again.");
    }
  }
async function handleDeleteTask(task: Task) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${task.title}"?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete task.");
    }

    setTasks((current) =>
      current.filter((item) => item.id !== task.id)
    );
  } catch (error) {
    console.error("Task deletion error:", error);
    alert("Could not delete task. Please try again.");
  }
}
  return (
    <div>
      <div className="flex justify-end px-5 pb-3">
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
              setEditingTaskId(null);
              setError("");
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {showForm ? (
            <X className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
          {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveTask}
          className="mx-5 mb-5 space-y-3 rounded-xl border border-line bg-surface-raised p-4"
        >
          <h3 className="text-sm font-semibold text-ink">
            {editingTaskId ? "Edit Task" : "Create New Task"}
          </h3>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Task title
            </label>
            <input
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Follow up with client"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Task type
              </label>
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as TaskType)
                }
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Priority
              </label>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Due date
              </label>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Due time
              </label>
              <input
                required
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingTaskId
                ? "Save Changes"
                : "Create Task"}
          </button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-ink-muted">
          No upcoming tasks.
        </p>
      ) : (
        <ul className="divide-y divide-line/70">
          {tasks.map((task) => {
            const Icon = typeIcon[task.type];
            const isToday = task.due.startsWith(today);

            return (
              <li
                key={task.id}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-raised/50"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-ink-muted ring-1 ring-line">
                  <Icon className="size-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      task.done
                        ? "text-ink-muted line-through"
                        : "text-ink"
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {task.relatedTo} ·{" "}
                    <span className={isToday ? "text-accent-hover" : undefined}>
                      {isToday ? "Today" : formatDate(task.due)}
                    </span>{" "}
                    {formatTime(task.due)} UTC
                  </p>
                </div>

                <Badge tone={priorityTone[task.priority]} className="mt-0.5">
                  {task.priority}
                </Badge>

                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
                  title={
                    task.done
                      ? "Mark as incomplete"
                      : "Mark as completed"
                  }
                  className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-raised hover:text-accent"
                >
                  <CheckCircle2
                    className={`size-5 ${
                      task.done ? "text-emerald-400" : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleEditTask(task)}
                  title="Edit task"
                  className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-raised hover:text-accent"
                >
                  <Pencil className="size-4" />
                </button>
                <button
  type="button"
  onClick={() => handleDeleteTask(task)}
  title="Delete task"
  className="rounded-lg p-2 text-ink-muted transition hover:bg-red-500/10 hover:text-red-400"
>
  <Trash2 className="size-4" />
</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
